"""
API Key Management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from services.api_key_service import api_key_service
from utils.database import get_db
from utils.auth_middleware import get_current_user
from utils.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


# Request/Response Models
class CreateAPIKeyRequest(BaseModel):
    name: str


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str  # Only returned on creation
    created_at: datetime


class APIKeyListItem(BaseModel):
    id: str
    name: str
    last_used_at: datetime | None
    created_at: datetime


@router.post("/", response_model=APIKeyResponse)
async def create_api_key(
    request: CreateAPIKeyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a new API key for the authenticated user.
    
    **Important**: The API key is only shown once. Save it securely.
    """
    try:
        user_id = current_user['user_id']
        
        plain_key, api_key = await api_key_service.create_api_key(
            db=db,
            user_id=user_id,
            name=request.name,
        )
        
        logger.info(f"API key created for user {user_id}: {request.name}")
        
        return APIKeyResponse(
            id=str(api_key.id),
            name=api_key.name,
            key=plain_key,  # Only returned on creation
            created_at=api_key.created_at,
        )
        
    except Exception as e:
        logger.error(f"API key creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create API key")


@router.get("/", response_model=List[APIKeyListItem])
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all API keys for the authenticated user.
    
    Note: The actual key values are not returned for security.
    """
    try:
        user_id = current_user['user_id']
        
        api_keys = await api_key_service.list_api_keys(
            db=db,
            user_id=user_id,
        )
        
        return [
            APIKeyListItem(
                id=str(key.id),
                name=key.name,
                last_used_at=key.last_used_at,
                created_at=key.created_at,
            )
            for key in api_keys
        ]
        
    except Exception as e:
        logger.error(f"API key listing failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to list API keys")


@router.delete("/{api_key_id}")
async def revoke_api_key(
    api_key_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Revoke (delete) an API key.
    
    The API key will be immediately invalidated and cannot be used for authentication.
    """
    try:
        user_id = current_user['user_id']
        
        success = await api_key_service.revoke_api_key(
            db=db,
            api_key_id=api_key_id,
            user_id=user_id,
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="API key not found or you don't have permission to revoke it"
            )
        
        logger.info(f"API key revoked: {api_key_id} by user {user_id}")
        
        return {"message": "API key revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API key revocation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to revoke API key")
