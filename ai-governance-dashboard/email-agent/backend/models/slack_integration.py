"""
Slack Integration model
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from utils.database import Base


class SlackIntegration(Base):
    """Slack integration configuration model."""
    
    __tablename__ = "slack_integrations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    webhook_url = Column(String(2048), nullable=False)
    channel = Column(String(255), nullable=False)
    notify_on_receive = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="slack_integration")

    def __repr__(self):
        return f"<SlackIntegration(user_id={self.user_id}, channel={self.channel})>"
