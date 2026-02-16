"""
Configuration management using Pydantic Settings
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    APP_NAME: str = "Email Agent Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_WORKERS: int = 4
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str
    REDIS_MAX_CONNECTIONS: int = 50

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCOUNT_ID: str
    AWS_SECRETS_MANAGER_PREFIX: str = "email-agent"

    # AWS Cognito
    COGNITO_USER_POOL_ID: str
    COGNITO_CLIENT_ID: str
    COGNITO_REGION: str = "us-east-1"

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # LLM Configuration
    LLM_PROVIDER: str = "anthropic"
    LLM_MODEL: str = "claude-sonnet-4-20250514"
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    API_KEY_LENGTH: int = 32

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_BURST: int = 20

    # Email Polling
    EMAIL_POLL_INTERVAL_MINUTES: int = 5

    # Attachments
    S3_BUCKET_NAME: str
    MAX_ATTACHMENT_SIZE_MB: int = 25
    ATTACHMENT_RETENTION_HOURS: int = 24

    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090


# Global settings instance
settings = Settings()
