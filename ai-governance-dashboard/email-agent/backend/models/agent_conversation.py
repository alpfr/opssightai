"""
Agent Conversation model
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from utils.database import Base


class AgentConversation(Base):
    """Agent conversation history model."""
    
    __tablename__ = "agent_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    messages = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="agent_conversations")

    # Indexes
    __table_args__ = (
        Index("idx_agent_conv_user_updated", "user_id", "updated_at"),
    )

    def __repr__(self):
        return f"<AgentConversation(id={self.id}, user_id={self.user_id})>"
