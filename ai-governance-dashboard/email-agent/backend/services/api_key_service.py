"""
API Key Authentication Service
"""
import secrets
import hashlib
from datetime import datetime
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.api_key import APIKey
from models.user import User
from utils.config import settings
from utils.logging_config import get_logger

logger = get_logger(__name__)


class APIKeyService:
    """Service for API key management."""
    
    @staticmethod
    def generate_api_key() -> str:
        """
        Generate a secure random API key.
        
        Returns:
            API key string
        """
        # Generate random bytes and convert to hex
        key_bytes = secrets.token_bytes(settings.API_KEY_LENGTH)
        api_key = key_bytes.hex()
        return f"eak_{api_key}"  # Prefix with 'eak_' for Email Agent Key
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """
        Hash API key for secure storage.
        
        Args:
            api_key: Plain text API key
            
        Returns:
            Hashed API key
        """
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    async def create_api_key(
        self,
        db: AsyncSession,
        user_id: str,
        name: str,
    ) -> tuple[str, APIKey]:
        """
        Create a new API key for user.
        
        Args:
            db: Database session
            user_id: User ID
            name: Descriptive name for the API key
            
        Returns:
            Tuple of (plain_text_key, api_key_model)
        """
        # Generate API key
        plain_key = self.generate_api_key()
        key_hash = self.hash_api_key(plain_key)
        
        # Create database record
        api_key = APIKey(
            user_id=user_id,
            key_hash=key_hash,
            name=name,
        )
        
        db.add(api_key)
        await db.commit()
        await db.refresh(api_key)
        
        logger.info(f"API key created for user {user_id}: {name}")
        
        return plain_key, api_key
    
    async def verify_api_key(
        self,
        db: AsyncSession,
        api_key: str,
    ) -> Optional[APIKey]:
        """
        Verify API key and return associated key record.
        
        Args:
            db: Database session
            api_key: Plain text API key
            
        Returns:
            APIKey model if valid, None otherwise
        """
        key_hash = self.hash_api_key(api_key)
        
        # Query for API key
        result = await db.execute(
            select(APIKey).where(APIKey.key_hash == key_hash)
        )
        api_key_record = result.scalar_one_or_none()
        
        if api_key_record:
            # Update last used timestamp
            api_key_record.last_used_at = datetime.utcnow()
            await db.commit()
            
            logger.info(f"API key verified for user {api_key_record.user_id}")
        
        return api_key_record
    
    async def list_api_keys(
        self,
        db: AsyncSession,
        user_id: str,
    ) -> List[APIKey]:
        """
        List all API keys for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of APIKey models
        """
        result = await db.execute(
            select(APIKey)
            .where(APIKey.user_id == user_id)
            .order_by(APIKey.created_at.desc())
        )
        return result.scalars().all()
    
    async def revoke_api_key(
        self,
        db: AsyncSession,
        api_key_id: str,
        user_id: str,
    ) -> bool:
        """
        Revoke (delete) an API key.
        
        Args:
            db: Database session
            api_key_id: API key ID to revoke
            user_id: User ID (for authorization check)
            
        Returns:
            True if revoked, False if not found or unauthorized
        """
        result = await db.execute(
            select(APIKey)
            .where(APIKey.id == api_key_id)
            .where(APIKey.user_id == user_id)
        )
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            return False
        
        await db.delete(api_key)
        await db.commit()
        
        logger.info(f"API key revoked: {api_key_id} for user {user_id}")
        return True
    
    async def get_user_from_api_key(
        self,
        db: AsyncSession,
        api_key: str,
    ) -> Optional[User]:
        """
        Get user associated with API key.
        
        Args:
            db: Database session
            api_key: Plain text API key
            
        Returns:
            User model if valid, None otherwise
        """
        api_key_record = await self.verify_api_key(db, api_key)
        
        if not api_key_record:
            return None
        
        # Get user
        result = await db.execute(
            select(User).where(User.id == api_key_record.user_id)
        )
        return result.scalar_one_or_none()


# Global service instance
api_key_service = APIKeyService()
