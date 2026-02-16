"""
AWS Cognito Authentication Service
"""
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional
from datetime import datetime, timedelta
import jwt
from jwt import PyJWKClient
from passlib.context import CryptContext

from utils.config import settings
from utils.logging_config import get_logger

logger = get_logger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CognitoAuthService:
    """Service for AWS Cognito authentication operations."""
    
    def __init__(self):
        self.client = boto3.client('cognito-idp', region_name=settings.COGNITO_REGION)
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.client_id = settings.COGNITO_CLIENT_ID
        
        # JWT verification setup
        self.jwks_url = (
            f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
            f"{self.user_pool_id}/.well-known/jwks.json"
        )
        self.jwks_client = PyJWKClient(self.jwks_url)
    
    async def register_user(self, email: str, password: str) -> Dict:
        """
        Register a new user in Cognito.
        
        Args:
            email: User email address
            password: User password
            
        Returns:
            Dict with user_id and confirmation status
            
        Raises:
            Exception: If registration fails
        """
        try:
            response = self.client.sign_up(
                ClientId=self.client_id,
                Username=email,
                Password=password,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                ]
            )
            
            logger.info(f"User registered successfully: {email}")
            
            return {
                "user_id": response['UserSub'],
                "email": email,
                "confirmed": response.get('UserConfirmed', False),
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"Registration failed for {email}: {error_code} - {error_message}")
            raise Exception(f"Registration failed: {error_message}")
    
    async def confirm_email(self, email: str, confirmation_code: str) -> bool:
        """
        Confirm user email with verification code.
        
        Args:
            email: User email address
            confirmation_code: Verification code sent to email
            
        Returns:
            True if confirmation successful
            
        Raises:
            Exception: If confirmation fails
        """
        try:
            self.client.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code,
            )
            
            logger.info(f"Email confirmed successfully: {email}")
            return True
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Email confirmation failed for {email}: {error_message}")
            raise Exception(f"Confirmation failed: {error_message}")
    
    async def login(self, email: str, password: str) -> Dict:
        """
        Authenticate user and return JWT tokens.
        
        Args:
            email: User email address
            password: User password
            
        Returns:
            Dict with access_token, refresh_token, id_token, expires_in
            
        Raises:
            Exception: If authentication fails
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password,
                }
            )
            
            auth_result = response['AuthenticationResult']
            
            logger.info(f"User logged in successfully: {email}")
            
            return {
                "access_token": auth_result['AccessToken'],
                "refresh_token": auth_result.get('RefreshToken'),
                "id_token": auth_result['IdToken'],
                "expires_in": auth_result['ExpiresIn'],
                "token_type": "Bearer",
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"Login failed for {email}: {error_code} - {error_message}")
            raise Exception(f"Authentication failed: {error_message}")
    
    async def refresh_token(self, refresh_token: str) -> Dict:
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token: Refresh token from previous login
            
        Returns:
            Dict with new access_token, id_token, expires_in
            
        Raises:
            Exception: If refresh fails
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token,
                }
            )
            
            auth_result = response['AuthenticationResult']
            
            logger.info("Token refreshed successfully")
            
            return {
                "access_token": auth_result['AccessToken'],
                "id_token": auth_result['IdToken'],
                "expires_in": auth_result['ExpiresIn'],
                "token_type": "Bearer",
            }
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Token refresh failed: {error_message}")
            raise Exception(f"Token refresh failed: {error_message}")
    
    async def logout(self, access_token: str) -> bool:
        """
        Logout user and invalidate session.
        
        Args:
            access_token: User's access token
            
        Returns:
            True if logout successful
            
        Raises:
            Exception: If logout fails
        """
        try:
            self.client.global_sign_out(
                AccessToken=access_token
            )
            
            logger.info("User logged out successfully")
            return True
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Logout failed: {error_message}")
            raise Exception(f"Logout failed: {error_message}")
    
    async def reset_password(self, email: str) -> bool:
        """
        Initiate password reset flow.
        
        Args:
            email: User email address
            
        Returns:
            True if reset email sent
            
        Raises:
            Exception: If reset initiation fails
        """
        try:
            self.client.forgot_password(
                ClientId=self.client_id,
                Username=email,
            )
            
            logger.info(f"Password reset initiated for: {email}")
            return True
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Password reset failed for {email}: {error_message}")
            raise Exception(f"Password reset failed: {error_message}")
    
    async def confirm_password_reset(
        self,
        email: str,
        confirmation_code: str,
        new_password: str
    ) -> bool:
        """
        Confirm password reset with verification code.
        
        Args:
            email: User email address
            confirmation_code: Verification code sent to email
            new_password: New password
            
        Returns:
            True if password reset successful
            
        Raises:
            Exception: If confirmation fails
        """
        try:
            self.client.confirm_forgot_password(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code,
                Password=new_password,
            )
            
            logger.info(f"Password reset confirmed for: {email}")
            return True
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Password reset confirmation failed for {email}: {error_message}")
            raise Exception(f"Password reset confirmation failed: {error_message}")
    
    def verify_jwt(self, token: str) -> Dict:
        """
        Verify JWT token and extract claims.
        
        Args:
            token: JWT access token or ID token
            
        Returns:
            Dict with user claims (sub, email, cognito:groups, etc.)
            
        Raises:
            Exception: If token is invalid or expired
        """
        try:
            # Get signing key from JWKS
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            
            # Decode token header to check token type
            unverified_header = jwt.get_unverified_header(token)
            unverified_claims = jwt.decode(token, options={"verify_signature": False})
            
            # Check if this is an access token or ID token
            token_use = unverified_claims.get('token_use', 'access')
            
            # Verify and decode token
            # Access tokens don't have 'aud' claim, ID tokens do
            if token_use == 'id':
                claims = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience=self.client_id,
                    options={"verify_exp": True}
                )
            else:  # access token
                claims = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    options={"verify_exp": True, "verify_aud": False}
                )
            
            return claims
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            raise Exception("Token expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {e}")
            raise Exception("Invalid token")
    
    async def get_user_role(self, user_id: str) -> str:
        """
        Get user role from Cognito groups.
        
        Args:
            user_id: User ID (sub from JWT)
            
        Returns:
            User role (Admin or User)
        """
        try:
            response = self.client.admin_list_groups_for_user(
                Username=user_id,
                UserPoolId=self.user_pool_id,
            )
            
            groups = [group['GroupName'] for group in response.get('Groups', [])]
            
            # Check if user is in Admin group
            if 'Admin' in groups or 'Admins' in groups:
                return "Admin"
            
            return "User"
            
        except ClientError as e:
            logger.error(f"Failed to get user role for {user_id}: {e}")
            return "User"  # Default to User role on error
    
    async def add_user_to_group(self, user_id: str, group_name: str) -> bool:
        """
        Add user to a Cognito group.
        
        Args:
            user_id: User ID (sub from JWT)
            group_name: Group name (Admin or User)
            
        Returns:
            True if successful
            
        Raises:
            Exception: If operation fails
        """
        try:
            self.client.admin_add_user_to_group(
                UserPoolId=self.user_pool_id,
                Username=user_id,
                GroupName=group_name,
            )
            
            logger.info(f"User {user_id} added to group {group_name}")
            return True
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"Failed to add user to group: {error_message}")
            raise Exception(f"Failed to add user to group: {error_message}")


# Global service instance
cognito_service = CognitoAuthService()
