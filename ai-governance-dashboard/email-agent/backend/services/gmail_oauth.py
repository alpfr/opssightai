"""
Gmail OAuth Service with AWS Secrets Manager integration
"""
import json
import boto3
from botocore.exceptions import ClientError
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from typing import Dict, Optional
from datetime import datetime, timezone

from utils.config import settings
from utils.logging_config import get_logger

logger = get_logger(__name__)


class OAuthError(Exception):
    """Custom exception for OAuth-related errors."""
    pass


class GmailOAuthService:
    """Service for Gmail OAuth2 authentication and token management."""
    
    # Gmail API scopes
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
    ]
    
    def __init__(self):
        self.secrets_client = boto3.client('secretsmanager', region_name=settings.AWS_REGION)
        self.client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        }
    
    def get_authorization_url(self, user_id: str, state: Optional[str] = None) -> str:
        """
        Generate OAuth2 authorization URL for user to grant access.
        
        Args:
            user_id: User ID for state tracking
            state: Optional state parameter for CSRF protection
            
        Returns:
            Authorization URL to redirect user to
        """
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
        )
        
        # Use user_id as state if not provided
        if not state:
            state = user_id
        
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state,
            prompt='consent',  # Force consent to get refresh token
        )
        
        logger.info(f"Generated authorization URL for user {user_id}")
        return authorization_url
    
    async def exchange_code_for_tokens(
        self,
        code: str,
        user_id: str,
    ) -> Dict:
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            code: Authorization code from OAuth callback
            user_id: User ID to associate tokens with
            
        Returns:
            Dict with token information
            
        Raises:
            OAuthError: If token exchange fails
        """
        try:
            flow = Flow.from_client_config(
                self.client_config,
                scopes=self.SCOPES,
                redirect_uri=settings.GOOGLE_REDIRECT_URI,
            )
            
            # Exchange code for tokens
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Store tokens in Secrets Manager
            await self._store_tokens(user_id, credentials)
            
            logger.info(f"OAuth tokens exchanged and stored for user {user_id}")
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "scopes": credentials.scopes,
                "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            }
            
        except Exception as e:
            logger.error(f"Token exchange failed for user {user_id}: {e}")
            raise OAuthError(f"Failed to exchange authorization code: {str(e)}")
    
    async def get_credentials(self, user_id: str) -> Optional[Credentials]:
        """
        Get Gmail credentials for user from Secrets Manager.
        Automatically refreshes if expired.
        
        Args:
            user_id: User ID
            
        Returns:
            Google Credentials object or None if not found
        """
        try:
            secret_name = f"{settings.AWS_SECRETS_MANAGER_PREFIX}/gmail-oauth/{user_id}"
            
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret_data = json.loads(response['SecretString'])
            
            # Create credentials object
            credentials = Credentials(
                token=secret_data.get('access_token'),
                refresh_token=secret_data.get('refresh_token'),
                token_uri=secret_data.get('token_uri'),
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                scopes=secret_data.get('scopes'),
            )
            
            # Check if token needs refresh
            if credentials.expired and credentials.refresh_token:
                logger.info(f"Refreshing expired token for user {user_id}")
                credentials.refresh(Request())
                
                # Store refreshed tokens
                await self._store_tokens(user_id, credentials)
            
            return credentials
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ResourceNotFoundException':
                logger.info(f"No Gmail OAuth tokens found for user {user_id}")
                return None
            else:
                logger.error(f"Failed to get credentials for user {user_id}: {e}")
                raise
        except Exception as e:
            logger.error(f"Error getting credentials for user {user_id}: {e}")
            raise
    
    async def revoke_tokens(self, user_id: str) -> bool:
        """
        Revoke OAuth tokens and delete from Secrets Manager.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        try:
            # Get credentials to revoke
            credentials = await self.get_credentials(user_id)
            
            if credentials:
                # Revoke with Google
                try:
                    credentials.revoke(Request())
                    logger.info(f"Revoked Gmail OAuth tokens with Google for user {user_id}")
                except Exception as e:
                    logger.warning(f"Failed to revoke with Google (continuing): {e}")
            
            # Delete from Secrets Manager
            secret_name = f"{settings.AWS_SECRETS_MANAGER_PREFIX}/gmail-oauth/{user_id}"
            
            try:
                self.secrets_client.delete_secret(
                    SecretId=secret_name,
                    ForceDeleteWithoutRecovery=True,
                )
                logger.info(f"Deleted Gmail OAuth secret for user {user_id}")
            except ClientError as e:
                if e.response['Error']['Code'] != 'ResourceNotFoundException':
                    raise
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke tokens for user {user_id}: {e}")
            return False
    
    async def _store_tokens(self, user_id: str, credentials: Credentials) -> None:
        """
        Store OAuth tokens in AWS Secrets Manager.
        
        Args:
            user_id: User ID
            credentials: Google Credentials object
        """
        secret_name = f"{settings.AWS_SECRETS_MANAGER_PREFIX}/gmail-oauth/{user_id}"
        
        secret_data = {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": list(credentials.scopes) if credentials.scopes else [],
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        try:
            # Try to update existing secret
            self.secrets_client.update_secret(
                SecretId=secret_name,
                SecretString=json.dumps(secret_data),
            )
            logger.info(f"Updated Gmail OAuth secret for user {user_id}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                # Create new secret
                self.secrets_client.create_secret(
                    Name=secret_name,
                    SecretString=json.dumps(secret_data),
                    Description=f"Gmail OAuth tokens for user {user_id}",
                )
                logger.info(f"Created Gmail OAuth secret for user {user_id}")
            else:
                raise


# Global service instance
gmail_oauth_service = GmailOAuthService()
