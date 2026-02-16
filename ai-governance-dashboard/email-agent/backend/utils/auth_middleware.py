"""
Authentication middleware and decorators
"""
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Callable
from functools import wraps

from services.cognito_auth import cognito_service
from utils.logging_config import get_logger

logger = get_logger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        Dict with user claims
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Verify JWT and extract claims
        claims = cognito_service.verify_jwt(token)
        
        # Add user_id for convenience
        claims['user_id'] = claims.get('sub')
        
        return claims
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=401,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_role(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to get current user with role information.
    
    Args:
        current_user: Current user claims from JWT
        
    Returns:
        Dict with user claims including role
    """
    user_id = current_user['user_id']
    
    # Get user role from Cognito groups
    role = await cognito_service.get_user_role(user_id)
    current_user['role'] = role
    
    return current_user


def require_role(required_role: str):
    """
    Decorator to enforce role-based access control.
    
    Args:
        required_role: Required role (Admin or User)
        
    Returns:
        Dependency function that checks user role
        
    Example:
        @app.get("/admin/users")
        async def get_users(user: dict = Depends(require_role("Admin"))):
            ...
    """
    async def role_checker(
        current_user: dict = Depends(get_current_user_with_role)
    ) -> dict:
        user_role = current_user.get('role', 'User')
        
        # Admin has access to everything
        if user_role == 'Admin':
            return current_user
        
        # Check if user has required role
        if user_role != required_role:
            logger.warning(
                f"Access denied for user {current_user['user_id']}: "
                f"required {required_role}, has {user_role}"
            )
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required role: {required_role}",
            )
        
        return current_user
    
    return role_checker


async def get_optional_user(
    request: Request
) -> Optional[dict]:
    """
    Dependency to get current user if authenticated, None otherwise.
    Useful for endpoints that work with or without authentication.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Dict with user claims or None
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        claims = cognito_service.verify_jwt(token)
        claims['user_id'] = claims.get('sub')
        return claims
    except Exception:
        return None


class AuthMiddleware:
    """
    Middleware for extracting user information from requests.
    Adds user_id to request state if authenticated.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Extract token from headers
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            
            if auth_header.startswith("Bearer "):
                token = auth_header.replace("Bearer ", "")
                try:
                    claims = cognito_service.verify_jwt(token)
                    scope["state"] = {"user_id": claims.get("sub")}
                except Exception:
                    pass
        
        await self.app(scope, receive, send)
