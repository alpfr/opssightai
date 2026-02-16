"""
Agent State Definition for LangGraph
"""
from typing import TypedDict, List, Optional, Any
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    State for the email agent.
    
    This state is passed between nodes in the LangGraph workflow.
    """
    # Conversation messages
    messages: List[BaseMessage]
    
    # User context
    user_id: str
    
    # Gmail service reference (passed to tools)
    gmail_service: Optional[Any]
    
    # Current task being executed
    current_task: Optional[str]
    
    # Task result/output
    task_result: Optional[dict]
    
    # Error information
    error: Optional[str]
    
    # Conversation ID for persistence
    conversation_id: Optional[str]
