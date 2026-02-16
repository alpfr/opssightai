"""
LangChain Tools for Gmail Operations
"""
from typing import List, Optional
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from services.gmail_api import gmail_api_service, GmailAPIError
from utils.logging_config import get_logger

logger = get_logger(__name__)


# Tool Input Schemas

class SearchEmailsInput(BaseModel):
    """Input for search_emails_tool."""
    user_id: str = Field(description="User ID")
    query: str = Field(description="Gmail search query (e.g., 'from:sender@example.com subject:meeting')")
    max_results: int = Field(default=10, description="Maximum number of results to return")


class ReadEmailInput(BaseModel):
    """Input for read_email_tool."""
    user_id: str = Field(description="User ID")
    email_id: str = Field(description="Gmail message ID")


class SendEmailInput(BaseModel):
    """Input for send_email_tool."""
    user_id: str = Field(description="User ID")
    to: List[str] = Field(description="List of recipient email addresses")
    subject: str = Field(description="Email subject")
    body: str = Field(description="Email body content")
    html: bool = Field(default=False, description="Whether body is HTML")


class CreateDraftInput(BaseModel):
    """Input for create_draft_tool."""
    user_id: str = Field(description="User ID")
    to: List[str] = Field(description="List of recipient email addresses")
    subject: str = Field(description="Email subject")
    body: str = Field(description="Email body content")
    html: bool = Field(default=False, description="Whether body is HTML")


class ApplyLabelInput(BaseModel):
    """Input for apply_label_tool."""
    user_id: str = Field(description="User ID")
    email_id: str = Field(description="Gmail message ID")
    label_ids: List[str] = Field(description="List of label IDs to apply")


class GetThreadInput(BaseModel):
    """Input for get_thread_tool."""
    user_id: str = Field(description="User ID")
    thread_id: str = Field(description="Gmail thread ID")


# Tool Implementations

@tool(args_schema=SearchEmailsInput)
async def search_emails_tool(user_id: str, query: str, max_results: int = 10) -> str:
    """
    Search for emails using Gmail query syntax.
    
    Use this tool to find emails based on sender, subject, date, labels, etc.
    
    Query examples:
    - from:sender@example.com
    - subject:meeting
    - is:unread
    - has:attachment
    - after:2024/01/01
    - label:important
    """
    try:
        result = await gmail_api_service.search_emails(
            user_id=user_id,
            query=query,
            max_results=max_results,
        )
        
        messages = result.get('messages', [])
        
        if not messages:
            return f"No emails found matching query: {query}"
        
        # Format results
        response = f"Found {len(messages)} emails matching '{query}':\n\n"
        for i, msg in enumerate(messages[:10], 1):  # Limit to 10 for readability
            response += f"{i}. Email ID: {msg['id']}\n"
        
        if len(messages) > 10:
            response += f"\n... and {len(messages) - 10} more emails"
        
        return response
        
    except GmailAPIError as e:
        logger.error(f"Error searching emails: {e}")
        return f"Error searching emails: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in search_emails_tool: {e}")
        return f"Unexpected error: {str(e)}"


@tool(args_schema=ReadEmailInput)
async def read_email_tool(user_id: str, email_id: str) -> str:
    """
    Read the full content of an email by its ID.
    
    Use this tool to get the complete details of a specific email including
    sender, subject, body, and metadata.
    """
    try:
        email = await gmail_api_service.get_email(
            user_id=user_id,
            email_id=email_id,
            format='full',
        )
        
        # Extract key information
        payload = email.get('payload', {})
        headers = {h['name']: h['value'] for h in payload.get('headers', [])}
        
        from_addr = headers.get('From', 'Unknown')
        to_addr = headers.get('To', 'Unknown')
        subject = headers.get('Subject', 'No Subject')
        date = headers.get('Date', 'Unknown')
        
        # Extract body (simplified - would need more robust parsing for multipart)
        body = "Body content not available"
        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain':
                    body_data = part.get('body', {}).get('data', '')
                    if body_data:
                        import base64
                        body = base64.urlsafe_b64decode(body_data).decode('utf-8', errors='ignore')
                        break
        elif 'body' in payload:
            body_data = payload['body'].get('data', '')
            if body_data:
                import base64
                body = base64.urlsafe_b64decode(body_data).decode('utf-8', errors='ignore')
        
        response = f"""Email Details:
From: {from_addr}
To: {to_addr}
Subject: {subject}
Date: {date}

Body:
{body[:500]}{'...' if len(body) > 500 else ''}
"""
        
        return response
        
    except GmailAPIError as e:
        logger.error(f"Error reading email: {e}")
        return f"Error reading email: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in read_email_tool: {e}")
        return f"Unexpected error: {str(e)}"


@tool(args_schema=SendEmailInput)
async def send_email_tool(user_id: str, to: List[str], subject: str, body: str, html: bool = False) -> str:
    """
    Send an email to one or more recipients.
    
    Use this tool to send emails on behalf of the user.
    """
    try:
        result = await gmail_api_service.send_email(
            user_id=user_id,
            to=to,
            subject=subject,
            body=body,
            html=html,
        )
        
        message_id = result.get('id', 'unknown')
        recipients = ', '.join(to)
        
        return f"Email sent successfully to {recipients}. Message ID: {message_id}"
        
    except GmailAPIError as e:
        logger.error(f"Error sending email: {e}")
        return f"Error sending email: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in send_email_tool: {e}")
        return f"Unexpected error: {str(e)}"


@tool(args_schema=CreateDraftInput)
async def create_draft_tool(user_id: str, to: List[str], subject: str, body: str, html: bool = False) -> str:
    """
    Create an email draft without sending it.
    
    Use this tool to prepare emails that the user can review and send later.
    """
    try:
        result = await gmail_api_service.create_draft(
            user_id=user_id,
            to=to,
            subject=subject,
            body=body,
            html=html,
        )
        
        draft_id = result.get('id', 'unknown')
        recipients = ', '.join(to)
        
        return f"Draft created successfully for {recipients}. Draft ID: {draft_id}"
        
    except GmailAPIError as e:
        logger.error(f"Error creating draft: {e}")
        return f"Error creating draft: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in create_draft_tool: {e}")
        return f"Unexpected error: {str(e)}"


@tool(args_schema=ApplyLabelInput)
async def apply_label_tool(user_id: str, email_id: str, label_ids: List[str]) -> str:
    """
    Apply labels to an email.
    
    Use this tool to organize emails by adding labels (like folders or tags).
    Common label IDs: INBOX, SPAM, TRASH, UNREAD, STARRED, IMPORTANT
    """
    try:
        result = await gmail_api_service.add_labels(
            user_id=user_id,
            email_id=email_id,
            label_ids=label_ids,
        )
        
        labels_str = ', '.join(label_ids)
        
        return f"Labels applied successfully: {labels_str}"
        
    except GmailAPIError as e:
        logger.error(f"Error applying labels: {e}")
        return f"Error applying labels: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in apply_label_tool: {e}")
        return f"Unexpected error: {str(e)}"


@tool(args_schema=GetThreadInput)
async def get_thread_tool(user_id: str, thread_id: str) -> str:
    """
    Get an email thread (conversation) with all messages.
    
    Use this tool to see the full conversation history for an email thread.
    """
    try:
        thread = await gmail_api_service.get_thread(
            user_id=user_id,
            thread_id=thread_id,
        )
        
        messages = thread.get('messages', [])
        
        response = f"Thread with {len(messages)} messages:\n\n"
        
        for i, msg in enumerate(messages, 1):
            payload = msg.get('payload', {})
            headers = {h['name']: h['value'] for h in payload.get('headers', [])}
            
            from_addr = headers.get('From', 'Unknown')
            subject = headers.get('Subject', 'No Subject')
            date = headers.get('Date', 'Unknown')
            
            response += f"{i}. From: {from_addr}\n"
            response += f"   Subject: {subject}\n"
            response += f"   Date: {date}\n"
            response += f"   Message ID: {msg['id']}\n\n"
        
        return response
        
    except GmailAPIError as e:
        logger.error(f"Error getting thread: {e}")
        return f"Error getting thread: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in get_thread_tool: {e}")
        return f"Unexpected error: {str(e)}"


# Export all tools
GMAIL_TOOLS = [
    search_emails_tool,
    read_email_tool,
    send_email_tool,
    create_draft_tool,
    apply_label_tool,
    get_thread_tool,
]
