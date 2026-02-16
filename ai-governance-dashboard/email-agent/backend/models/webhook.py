"""
Webhook models
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Index, ARRAY, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from utils.database import Base


class Webhook(Base):
    """Webhook configuration model."""
    
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(2048), nullable=False)
    event_types = Column(ARRAY(Text), nullable=False)
    secret = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="webhooks")
    deliveries = relationship("WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("idx_user_active", "user_id", "is_active"),
    )

    def __repr__(self):
        return f"<Webhook(id={self.id}, url={self.url})>"


class WebhookDelivery(Base):
    """Webhook delivery log model."""
    
    __tablename__ = "webhook_deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id = Column(UUID(as_uuid=True), ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False)
    status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    delivered_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    webhook = relationship("Webhook", back_populates="deliveries")

    # Indexes
    __table_args__ = (
        Index("idx_webhook_delivered", "webhook_id", "delivered_at"),
    )

    def __repr__(self):
        return f"<WebhookDelivery(id={self.id}, status_code={self.status_code})>"
