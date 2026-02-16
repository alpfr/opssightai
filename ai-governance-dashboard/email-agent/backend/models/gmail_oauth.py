"""
Gmail OAuth model
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from utils.database import Base


class GmailOAuth(Base):
    """Gmail OAuth connection status model."""
    
    __tablename__ = "gmail_oauth"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    is_connected = Column(Boolean, nullable=False, default=False)
    email = Column(String(255), nullable=True)
    
    # OAuth tokens
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    scopes = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    connected_at = Column(DateTime, nullable=True)
    disconnected_at = Column(DateTime, nullable=True)
    last_sync = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="gmail_oauth")

    def __repr__(self):
        return f"<GmailOAuth(user_id={self.user_id}, is_connected={self.is_connected})>"
