"""
Gmail OAuth model
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from utils.database import Base


class GmailOAuth(Base):
    """Gmail OAuth connection status model."""
    
    __tablename__ = "gmail_oauth"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    is_connected = Column(Boolean, nullable=False, default=False)
    email_address = Column(String(255), nullable=True)
    connected_at = Column(DateTime, nullable=True)
    last_sync = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="gmail_oauth")

    def __repr__(self):
        return f"<GmailOAuth(user_id={self.user_id}, is_connected={self.is_connected})>"
