"""
Gmail OAuth API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from services.gmail_oauth import gmail_oauth_service
from utils.auth_middleware import get_current_user
from utils.logging_config import get_logger
from utils.database import get_db
from models.gmail_oauth import GmailOAuth
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

logger = get_logger(__name__)

router = APIRouter()


class OAuthStatusResponse(BaseModel):
    """Response model for OAuth connection status."""
    connected: bool
    email: Optional[str] = None
    connected_at: Optional[datetime] = None


@router.get("/oauth/authorize")
async def get_authorization_url(
    current_user: dict = Depends(get_current_user),
):
    """
    Generate Gmail OAuth authorization URL.
    
    Returns:
        Authorization URL to redirect user to
    """
    user_id = current_user['user_id']
    
    try:
        authorization_url = gmail_oauth_service.get_authorization_url(user_id)
        
        logger.info(f"Generated OAuth URL for user {user_id}")
        
        return {
            "authorization_url": authorization_url,
            "message": "Redirect user to this URL to grant Gmail access",
        }
        
    except Exception as e:
        logger.error(f"Failed to generate OAuth URL for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate authorization URL",
        )


@router.get("/oauth/callback")
async def oauth_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: str = Query(..., description="State parameter containing user_id"),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle OAuth callback from Google.
    Exchange authorization code for tokens and store in database.
    
    Args:
        code: Authorization code from Google
        state: State parameter (contains user_id)
        db: Database session
        
    Returns:
        Success message
    """
    user_id = state  # State contains user_id
    
    try:
        # Exchange code for tokens
        token_info = await gmail_oauth_service.exchange_code_for_tokens(code, user_id, db)
        
        # Update database with connection status
        from sqlalchemy import select, update
        
        # Check if record exists
        stmt = select(GmailOAuth).where(GmailOAuth.user_id == user_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing record
            stmt = (
                update(GmailOAuth)
                .where(GmailOAuth.user_id == user_id)
                .values(
                    is_connected=True,
                    email=token_info.get('email', 'unknown@gmail.com'),
                    connected_at=datetime.now(),
                    updated_at=datetime.now(),
                )
            )
            await db.execute(stmt)
        else:
            # Create new record
            gmail_oauth = GmailOAuth(
                user_id=user_id,
                is_connected=True,
                email=token_info.get('email', 'unknown@gmail.com'),
                connected_at=datetime.now(),
            )
            db.add(gmail_oauth)
        
        await db.commit()
        
        logger.info(f"OAuth callback successful for user {user_id}")
        
        return {
            "success": True,
            "message": "Gmail account connected successfully",
            "scopes": token_info.get('scopes', []),
        }
        
    except Exception as e:
        logger.error(f"OAuth callback failed for user {user_id}: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to complete OAuth flow: {str(e)}",
        )


@router.delete("/oauth/disconnect")
async def disconnect_gmail(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Disconnect Gmail account and revoke OAuth tokens.
    
    Returns:
        Success message
    """
    user_id = current_user['user_id']
    
    try:
        # Revoke tokens from Google and database
        success = await gmail_oauth_service.revoke_tokens(user_id, db)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to revoke OAuth tokens",
            )
        
        # Update database
        stmt = (
            update(GmailOAuth)
            .where(GmailOAuth.user_id == user_id)
            .values(
                is_connected=False,
                disconnected_at=datetime.now(),
                updated_at=datetime.now(),
            )
        )
        await db.execute(stmt)
        await db.commit()
        
        logger.info(f"Gmail disconnected for user {user_id}")
        
        return {
            "success": True,
            "message": "Gmail account disconnected successfully",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disconnect Gmail for user {user_id}: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to disconnect Gmail account",
        )


@router.get("/oauth/status", response_model=OAuthStatusResponse)
async def get_oauth_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get Gmail OAuth connection status for current user.
    
    Returns:
        Connection status with email and timestamp
    """
    user_id = current_user['user_id']
    
    try:
        # Query database for connection status
        stmt = select(GmailOAuth).where(GmailOAuth.user_id == user_id)
        result = await db.execute(stmt)
        oauth_record = result.scalar_one_or_none()
        
        if not oauth_record:
            return OAuthStatusResponse(connected=False)
        
        return OAuthStatusResponse(
            connected=oauth_record.is_connected,
            email=oauth_record.email,
            connected_at=oauth_record.connected_at,
        )
        
    except Exception as e:
        logger.error(f"Failed to get OAuth status for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve OAuth status",
        )
