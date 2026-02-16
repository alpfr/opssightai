"""
Gmail OAuth Service with Database storage
"""
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from typing import Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from utils.config import settings
from utils.logging_config import get_logger
from utils.database import get_db

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
        db: AsyncSession,
    ) -> Dict:
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            code: Authorization code from OAuth callback
            user_id: User ID to associate tokens with
            db: Database session
            
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
            
            # Store tokens in database
            await self._store_tokens(user_id, credentials, db)
            
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
    
    async def get_credentials(self, user_id: str, db: AsyncSession) -> Optional[Credentials]:
        """
        Get Gmail credentials for user from database.
        Automatically refreshes if expired.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Google Credentials object or None if not found
        """
        try:
            from models.gmail_oauth import GmailOAuth
            
            # Get tokens from database
            stmt = select(GmailOAuth).where(GmailOAuth.user_id == user_id)
            result = await db.execute(stmt)
            oauth_record = result.scalar_one_or_none()
            
            if not oauth_record or not oauth_record.access_token:
                logger.info(f"No Gmail OAuth tokens found for user {user_id}")
                return None
            
            # Create credentials object
            credentials = Credentials(
                token=oauth_record.access_token,
                refresh_token=oauth_record.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                scopes=self.SCOPES,
            )
            
            # Check if token needs refresh
            if credentials.expired and credentials.refresh_token:
                logger.info(f"Refreshing expired token for user {user_id}")
                credentials.refresh(Request())
                
                # Store refreshed tokens
                await self._store_tokens(user_id, credentials, db)
            
            return credentials
            
        except Exception as e:
            logger.error(f"Error getting credentials for user {user_id}: {e}")
            raise
    
    async def revoke_tokens(self, user_id: str, db: AsyncSession) -> bool:
        """
        Revoke OAuth tokens and delete from database.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            # Get credentials to revoke
            credentials = await self.get_credentials(user_id, db)
            
            if credentials:
                # Revoke with Google
                try:
                    credentials.revoke(Request())
                    logger.info(f"Revoked Gmail OAuth tokens with Google for user {user_id}")
                except Exception as e:
                    logger.warning(f"Failed to revoke with Google (continuing): {e}")
            
            # Clear tokens from database
            from models.gmail_oauth import GmailOAuth
            stmt = (
                update(GmailOAuth)
                .where(GmailOAuth.user_id == user_id)
                .values(
                    access_token=None,
                    refresh_token=None,
                    token_expiry=None,
                    is_connected=False,
                    disconnected_at=datetime.now(),
                    updated_at=datetime.now(),
                )
            )
            await db.execute(stmt)
            await db.commit()
            
            logger.info(f"Cleared Gmail OAuth tokens for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke tokens for user {user_id}: {e}")
            return False
    
    async def _store_tokens(self, user_id: str, credentials: Credentials, db: AsyncSession) -> None:
        """
        Store OAuth tokens in database.
        
        Args:
            user_id: User ID
            credentials: Google Credentials object
            db: Database session
        """
        from models.gmail_oauth import GmailOAuth
        
        # Check if record exists
        stmt = select(GmailOAuth).where(GmailOAuth.user_id == user_id)
        result = await db.execute(stmt)
        oauth_record = result.scalar_one_or_none()
        
        if oauth_record:
            # Update existing record
            stmt = (
                update(GmailOAuth)
                .where(GmailOAuth.user_id == user_id)
                .values(
                    access_token=credentials.token,
                    refresh_token=credentials.refresh_token,
                    token_expiry=credentials.expiry,
                    scopes=json.dumps(list(credentials.scopes)) if credentials.scopes else None,
                    updated_at=datetime.now(),
                )
            )
            await db.execute(stmt)
        else:
            # Create new record
            new_oauth = GmailOAuth(
                user_id=user_id,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expiry=credentials.expiry,
                scopes=json.dumps(list(credentials.scopes)) if credentials.scopes else None,
            )
            db.add(new_oauth)
        
        await db.commit()
        logger.info(f"Stored Gmail OAuth tokens for user {user_id}")


# Global service instance
gmail_oauth_service = GmailOAuthService()
