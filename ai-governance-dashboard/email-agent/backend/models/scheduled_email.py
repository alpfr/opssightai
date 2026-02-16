"""
Scheduled Email model
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from utils.database import Base


class ScheduledEmail(Base):
    """Scheduled email model."""
    
    __tablename__ = "scheduled_emails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_addresses = Column(ARRAY(Text), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    attachments = Column(ARRAY(Text), nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="scheduled_emails")

    # Indexes
    __table_args__ = (
        Index("idx_user_scheduled", "user_id", "scheduled_time"),
        Index("idx_status_time", "status", "scheduled_time"),
    )

    def __repr__(self):
        return f"<ScheduledEmail(id={self.id}, status={self.status})>"
