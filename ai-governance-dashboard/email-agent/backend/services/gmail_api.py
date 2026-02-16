"""
Gmail API Service - Wrapper for Gmail API operations
"""
import asyncio
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional, Any
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

from services.gmail_oauth import gmail_oauth_service
from utils.logging_config import get_logger

logger = get_logger(__name__)


class GmailAPIError(Exception):
    """Custom exception for Gmail API errors."""
    pass


class GmailAPIService:
    """Service for interacting with Gmail API."""
    
    def __init__(self):
        self.max_retries = 3
        self.base_backoff = 1  # seconds
    
    async def _get_service(self, user_id: str, db):
        """
        Get authenticated Gmail API service for user.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Gmail API service instance
            
        Raises:
            GmailAPIError: If credentials not found or invalid
        """
        credentials = await gmail_oauth_service.get_credentials(user_id, db)
        
        if not credentials:
            raise GmailAPIError("Gmail not connected. Please authorize access first.")
        
        try:
            service = build('gmail', 'v1', credentials=credentials)
            return service
        except Exception as e:
            logger.error(f"Failed to build Gmail service for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to initialize Gmail service: {str(e)}")
    
    async def _execute_with_retry(self, func, *args, **kwargs) -> Any:
        """
        Execute Gmail API call with exponential backoff retry logic.
        
        Args:
            func: Function to execute
            *args: Positional arguments
            **kwargs: Keyword arguments
            
        Returns:
            API response
            
        Raises:
            GmailAPIError: If all retries fail
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs).execute()
            except HttpError as e:
                last_error = e
                
                # Handle rate limiting (429) and server errors (5xx)
                if e.resp.status in [429, 500, 503]:
                    if attempt < self.max_retries - 1:
                        backoff = self.base_backoff * (2 ** attempt)
                        logger.warning(
                            f"Gmail API error {e.resp.status}, "
                            f"retrying in {backoff}s (attempt {attempt + 1}/{self.max_retries})"
                        )
                        await asyncio.sleep(backoff)
                        continue
                
                # Handle token expiration (401)
                if e.resp.status == 401:
                    logger.error("Gmail API authentication failed - token may be expired")
                    raise GmailAPIError("Authentication failed. Please reconnect your Gmail account.")
                
                # Other errors
                logger.error(f"Gmail API error: {e}")
                raise GmailAPIError(f"Gmail API error: {str(e)}")
            
            except Exception as e:
                logger.error(f"Unexpected error calling Gmail API: {e}")
                raise GmailAPIError(f"Unexpected error: {str(e)}")
        
        # All retries exhausted
        logger.error(f"Gmail API call failed after {self.max_retries} attempts")
        raise GmailAPIError(f"Gmail API call failed after {self.max_retries} attempts: {str(last_error)}")
    
    async def search_emails(
        self,
        user_id: str,
        db,
        query: str = "",
        max_results: int = 100,
        page_token: Optional[str] = None,
    ) -> Dict:
        """
        Search emails using Gmail query syntax.
        
        Args:
            user_id: User ID
            db: Database session
            query: Gmail search query (e.g., "from:example@gmail.com subject:hello")
            max_results: Maximum number of results to return
            page_token: Token for pagination
            
        Returns:
            Dict with messages list and nextPageToken
            
        Example query syntax:
            - "from:sender@example.com"
            - "subject:meeting"
            - "is:unread"
            - "has:attachment"
            - "after:2024/01/01"
        """
        try:
            service = await self._get_service(user_id, db)
            
            params = {
                'userId': 'me',
                'q': query,
                'maxResults': max_results,
            }
            
            if page_token:
                params['pageToken'] = page_token
            
            result = await self._execute_with_retry(
                service.users().messages().list,
                **params
            )
            
            messages = result.get('messages', [])
            next_page_token = result.get('nextPageToken')
            
            logger.info(f"Found {len(messages)} emails for user {user_id} with query: {query}")
            
            return {
                'messages': messages,
                'nextPageToken': next_page_token,
                'resultSizeEstimate': result.get('resultSizeEstimate', 0),
            }
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to search emails for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to search emails: {str(e)}")
    
    async def get_email(
        self,
        user_id: str,
        email_id: str,
        db,
        format: str = 'full',
    ) -> Dict:
        """
        Get full email details by ID.
        
        Args:
            user_id: User ID
            email_id: Gmail message ID
            db: Database session
            format: Response format ('full', 'metadata', 'minimal', 'raw')
            
        Returns:
            Email message details
        """
        try:
            service = await self._get_service(user_id, db)
            
            message = await self._execute_with_retry(
                service.users().messages().get,
                userId='me',
                id=email_id,
                format=format,
            )
            
            logger.info(f"Retrieved email {email_id} for user {user_id}")
            
            return message
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to get email {email_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to retrieve email: {str(e)}")
    
    async def get_thread(
        self,
        user_id: str,
        thread_id: str,
        db,
    ) -> Dict:
        """
        Get email thread with all messages.
        
        Args:
            user_id: User ID
            thread_id: Gmail thread ID
            db: Database session
            
        Returns:
            Thread with all messages in chronological order
        """
        try:
            service = await self._get_service(user_id, db)
            
            thread = await self._execute_with_retry(
                service.users().threads().get,
                userId='me',
                id=thread_id,
            )
            
            logger.info(f"Retrieved thread {thread_id} for user {user_id}")
            
            return thread
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to get thread {thread_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to retrieve thread: {str(e)}")
    
    async def send_email(
        self,
        user_id: str,
        to: List[str],
        subject: str,
        body: str,
        db,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        html: bool = False,
    ) -> Dict:
        """
        Send an email.
        
        Args:
            user_id: User ID
            to: List of recipient email addresses
            subject: Email subject
            body: Email body (plain text or HTML)
            db: Database session
            cc: List of CC recipients
            bcc: List of BCC recipients
            html: Whether body is HTML
            
        Returns:
            Sent message details
        """
        try:
            service = await self._get_service(user_id, db)
            
            # Create message
            if html:
                message = MIMEMultipart('alternative')
                message.attach(MIMEText(body, 'html'))
            else:
                message = MIMEText(body)
            
            message['To'] = ', '.join(to)
            message['Subject'] = subject
            
            if cc:
                message['Cc'] = ', '.join(cc)
            if bcc:
                message['Bcc'] = ', '.join(bcc)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send
            sent_message = await self._execute_with_retry(
                service.users().messages().send,
                userId='me',
                body={'raw': raw_message},
            )
            
            logger.info(f"Sent email to {to} for user {user_id}")
            
            return sent_message
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to send email for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to send email: {str(e)}")
    
    async def create_draft(
        self,
        user_id: str,
        to: List[str],
        subject: str,
        body: str,
        db,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        html: bool = False,
    ) -> Dict:
        """
        Create an email draft.
        
        Args:
            user_id: User ID
            to: List of recipient email addresses
            subject: Email subject
            body: Email body (plain text or HTML)
            db: Database session
            cc: List of CC recipients
            bcc: List of BCC recipients
            html: Whether body is HTML
            
        Returns:
            Draft details
        """
        try:
            service = await self._get_service(user_id, db)
            
            # Create message
            if html:
                message = MIMEMultipart('alternative')
                message.attach(MIMEText(body, 'html'))
            else:
                message = MIMEText(body)
            
            message['To'] = ', '.join(to)
            message['Subject'] = subject
            
            if cc:
                message['Cc'] = ', '.join(cc)
            if bcc:
                message['Bcc'] = ', '.join(bcc)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Create draft
            draft = await self._execute_with_retry(
                service.users().drafts().create,
                userId='me',
                body={'message': {'raw': raw_message}},
            )
            
            logger.info(f"Created draft for user {user_id}")
            
            return draft
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to create draft for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to create draft: {str(e)}")
    
    async def update_draft(
        self,
        user_id: str,
        draft_id: str,
        to: List[str],
        subject: str,
        body: str,
        db,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        html: bool = False,
    ) -> Dict:
        """
        Update an existing draft.
        
        Args:
            user_id: User ID
            draft_id: Draft ID to update
            to: List of recipient email addresses
            subject: Email subject
            body: Email body (plain text or HTML)
            db: Database session
            cc: List of CC recipients
            bcc: List of BCC recipients
            html: Whether body is HTML
            
        Returns:
            Updated draft details
        """
        try:
            service = await self._get_service(user_id, db)
            
            # Create message
            if html:
                message = MIMEMultipart('alternative')
                message.attach(MIMEText(body, 'html'))
            else:
                message = MIMEText(body)
            
            message['To'] = ', '.join(to)
            message['Subject'] = subject
            
            if cc:
                message['Cc'] = ', '.join(cc)
            if bcc:
                message['Bcc'] = ', '.join(bcc)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Update draft
            draft = await self._execute_with_retry(
                service.users().drafts().update,
                userId='me',
                id=draft_id,
                body={'message': {'raw': raw_message}},
            )
            
            logger.info(f"Updated draft {draft_id} for user {user_id}")
            
            return draft
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to update draft {draft_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to update draft: {str(e)}")
    
    async def delete_draft(
        self,
        user_id: str,
        draft_id: str,
        db,
    ) -> bool:
        """
        Delete a draft.
        
        Args:
            user_id: User ID
            draft_id: Draft ID to delete
            db: Database session
            
        Returns:
            True if successful
        """
        try:
            service = await self._get_service(user_id, db)
            
            await self._execute_with_retry(
                service.users().drafts().delete,
                userId='me',
                id=draft_id,
            )
            
            logger.info(f"Deleted draft {draft_id} for user {user_id}")
            
            return True
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to delete draft {draft_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to delete draft: {str(e)}")
    
    async def add_labels(
        self,
        user_id: str,
        email_id: str,
        label_ids: List[str],
        db,
    ) -> Dict:
        """
        Add labels to an email.
        
        Args:
            user_id: User ID
            email_id: Email message ID
            label_ids: List of label IDs to add
            db: Database session
            
        Returns:
            Updated message details
        """
        try:
            service = await self._get_service(user_id, db)
            
            message = await self._execute_with_retry(
                service.users().messages().modify,
                userId='me',
                id=email_id,
                body={'addLabelIds': label_ids},
            )
            
            logger.info(f"Added labels {label_ids} to email {email_id} for user {user_id}")
            
            return message
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to add labels to email {email_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to add labels: {str(e)}")
    
    async def remove_labels(
        self,
        user_id: str,
        email_id: str,
        label_ids: List[str],
        db,
    ) -> Dict:
        """
        Remove labels from an email.
        
        Args:
            user_id: User ID
            email_id: Email message ID
            label_ids: List of label IDs to remove
            db: Database session
            
        Returns:
            Updated message details
        """
        try:
            service = await self._get_service(user_id, db)
            
            message = await self._execute_with_retry(
                service.users().messages().modify,
                userId='me',
                id=email_id,
                body={'removeLabelIds': label_ids},
            )
            
            logger.info(f"Removed labels {label_ids} from email {email_id} for user {user_id}")
            
            return message
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to remove labels from email {email_id} for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to remove labels: {str(e)}")
    
    async def get_labels(
        self,
        user_id: str,
        db,
    ) -> List[Dict]:
        """
        Get all labels for user.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            List of label details
        """
        try:
            service = await self._get_service(user_id, db)
            
            result = await self._execute_with_retry(
                service.users().labels().list,
                userId='me',
            )
            
            labels = result.get('labels', [])
            
            logger.info(f"Retrieved {len(labels)} labels for user {user_id}")
            
            return labels
            
        except GmailAPIError:
            raise
        except Exception as e:
            logger.error(f"Failed to get labels for user {user_id}: {e}")
            raise GmailAPIError(f"Failed to retrieve labels: {str(e)}")


# Global service instance
gmail_api_service = GmailAPIService()
