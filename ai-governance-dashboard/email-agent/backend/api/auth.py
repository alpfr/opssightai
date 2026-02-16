"""
Authentication API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from services.cognito_auth import cognito_service
from utils.database import get_db
from utils.password_validator import password_validator
from utils.logging_config import get_logger
from models.user import User
from sqlalchemy import select

logger = get_logger(__name__)

router = APIRouter()


# Request/Response Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    user_id: str
    email: str
    confirmed: bool
    message: str


class ConfirmEmailRequest(BaseModel):
    email: EmailStr
    confirmation_code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    expires_in: int
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    id_token: str
    expires_in: int
    token_type: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ConfirmResetPasswordRequest(BaseModel):
    email: EmailStr
    confirmation_code: str
    new_password: str


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user.
    
    - Validates password complexity
    - Creates user in Cognito
    - Creates user record in database
    - Sends verification email
    """
    # Validate password complexity
    is_valid, errors = password_validator.validate(request.password)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Password does not meet complexity requirements",
                "errors": errors,
                "requirements": password_validator.get_requirements_text(),
            }
        )
    
    try:
        # Register in Cognito
        cognito_result = await cognito_service.register_user(
            email=request.email,
            password=request.password,
        )
        
        # Create user in database
        user = User(
            id=cognito_result['user_id'],
            email=request.email,
            role="User",  # Default role
        )
        db.add(user)
        await db.commit()
        
        logger.info(f"User registered: {request.email}")
        
        return RegisterResponse(
            user_id=cognito_result['user_id'],
            email=cognito_result['email'],
            confirmed=cognito_result['confirmed'],
            message="Registration successful. Please check your email for verification code.",
        )
        
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm-email")
async def confirm_email(request: ConfirmEmailRequest):
    """
    Confirm user email with verification code.
    """
    try:
        await cognito_service.confirm_email(
            email=request.email,
            confirmation_code=request.confirmation_code,
        )
        
        return {"message": "Email confirmed successfully. You can now log in."}
        
    except Exception as e:
        logger.error(f"Email confirmation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT tokens.
    """
    try:
        tokens = await cognito_service.login(
            email=request.email,
            password=request.password,
        )
        
        return LoginResponse(**tokens)
        
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    """
    try:
        tokens = await cognito_service.refresh_token(
            refresh_token=request.refresh_token,
        )
        
        return RefreshTokenResponse(**tokens)
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout(access_token: str):
    """
    Logout user and invalidate session.
    """
    try:
        await cognito_service.logout(access_token=access_token)
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Initiate password reset flow.
    Sends verification code to user's email.
    """
    try:
        await cognito_service.reset_password(email=request.email)
        
        return {"message": "Password reset code sent to your email"}
        
    except Exception as e:
        logger.error(f"Password reset failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm-reset-password")
async def confirm_reset_password(request: ConfirmResetPasswordRequest):
    """
    Confirm password reset with verification code.
    """
    # Validate new password complexity
    is_valid, errors = password_validator.validate(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Password does not meet complexity requirements",
                "errors": errors,
                "requirements": password_validator.get_requirements_text(),
            }
        )
    
    try:
        await cognito_service.confirm_password_reset(
            email=request.email,
            confirmation_code=request.confirmation_code,
            new_password=request.new_password,
        )
        
        return {"message": "Password reset successful. You can now log in with your new password."}
        
    except Exception as e:
        logger.error(f"Password reset confirmation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
