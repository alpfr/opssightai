"""
LangGraph Email Agent Implementation
"""
from typing import Dict, List, Any
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from services.agent_state import AgentState
from services.agent_tools import GMAIL_TOOLS
from services.gmail_api import gmail_api_service
from utils.config import settings
from utils.logging_config import get_logger

logger = get_logger(__name__)


class EmailAgent:
    """
    LangGraph-based email agent for natural language email management.
    """
    
    def __init__(self):
        self.llm = self._initialize_llm()
        self.tools = GMAIL_TOOLS
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        self.graph = self._build_graph()
    
    def _initialize_llm(self):
        """
        Initialize the LLM based on configuration.
        
        Returns:
            Configured LLM instance
        """
        if settings.LLM_PROVIDER == "anthropic":
            logger.info("Initializing Anthropic Claude model")
            return ChatAnthropic(
                model=settings.LLM_MODEL,
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
                temperature=0.7,
            )
        elif settings.LLM_PROVIDER == "openai":
            logger.info("Initializing OpenAI GPT model")
            return ChatOpenAI(
                model=settings.LLM_MODEL,
                openai_api_key=settings.OPENAI_API_KEY,
                temperature=0.7,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")
    
    def _build_graph(self) -> StateGraph:
        """
        Build the LangGraph workflow.
        
        Returns:
            Compiled StateGraph
        """
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Create tool node with our tools
        tool_node = ToolNode(self.tools)
        
        # Add nodes
        workflow.add_node("agent", self._agent_node)
        workflow.add_node("tools", tool_node)
        
        # Set entry point
        workflow.set_entry_point("agent")
        
        # Add conditional edges
        workflow.add_conditional_edges(
            "agent",
            self._should_continue,
            {
                "continue": "tools",
                "end": END,
            }
        )
        
        # Add edge from tools back to agent
        workflow.add_edge("tools", "agent")
        
        # Compile the graph
        return workflow.compile()
    
    async def _agent_node(self, state: AgentState) -> AgentState:
        """
        Agent node - processes user input and decides on actions.
        
        Args:
            state: Current agent state
            
        Returns:
            Updated state
        """
        try:
            # Get system prompt
            system_prompt = self._get_system_prompt()
            
            # Prepare messages
            messages = [SystemMessage(content=system_prompt)] + state["messages"]
            
            # Call LLM with tools
            response = await self.llm_with_tools.ainvoke(messages)
            
            # Update state with response
            state["messages"].append(response)
            
            logger.info(f"Agent response generated for user {state['user_id']}")
            
            return state
            
        except Exception as e:
            logger.error(f"Error in agent node: {e}")
            state["error"] = str(e)
            return state
    
    async def _tools_node(self, state: AgentState) -> AgentState:
        """
        Tools node - executes tool calls from the agent.
        
        Note: This is now handled by LangGraph's ToolNode, but kept for reference.
        
        Args:
            state: Current agent state
            
        Returns:
            Updated state
        """
        # This is now handled by the ToolNode in the graph
        return state
    
    def _should_continue(self, state: AgentState) -> str:
        """
        Determine if the agent should continue or end.
        
        Args:
            state: Current agent state
            
        Returns:
            "continue" or "end"
        """
        # Check if there's an error
        if state.get("error"):
            return "end"
        
        # Check if the last message has tool calls
        last_message = state["messages"][-1] if state["messages"] else None
        
        if last_message and hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        
        return "end"
    
    def _get_system_prompt(self) -> str:
        """
        Get the system prompt for the agent.
        
        Returns:
            System prompt string
        """
        return """You are an intelligent email management assistant with access to Gmail.

Your capabilities include:
- Searching for emails using Gmail query syntax
- Reading email content and threads
- Sending emails (plain text or HTML)
- Creating and managing drafts
- Applying and removing labels
- Providing summaries and insights about emails

When users ask you to perform email operations:
1. Understand their intent clearly
2. If the request is ambiguous, ask clarifying questions
3. Use the appropriate tools to complete the task
4. Provide clear, natural language responses about what you did
5. If you encounter errors, explain them in user-friendly terms

Gmail query syntax examples:
- from:sender@example.com - emails from a specific sender
- subject:meeting - emails with "meeting" in subject
- is:unread - unread emails
- has:attachment - emails with attachments
- after:2024/01/01 - emails after a date
- label:important - emails with a specific label

Always be helpful, concise, and accurate. Protect user privacy and never share sensitive information."""
    
    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        history: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Process a chat message from the user.
        
        Args:
            user_id: User ID
            message: User message
            conversation_id: Optional conversation ID for context
            history: Optional conversation history
            
        Returns:
            Dict with response and metadata
        """
        try:
            # Initialize state
            messages = []
            
            # Add history if provided
            if history:
                for msg in history:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))
            
            # Add current message
            messages.append(HumanMessage(content=message))
            
            # Create initial state
            initial_state: AgentState = {
                "messages": messages,
                "user_id": user_id,
                "gmail_service": gmail_api_service,
                "current_task": None,
                "task_result": None,
                "error": None,
                "conversation_id": conversation_id,
            }
            
            # Run the graph
            final_state = await self.graph.ainvoke(initial_state)
            
            # Extract response
            last_message = final_state["messages"][-1]
            response_content = last_message.content if hasattr(last_message, "content") else str(last_message)
            
            logger.info(f"Chat completed for user {user_id}")
            
            return {
                "response": response_content,
                "conversation_id": conversation_id,
                "error": final_state.get("error"),
                "task_result": final_state.get("task_result"),
            }
            
        except Exception as e:
            logger.error(f"Error in chat for user {user_id}: {e}")
            return {
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "error": str(e),
            }


# Global agent instance
email_agent = EmailAgent()
