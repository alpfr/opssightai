"""
AI Agent API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

from services.email_agent import email_agent
from utils.auth_middleware import get_current_user
from utils.logging_config import get_logger
from utils.database import get_db
from models.agent_conversation import AgentConversation
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

logger = get_logger(__name__)

router = APIRouter()


# Request/Response Models

class ChatMessage(BaseModel):
    """Single chat message."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request model for chat."""
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat."""
    response: str
    conversation_id: str
    error: Optional[str] = None


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    conversation_id: str
    messages: List[Dict]
    created_at: datetime
    updated_at: datetime


# Agent Chat Endpoints

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Chat with the AI agent for natural language email management.
    
    The agent can:
    - Search for emails
    - Read email content
    - Send emails
    - Create drafts
    - Apply labels
    - Get conversation threads
    
    Examples:
    - "Show me unread emails from john@example.com"
    - "Send an email to jane@example.com saying hello"
    - "Create a draft to the team about the meeting"
    - "What emails did I get today?"
    """
    user_id = current_user['user_id']
    
    try:
        # Get or create conversation
        conversation_id = request.conversation_id
        conversation_history = []
        
        if conversation_id:
            # Load existing conversation
            stmt = select(AgentConversation).where(
                AgentConversation.conversation_id == conversation_id,
                AgentConversation.user_id == user_id,
            )
            result = await db.execute(stmt)
            conversation = result.scalar_one_or_none()
            
            if conversation:
                conversation_history = conversation.messages or []
            else:
                # Conversation not found, create new one
                conversation_id = str(uuid.uuid4())
        else:
            # Create new conversation
            conversation_id = str(uuid.uuid4())
        
        # Call the agent
        agent_response = await email_agent.chat(
            user_id=user_id,
            message=request.message,
            conversation_id=conversation_id,
            history=conversation_history,
        )
        
        # Update conversation in database
        # Add user message
        conversation_history.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
        })
        
        # Add agent response
        conversation_history.append({
            "role": "assistant",
            "content": agent_response["response"],
            "timestamp": datetime.now().isoformat(),
        })
        
        # Save to database
        stmt = select(AgentConversation).where(
            AgentConversation.conversation_id == conversation_id
        )
        result = await db.execute(stmt)
        existing_conversation = result.scalar_one_or_none()
        
        if existing_conversation:
            # Update existing
            existing_conversation.messages = conversation_history
            existing_conversation.updated_at = datetime.now()
        else:
            # Create new
            new_conversation = AgentConversation(
                conversation_id=conversation_id,
                user_id=user_id,
                messages=conversation_history,
            )
            db.add(new_conversation)
        
        await db.commit()
        
        logger.info(f"Agent chat completed for user {user_id}, conversation {conversation_id}")
        
        return ChatResponse(
            response=agent_response["response"],
            conversation_id=conversation_id,
            error=agent_response.get("error"),
        )
        
    except Exception as e:
        logger.error(f"Error in agent chat for user {user_id}: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request",
        )


@router.get("/history", response_model=List[ConversationHistoryResponse])
async def get_conversation_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """
    Get conversation history for the current user.
    
    Returns the most recent conversations.
    """
    user_id = current_user['user_id']
    
    try:
        stmt = (
            select(AgentConversation)
            .where(AgentConversation.user_id == user_id)
            .order_by(AgentConversation.updated_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        conversations = result.scalars().all()
        
        response = []
        for conv in conversations:
            response.append(ConversationHistoryResponse(
                conversation_id=conv.conversation_id,
                messages=conv.messages or [],
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            ))
        
        logger.info(f"Retrieved {len(response)} conversations for user {user_id}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting conversation history for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve conversation history",
        )


@router.get("/history/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_by_id(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific conversation by ID.
    """
    user_id = current_user['user_id']
    
    try:
        stmt = select(AgentConversation).where(
            AgentConversation.conversation_id == conversation_id,
            AgentConversation.user_id == user_id,
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return ConversationHistoryResponse(
            conversation_id=conversation.conversation_id,
            messages=conversation.messages or [],
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id} for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve conversation",
        )


@router.delete("/history/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a conversation.
    """
    user_id = current_user['user_id']
    
    try:
        stmt = select(AgentConversation).where(
            AgentConversation.conversation_id == conversation_id,
            AgentConversation.user_id == user_id,
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        await db.delete(conversation)
        await db.commit()
        
        logger.info(f"Deleted conversation {conversation_id} for user {user_id}")
        
        return {
            "success": True,
            "message": "Conversation deleted successfully",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id} for user {user_id}: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete conversation",
        )
