"""
API Routes - Main router aggregating all endpoint modules
"""
from fastapi import APIRouter

api_router = APIRouter()

# TODO: Import and include route modules as they are implemented
# from api.auth import router as auth_router
# from api.gmail import router as gmail_router
# from api.emails import router as emails_router
# from api.agent import router as agent_router
# from api.integrations import router as integrations_router
# from api.admin import router as admin_router

# api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(gmail_router, prefix="/gmail", tags=["Gmail OAuth"])
# api_router.include_router(emails_router, prefix="/emails", tags=["Email Management"])
# api_router.include_router(agent_router, prefix="/agent", tags=["AI Agent"])
# api_router.include_router(integrations_router, prefix="/integrations", tags=["Integrations"])
# api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])


@api_router.get("/")
async def api_root():
    """API root endpoint."""
    return {
        "message": "Email Agent Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }
