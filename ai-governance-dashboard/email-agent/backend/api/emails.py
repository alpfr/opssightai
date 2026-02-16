"""
Email Management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from services.gmail_api import gmail_api_service, GmailAPIError
from utils.auth_middleware import get_current_user
from utils.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


# Request/Response Models

class EmailSearchRequest(BaseModel):
    """Request model for email search."""
    query: str = ""
    max_results: int = 100
    page_token: Optional[str] = None


class EmailSearchResponse(BaseModel):
    """Response model for email search."""
    messages: List[dict]
    next_page_token: Optional[str] = None
    result_size_estimate: int


class SendEmailRequest(BaseModel):
    """Request model for sending email."""
    to: List[EmailStr]
    subject: str
    body: str
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None
    html: bool = False


class CreateDraftRequest(BaseModel):
    """Request model for creating draft."""
    to: List[EmailStr]
    subject: str
    body: str
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None
    html: bool = False


class UpdateDraftRequest(BaseModel):
    """Request model for updating draft."""
    to: List[EmailStr]
    subject: str
    body: str
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None
    html: bool = False


class AddLabelsRequest(BaseModel):
    """Request model for adding labels."""
    label_ids: List[str]


class RemoveLabelsRequest(BaseModel):
    """Request model for removing labels."""
    label_ids: List[str]


# Email Search and Retrieval Endpoints

@router.get("/search", response_model=EmailSearchResponse)
async def search_emails(
    query: str = Query("", description="Gmail search query"),
    max_results: int = Query(100, ge=1, le=500, description="Maximum results to return"),
    page_token: Optional[str] = Query(None, description="Pagination token"),
    current_user: dict = Depends(get_current_user),
):
    """
    Search emails using Gmail query syntax.
    
    Query examples:
    - from:sender@example.com
    - subject:meeting
    - is:unread
    - has:attachment
    - after:2024/01/01
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.search_emails(
            user_id=user_id,
            query=query,
            max_results=max_results,
            page_token=page_token,
        )
        
        return EmailSearchResponse(
            messages=result['messages'],
            next_page_token=result.get('nextPageToken'),
            result_size_estimate=result.get('resultSizeEstimate', 0),
        )
        
    except GmailAPIError as e:
        logger.error(f"Failed to search emails for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error searching emails for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to search emails")


@router.get("/{email_id}")
async def get_email(
    email_id: str,
    format: str = Query("full", description="Response format: full, metadata, minimal, raw"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get full email details by ID.
    """
    user_id = current_user['user_id']
    
    try:
        email = await gmail_api_service.get_email(
            user_id=user_id,
            email_id=email_id,
            format=format,
        )
        
        return email
        
    except GmailAPIError as e:
        logger.error(f"Failed to get email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve email")


@router.get("/{email_id}/thread")
async def get_email_thread(
    email_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get email thread (conversation) containing the specified email.
    """
    user_id = current_user['user_id']
    
    try:
        # First get the email to extract thread_id
        email = await gmail_api_service.get_email(
            user_id=user_id,
            email_id=email_id,
            format='metadata',
        )
        
        thread_id = email.get('threadId')
        if not thread_id:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get the full thread
        thread = await gmail_api_service.get_thread(
            user_id=user_id,
            thread_id=thread_id,
        )
        
        return thread
        
    except GmailAPIError as e:
        logger.error(f"Failed to get thread for email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting thread for email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve thread")


# Email Sending Endpoints

@router.post("/send")
async def send_email(
    request: SendEmailRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Send an email.
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.send_email(
            user_id=user_id,
            to=request.to,
            subject=request.subject,
            body=request.body,
            cc=request.cc,
            bcc=request.bcc,
            html=request.html,
        )
        
        logger.info(f"Email sent successfully for user {user_id}")
        
        return {
            "success": True,
            "message": "Email sent successfully",
            "message_id": result.get('id'),
            "thread_id": result.get('threadId'),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to send email for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error sending email for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


# Draft Management Endpoints

@router.post("/drafts")
async def create_draft(
    request: CreateDraftRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create an email draft.
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.create_draft(
            user_id=user_id,
            to=request.to,
            subject=request.subject,
            body=request.body,
            cc=request.cc,
            bcc=request.bcc,
            html=request.html,
        )
        
        logger.info(f"Draft created successfully for user {user_id}")
        
        return {
            "success": True,
            "message": "Draft created successfully",
            "draft_id": result.get('id'),
            "message_id": result.get('message', {}).get('id'),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to create draft for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating draft for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create draft")


@router.put("/drafts/{draft_id}")
async def update_draft(
    draft_id: str,
    request: UpdateDraftRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update an existing draft.
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.update_draft(
            user_id=user_id,
            draft_id=draft_id,
            to=request.to,
            subject=request.subject,
            body=request.body,
            cc=request.cc,
            bcc=request.bcc,
            html=request.html,
        )
        
        logger.info(f"Draft {draft_id} updated successfully for user {user_id}")
        
        return {
            "success": True,
            "message": "Draft updated successfully",
            "draft_id": result.get('id'),
            "message_id": result.get('message', {}).get('id'),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to update draft {draft_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error updating draft {draft_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update draft")


@router.delete("/drafts/{draft_id}")
async def delete_draft(
    draft_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a draft.
    """
    user_id = current_user['user_id']
    
    try:
        await gmail_api_service.delete_draft(
            user_id=user_id,
            draft_id=draft_id,
        )
        
        logger.info(f"Draft {draft_id} deleted successfully for user {user_id}")
        
        return {
            "success": True,
            "message": "Draft deleted successfully",
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to delete draft {draft_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error deleting draft {draft_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete draft")


# Label Management Endpoints

@router.post("/{email_id}/labels")
async def add_labels_to_email(
    email_id: str,
    request: AddLabelsRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Add labels to an email.
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.add_labels(
            user_id=user_id,
            email_id=email_id,
            label_ids=request.label_ids,
        )
        
        logger.info(f"Labels added to email {email_id} for user {user_id}")
        
        return {
            "success": True,
            "message": "Labels added successfully",
            "label_ids": result.get('labelIds', []),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to add labels to email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error adding labels to email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add labels")


@router.delete("/{email_id}/labels")
async def remove_labels_from_email(
    email_id: str,
    request: RemoveLabelsRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Remove labels from an email.
    """
    user_id = current_user['user_id']
    
    try:
        result = await gmail_api_service.remove_labels(
            user_id=user_id,
            email_id=email_id,
            label_ids=request.label_ids,
        )
        
        logger.info(f"Labels removed from email {email_id} for user {user_id}")
        
        return {
            "success": True,
            "message": "Labels removed successfully",
            "label_ids": result.get('labelIds', []),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to remove labels from email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error removing labels from email {email_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove labels")


@router.get("/labels/list")
async def list_labels(
    current_user: dict = Depends(get_current_user),
):
    """
    Get all labels for the user.
    """
    user_id = current_user['user_id']
    
    try:
        labels = await gmail_api_service.get_labels(user_id=user_id)
        
        return {
            "labels": labels,
            "count": len(labels),
        }
        
    except GmailAPIError as e:
        logger.error(f"Failed to get labels for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting labels for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve labels")
