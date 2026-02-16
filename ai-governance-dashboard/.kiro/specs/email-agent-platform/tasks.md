# Implementation Plan: Email Agent Platform

## Overview

This implementation plan breaks down the Email Agent Platform into discrete, incremental tasks. The approach follows a layered strategy: infrastructure setup, core services, API layer, agent integration, external integrations, frontend, and deployment. Each task builds on previous work, with checkpoints to ensure stability before proceeding.

## Tasks

- [-] 1. Project setup and infrastructure foundation
  - [x] 1.1 Initialize Python backend project structure
    - Create FastAPI application with proper directory structure (api/, services/, models/, utils/)
    - Set up virtual environment and requirements.txt with core dependencies (FastAPI, Uvicorn, SQLAlchemy, Alembic, Redis, Celery, LangGraph, LangChain)
    - Configure environment variable management with python-dotenv
    - Create Docker Compose for local development (PostgreSQL, Redis)
    - _Requirements: 27.1, 27.2_
  
  - [x] 1.2 Initialize React frontend project
    - Create Vite + React + TypeScript project
    - Set up project structure (components/, services/, hooks/, types/)
    - Configure Tailwind CSS or Material-UI for styling
    - Set up Axios for API client
    - _Requirements: 30.1_
  
  - [ ] 1.3 Set up database schema and migrations
    - Create Alembic migration scripts for all tables (users, sessions, gmail_oauth, scheduled_emails, webhooks, webhook_deliveries, slack_integrations, api_keys, audit_logs, agent_conversations)
    - Implement database connection pooling with SQLAlchemy
    - Create database models matching schema design
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  
  - [ ] 1.4 Configure Redis connection and caching utilities
    - Set up Redis client with connection pooling
    - Implement cache utility functions (get, set, delete with TTL)
    - Create rate limiting utility using Redis counters
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 2. Authentication and authorization layer
  - [ ] 2.1 Implement AWS Cognito integration service
    - Create CognitoAuthService class with register, login, refresh, logout methods
    - Implement JWT verification using Cognito public keys
    - Create middleware for JWT extraction and validation
    - Implement role-based authorization decorators
    - _Requirements: 7.1, 7.2, 7.6, 7.7, 7.8, 9.1, 9.6_
  
  - [ ] 2.2 Write property tests for authentication
    - **Property 18: Valid credentials authentication**
    - **Property 21: Successful login JWT issuance**
    - **Property 22: JWT validation on protected endpoints**
    - **Property 23: Expired JWT rejection**
    - **Validates: Requirements 7.2, 7.6, 7.7, 7.8**
  
  - [ ] 2.3 Implement password complexity validation
    - Create password validator with complexity rules (min length, character types)
    - Integrate with Cognito registration
    - _Requirements: 7.3_
  
  - [ ] 2.4 Write property test for password complexity
    - **Property 19: Password complexity enforcement**
    - **Validates: Requirements 7.3**
  
  - [ ] 2.5 Implement API key authentication
    - Create API key generation with secure random tokens
    - Store API key hashes in database
    - Implement API key authentication middleware
    - Create endpoints for API key management (generate, list, revoke)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 2.6 Write property tests for API key authentication
    - **Property 34: API key generation**
    - **Property 35: API key user association**
    - **Property 36: Valid API key authentication**
    - **Property 37: Revoked API key rejection**
    - **Property 38: API key authorization parity**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 3. Gmail OAuth and API integration
  - [ ] 3.1 Implement Gmail OAuth service
    - Create GmailOAuthService with authorization URL generation
    - Implement OAuth callback handler for code exchange
    - Integrate with AWS Secrets Manager for token storage
    - Implement automatic token refresh logic
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 11.1_
  
  - [ ] 3.2 Write property tests for OAuth flow
    - **Property 8: Authorization code exchange**
    - **Property 9: OAuth token storage round-trip**
    - **Property 10: Multi-user OAuth isolation**
    - **Property 11: OAuth token revocation**
    - **Validates: Requirements 3.3, 3.4, 3.6, 3.8**
  
  - [ ] 3.3 Implement Gmail API service wrapper
    - Create GmailAPIService class with methods for search, read, send, draft, labels, threads
    - Implement exponential backoff for rate limiting
    - Implement automatic token refresh on 401 errors
    - Add comprehensive error handling and logging
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [ ] 3.4 Write property tests for Gmail API operations
    - **Property 1: Email search returns only matching results**
    - **Property 2: Email retrieval completeness**
    - **Property 3: Draft creation success**
    - **Property 4: Email sending success**
    - **Property 5: Label application round-trip**
    - **Property 6: Thread chronological ordering**
    - **Property 7: Gmail API error handling**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8**
  
  - [ ] 3.5 Write unit tests for Gmail API edge cases
    - Test empty search results
    - Test rate limit backoff timing
    - Test expired token refresh trigger
    - _Requirements: 2.7, 3.5_

- [ ] 4. Checkpoint - Core authentication and Gmail integration
  - Ensure all tests pass, verify OAuth flow works end-to-end, ask the user if questions arise.


- [ ] 5. API Gateway and endpoints
  - [ ] 5.1 Implement core API structure
    - Create FastAPI app with CORS middleware
    - Implement consistent response format wrapper
    - Add request validation error handling
    - Create health check endpoint
    - _Requirements: 5.10, 5.12, 1.6_
  
  - [ ] 5.2 Write property tests for API response format
    - **Property 12: API response structure consistency**
    - **Property 14: Input validation errors**
    - **Validates: Requirements 5.10, 5.12**
  
  - [ ] 5.3 Implement rate limiting middleware
    - Create rate limiter using Redis counters
    - Add rate limit middleware to API routes
    - Return 429 status when limit exceeded
    - _Requirements: 5.11_
  
  - [ ] 5.4 Write property test for rate limiting
    - **Property 13: Rate limiting enforcement**
    - **Validates: Requirements 5.11**
  
  - [ ] 5.5 Implement authentication endpoints
    - POST /api/v1/auth/register with email verification
    - POST /api/v1/auth/login
    - POST /api/v1/auth/refresh
    - POST /api/v1/auth/logout
    - POST /api/v1/auth/reset-password
    - _Requirements: 7.2, 7.5, 7.6, 7.9_
  
  - [ ] 5.6 Write property tests for authentication endpoints
    - **Property 20: Registration verification email**
    - **Property 24: Password reset email delivery**
    - **Validates: Requirements 7.5, 7.9**
  
  - [ ] 5.7 Implement Gmail OAuth endpoints
    - GET /api/v1/gmail/oauth/authorize
    - GET /api/v1/gmail/oauth/callback
    - DELETE /api/v1/gmail/oauth/disconnect
    - _Requirements: 3.1, 3.2, 3.8_
  
  - [ ] 5.8 Implement email management endpoints
    - GET /api/v1/emails (search with query params)
    - GET /api/v1/emails/{email_id}
    - GET /api/v1/emails/{email_id}/thread
    - POST /api/v1/emails/send
    - POST /api/v1/emails/draft
    - PUT /api/v1/emails/draft/{draft_id}
    - DELETE /api/v1/emails/draft/{draft_id}
    - POST /api/v1/emails/{email_id}/labels
    - DELETE /api/v1/emails/{email_id}/labels/{label_id}
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_
  
  - [ ] 5.9 Write property tests for email endpoints
    - Test that endpoints enforce user isolation
    - **Property 25: Email query isolation**
    - **Property 26: Cross-user data access prevention**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 6. Multi-user isolation and RBAC
  - [ ] 6.1 Implement user isolation middleware
    - Create middleware to filter queries by authenticated user
    - Add user_id to all database queries
    - Implement authorization checks for resource access
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 6.2 Write property tests for isolation
    - **Property 27: User configuration isolation**
    - **Property 28: Session isolation**
    - **Validates: Requirements 8.4, 8.5**
  
  - [ ] 6.3 Implement role-based access control
    - Create role assignment on user registration (default: User)
    - Implement Admin role checks for system endpoints
    - Create admin endpoints for audit logs and user management
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 6.4 Write property tests for RBAC
    - **Property 29: Admin system access**
    - **Property 30: Admin audit log access**
    - **Property 31: User role data restriction**
    - **Property 32: Default role assignment**
    - **Property 33: Role permission validation**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6**

- [ ] 7. Audit logging system
  - [ ] 7.1 Implement audit logging service
    - Create AuditLogService with methods for logging events
    - Implement automatic logging for authentication events
    - Add logging for email operations (send, read, search)
    - Add logging for OAuth connections/disconnections
    - Add logging for API key operations
    - Add logging for admin actions
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 7.2 Write property tests for audit logging
    - **Property 41: Comprehensive audit logging**
    - **Property 39: API key audit logging**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 10.6**
  
  - [ ] 7.3 Implement audit log query endpoints
    - GET /api/v1/admin/audit-logs with filtering
    - Restrict access to Admin role
    - _Requirements: 12.7_
  
  - [ ] 7.4 Write property test for audit log access
    - **Property 42: Admin audit log query access**
    - **Validates: Requirements 12.7**

- [ ] 8. Checkpoint - API layer complete
  - Ensure all tests pass, verify all endpoints work with proper authentication and authorization, ask the user if questions arise.

- [ ] 9. Attachment handling
  - [ ] 9.1 Implement S3 attachment service
    - Create S3Service for upload/download operations
    - Implement temporary storage with 24-hour expiration
    - Add file size validation (25MB limit)
    - _Requirements: 17.1, 17.2, 17.5_
  
  - [ ] 9.2 Implement attachment endpoints
    - POST /api/v1/attachments/upload
    - GET /api/v1/attachments/{attachment_id}/download
    - Integrate with email send/draft endpoints
    - _Requirements: 5.8, 17.3_
  
  - [ ] 9.3 Write property tests for attachments
    - **Property 62: Attachment size validation**
    - **Property 63: Attachment storage round-trip**
    - **Property 64: Email attachment download**
    - **Property 66: Multiple attachments support**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.7**
  
  - [ ] 9.4 Write unit test for malware scanning
    - Test that malicious attachments are blocked
    - _Requirements: 17.4_
  
  - [ ] 9.5 Implement background job for attachment cleanup
    - Create Celery task to delete S3 objects older than 24 hours
    - Schedule daily execution
    - _Requirements: 17.5_
  
  - [ ] 9.6 Write property test for attachment cleanup
    - **Property 65: Temporary attachment cleanup**
    - **Validates: Requirements 17.5**

- [ ] 10. Scheduled email system
  - [ ] 10.1 Implement scheduled email service
    - Create database operations for scheduled emails
    - Implement scheduling endpoint with timezone handling
    - Add cancellation endpoint
    - _Requirements: 18.1, 18.2, 18.5, 18.7_
  
  - [ ] 10.2 Implement scheduled email endpoints
    - POST /api/v1/emails/schedule
    - GET /api/v1/emails/scheduled
    - DELETE /api/v1/emails/scheduled/{scheduled_id}
    - _Requirements: 5.9_
  
  - [ ] 10.3 Write property tests for scheduling
    - **Property 67: Email scheduling success**
    - **Property 68: Scheduled email storage**
    - **Property 71: Scheduled email cancellation**
    - **Property 73: Timezone conversion correctness**
    - **Validates: Requirements 18.1, 18.2, 18.5, 18.7**
  
  - [ ] 10.4 Implement background worker for scheduled email sending
    - Create Celery task to send scheduled emails at specified time
    - Update email status after sending
    - Send notification to user via WebSocket
    - _Requirements: 18.3, 18.4, 18.6_
  
  - [ ] 10.5 Write property tests for scheduled sending
    - **Property 69: Scheduled email delivery at send time**
    - **Property 70: Scheduled email status update**
    - **Property 72: Scheduled email notification**
    - **Validates: Requirements 18.3, 18.4, 18.6**

- [ ] 11. WebSocket real-time updates
  - [ ] 11.1 Implement WebSocket connection manager
    - Create ConnectionManager class for managing active connections
    - Implement WebSocket endpoint with JWT authentication
    - Add heartbeat mechanism (30-second interval)
    - _Requirements: 6.1, 6.5_
  
  - [ ] 11.2 Write unit test for WebSocket heartbeat
    - Test that heartbeats are sent every 30 seconds
    - _Requirements: 6.5_
  
  - [ ] 11.3 Integrate WebSocket notifications
    - Send notifications on new email arrival
    - Send notifications on email state changes
    - Send notifications on agent task completion
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ] 11.4 Write property tests for WebSocket notifications
    - **Property 15: New email notification delivery**
    - **Property 16: Email state change propagation**
    - **Property 17: Agent task completion notification**
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ] 12. Checkpoint - Core backend features complete
  - Ensure all tests pass, verify attachments, scheduling, and WebSocket work correctly, ask the user if questions arise.


- [ ] 13. LangGraph AI agent implementation
  - [ ] 13.1 Set up LangGraph agent structure
    - Define AgentState TypedDict with messages, user_id, gmail_service, current_task
    - Create StateGraph with agent and tools nodes
    - Configure Claude/GPT as configurable backend
    - _Requirements: 24.1, 24.2_
  
  - [ ] 13.2 Implement Gmail operation tools
    - Create search_emails_tool
    - Create read_email_tool
    - Create send_email_tool
    - Create create_draft_tool
    - Create apply_label_tool
    - Create get_thread_tool
    - _Requirements: 24.3_
  
  - [ ] 13.3 Write property test for agent tools
    - **Property 80: Agent tool execution**
    - **Validates: Requirements 24.3**
  
  - [ ] 13.4 Implement agent conversation management
    - Create conversation storage in database
    - Implement context preservation across turns
    - Add conversation history retrieval
    - _Requirements: 24.4_
  
  - [ ] 13.5 Write property test for conversation context
    - **Property 81: Agent conversation context preservation**
    - **Validates: Requirements 24.4**
  
  - [ ] 13.5 Implement natural language command parsing
    - Configure agent prompt for email management tasks
    - Implement command parsing logic
    - Add clarification question generation for ambiguous commands
    - _Requirements: 24.5, 24.6_
  
  - [ ] 13.6 Write property tests for command parsing
    - **Property 82: Natural language command parsing**
    - **Property 83: Agent clarification requests**
    - **Validates: Requirements 24.5, 24.6**
  
  - [ ] 13.7 Implement agent response generation
    - Create natural language response templates
    - Implement response generation for completed actions
    - _Requirements: 24.7_
  
  - [ ] 13.8 Write property tests for agent responses
    - **Property 84: Agent response generation**
    - **Property 85: Multi-step task execution**
    - **Validates: Requirements 24.7, 24.8**
  
  - [ ] 13.9 Implement agent API endpoints
    - POST /api/v1/agent/chat
    - GET /api/v1/agent/history
    - _Requirements: 5.6_

- [ ] 14. Google Calendar integration
  - [ ] 14.1 Implement Google Calendar OAuth and API service
    - Add Calendar OAuth scope to Gmail OAuth flow
    - Create CalendarService with create, query, update methods
    - _Requirements: 15.1_
  
  - [ ] 14.2 Implement calendar tools for agent
    - Create create_calendar_event_tool
    - Create query_calendar_events_tool
    - Create update_calendar_event_tool
    - Add tools to agent configuration
    - _Requirements: 15.2, 15.3, 15.4_
  
  - [ ] 14.3 Write property tests for calendar integration
    - **Property 56: Calendar event creation from natural language**
    - **Property 57: Calendar event query**
    - **Property 58: Calendar event update**
    - **Property 59: Calendar invitation email delivery**
    - **Property 60: Calendar event information extraction**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5, 15.6**
  
  - [ ] 14.4 Implement calendar endpoints
    - GET /api/v1/calendar/events
    - POST /api/v1/calendar/events
    - PUT /api/v1/calendar/events/{event_id}
    - _Requirements: 5.8_

- [ ] 15. Google Contacts integration
  - [ ] 15.1 Implement Google Contacts OAuth and API service
    - Add Contacts OAuth scope to Gmail OAuth flow
    - Create ContactsService with search method
    - Implement Redis caching for contacts (1-hour TTL)
    - _Requirements: 16.1, 16.2, 16.4_
  
  - [ ] 15.2 Implement contact search tool for agent
    - Create search_contacts_tool
    - Add tool to agent configuration
    - _Requirements: 16.2_
  
  - [ ] 15.3 Write property test for contact search
    - **Property 61: Contact search results**
    - **Validates: Requirements 16.2**
  
  - [ ] 15.4 Write unit test for contact caching
    - Test that cached contacts are faster than API calls
    - _Requirements: 16.4_

- [ ] 16. Slack integration
  - [ ] 16.1 Implement Slack integration service
    - Create SlackIntegrationService with configure and send_notification methods
    - Implement Slack message formatting with blocks
    - Add exponential backoff for Slack API rate limits
    - _Requirements: 13.1, 13.2, 13.6_
  
  - [ ] 16.2 Implement Slack configuration endpoint
    - POST /api/v1/integrations/slack/configure
    - Validate webhook URL
    - _Requirements: 13.5_
  
  - [ ] 16.3 Write property tests for Slack integration
    - **Property 43: New email Slack notification**
    - **Property 44: Slack notification format completeness**
    - **Property 46: Slack webhook URL validation**
    - **Property 47: Slack delivery failure handling**
    - **Validates: Requirements 13.1, 13.2, 13.5, 13.7**
  
  - [ ] 16.4 Implement background worker for Slack notifications
    - Create Celery task for sending Slack notifications
    - Integrate with email polling system
    - _Requirements: 13.1_
  
  - [ ] 16.5 Implement scheduled Slack summaries
    - Create Celery task for email summaries
    - Add configurable schedule per user
    - _Requirements: 13.4_
  
  - [ ] 16.6 Write property test for scheduled summaries
    - **Property 45: Scheduled Slack summary delivery**
    - **Validates: Requirements 13.4**
  
  - [ ] 16.7 Write unit test for Slack rate limit handling
    - Test exponential backoff on rate limit errors
    - _Requirements: 13.6_

- [ ] 17. Webhook system
  - [ ] 17.1 Implement webhook service
    - Create WebhookService with register, trigger, sign_payload methods
    - Implement HMAC signature generation
    - Add webhook URL validation
    - _Requirements: 14.1, 14.9, 14.10_
  
  - [ ] 17.2 Implement webhook endpoints
    - POST /api/v1/integrations/webhooks
    - GET /api/v1/integrations/webhooks
    - DELETE /api/v1/integrations/webhooks/{webhook_id}
    - _Requirements: 14.1_
  
  - [ ] 17.3 Write property tests for webhook registration
    - **Property 48: Webhook registration success**
    - **Property 54: Webhook URL validation**
    - **Property 55: Webhook signature generation**
    - **Validates: Requirements 14.1, 14.9, 14.10**
  
  - [ ] 17.4 Implement background worker for webhook delivery
    - Create Celery task with retry logic (exponential backoff, max 3 attempts)
    - Log all delivery attempts
    - _Requirements: 14.5, 14.6, 14.7, 14.8_
  
  - [ ] 17.5 Write property tests for webhook delivery
    - **Property 49: Email event webhook triggering**
    - **Property 50: Webhook payload format**
    - **Property 51: Webhook payload completeness**
    - **Property 52: Webhook retry with backoff**
    - **Property 53: Webhook delivery audit logging**
    - **Validates: Requirements 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8**
  
  - [ ] 17.6 Integrate webhook triggers with email events
    - Trigger webhooks on email received
    - Trigger webhooks on email sent
    - Trigger webhooks on label applied
    - _Requirements: 14.2, 14.3, 14.4_

- [ ] 18. Checkpoint - All integrations complete
  - Ensure all tests pass, verify agent, calendar, contacts, Slack, and webhooks work correctly, ask the user if questions arise.


- [ ] 19. Background workers and email polling
  - [ ] 19.1 Set up Celery with Redis broker
    - Configure Celery app with Redis as message broker
    - Set up Celery Beat for periodic tasks
    - Create worker startup script
    - _Requirements: 5.1_
  
  - [ ] 19.2 Implement email polling worker
    - Create Celery task to poll Gmail for new emails (every 5 minutes per user)
    - Store last check timestamp in Redis
    - Trigger webhooks for new emails
    - Send Slack notifications for new emails
    - Send WebSocket notifications for new emails
    - _Requirements: 6.2, 13.1, 14.2_
  
  - [ ] 19.3 Implement error handling and retry logic
    - Add exponential backoff for Gmail API failures
    - Implement circuit breaker for external services
    - Add fallback responses for non-critical failures
    - Log all errors with stack traces
    - _Requirements: 28.1, 28.2, 28.4, 28.5, 28.6, 28.7_
  
  - [ ] 19.4 Write property tests for error handling
    - **Property 86: Gmail API retry with backoff**
    - **Property 87: User-friendly error messages**
    - **Property 88: Background job retry on failure**
    - **Property 89: Fallback responses for non-critical failures**
    - **Property 90: Unhandled exception logging**
    - **Validates: Requirements 28.1, 28.3, 28.4, 28.6, 28.7**
  
  - [ ] 19.5 Write unit tests for error handling edge cases
    - Test database reconnection on failure
    - Test circuit breaker state transitions
    - _Requirements: 28.2, 28.5_

- [ ] 20. Caching layer implementation
  - [ ] 20.1 Implement cache service with TTL
    - Create CacheService wrapper around Redis
    - Implement get/set/delete with TTL support
    - Add cache invalidation on data changes
    - _Requirements: 20.1, 20.2, 20.4, 20.5, 20.6_
  
  - [ ] 20.2 Write property tests for caching
    - **Property 74: Cache TTL expiration**
    - **Property 75: Rate limit counter accuracy**
    - **Property 76: Cache invalidation on data change**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6**
  
  - [ ] 20.3 Integrate caching with services
    - Cache session tokens
    - Cache email metadata
    - Cache contacts
    - Cache rate limit counters
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 21. Monitoring and observability
  - [ ] 21.1 Implement CloudWatch logging
    - Configure structured logging with JSON format
    - Send logs to CloudWatch Logs
    - Add request ID tracking for correlation
    - _Requirements: 21.1_
  
  - [ ] 21.2 Implement metrics collection
    - Create metrics service for custom metrics
    - Track API response times and error rates
    - Track Gmail API usage and quota
    - Track WebSocket connection counts
    - _Requirements: 21.2, 21.4, 21.5, 21.8_
  
  - [ ] 21.3 Write property tests for metrics
    - **Property 77: API metrics recording**
    - **Property 78: Gmail API usage tracking**
    - **Property 79: WebSocket connection metrics**
    - **Validates: Requirements 21.4, 21.5, 21.8**
  
  - [ ] 21.4 Implement Prometheus metrics endpoint
    - Expose /metrics endpoint with Prometheus format
    - Include all custom metrics
    - _Requirements: 21.3_
  
  - [ ] 21.5 Write unit test for Prometheus endpoint
    - Test that endpoint returns Prometheus format
    - _Requirements: 21.3_

- [ ] 22. Security hardening
  - [ ] 22.1 Implement OAuth token exposure prevention
    - Audit all API responses to ensure no tokens exposed
    - Add response sanitization middleware
    - _Requirements: 11.4_
  
  - [ ] 22.2 Write property test for token exposure
    - **Property 40: OAuth token exposure prevention**
    - **Validates: Requirements 11.4**
  
  - [ ] 22.3 Configure AWS Secrets Manager integration
    - Store Gmail API credentials in Secrets Manager
    - Store database passwords in Secrets Manager
    - Use IAM roles for pod access
    - _Requirements: 11.1, 11.2, 11.3, 11.6_
  
  - [ ] 22.4 Implement security headers
    - Add HSTS headers
    - Add CSP headers
    - Add X-Frame-Options
    - _Requirements: 23.6_

- [ ] 23. Checkpoint - Backend complete
  - Ensure all tests pass, verify all backend features work correctly, ask the user if questions arise.

- [ ] 24. React frontend - Authentication and layout
  - [ ] 24.1 Implement authentication UI
    - Create login page with email/password form
    - Create registration page with password validation
    - Create password reset flow
    - Implement JWT token storage in localStorage
    - Create authentication context and hooks
    - _Requirements: 7.2, 7.3, 7.9_
  
  - [ ] 24.2 Implement main application layout
    - Create navigation bar with user menu
    - Create sidebar for email folders/labels
    - Create responsive layout
    - _Requirements: 4.1_
  
  - [ ] 24.3 Implement Gmail OAuth connection flow
    - Create "Connect Gmail" button
    - Handle OAuth redirect and callback
    - Display connection status
    - _Requirements: 3.1, 3.2_

- [ ] 25. React frontend - Email management UI
  - [ ] 25.1 Implement email list view
    - Create email list component with sender, subject, date, preview
    - Implement infinite scroll or pagination
    - Add email selection checkboxes
    - _Requirements: 4.1_
  
  - [ ] 25.2 Implement email search and filters
    - Create search bar with query input
    - Add filter controls (date range, labels, sender)
    - _Requirements: 4.2_
  
  - [ ] 25.3 Implement email detail view
    - Create email viewer with full content display
    - Support HTML email rendering
    - Display attachments with download links
    - Show conversation thread
    - _Requirements: 4.3, 4.6_
  
  - [ ] 25.4 Implement email composition
    - Create rich text editor for composing emails
    - Add recipient input with autocomplete from contacts
    - Add subject and body fields
    - Implement attachment upload
    - Add send and save as draft buttons
    - _Requirements: 4.4, 4.5_
  
  - [ ] 25.5 Implement draft management
    - Create drafts list view
    - Add edit draft functionality
    - Add delete draft functionality
    - _Requirements: 4.10_
  
  - [ ] 25.6 Implement label management
    - Add label dropdown to email list
    - Implement bulk label application
    - _Requirements: 4.9_

- [ ] 26. React frontend - AI agent chat interface
  - [ ] 26.1 Implement chat UI
    - Create chat panel with message history
    - Add message input field
    - Display agent responses with formatting
    - Show loading indicator during agent processing
    - _Requirements: 4.7_
  
  - [ ] 26.2 Integrate WebSocket for real-time updates
    - Establish WebSocket connection on login
    - Handle incoming notifications (new emails, state changes, agent responses)
    - Update UI in real-time
    - Implement automatic reconnection
    - _Requirements: 4.8, 6.1, 6.2, 6.3, 6.4_

- [ ] 27. React frontend - Additional features
  - [ ] 27.1 Implement scheduled email UI
    - Create schedule email dialog with date/time picker
    - Display scheduled emails list
    - Add cancel scheduled send button
    - _Requirements: 18.1, 18.5_
  
  - [ ] 27.2 Implement settings page
    - Create Slack integration configuration form
    - Create webhook management UI (add, list, delete)
    - Create API key management UI (generate, list, revoke)
    - _Requirements: 13.5, 14.1, 10.1, 10.4_
  
  - [ ] 27.3 Implement admin dashboard (for Admin role)
    - Create audit log viewer with filters
    - Create user management interface
    - Display system metrics
    - _Requirements: 12.7, 9.2_

- [ ] 28. Frontend build and optimization
  - [ ] 28.1 Configure production build
    - Set up Vite production build with optimizations
    - Enable code splitting
    - Configure environment variables for API URL
    - _Requirements: 30.1, 30.5_
  
  - [ ] 28.2 Implement static asset serving
    - Create nginx configuration for serving frontend
    - Enable gzip compression
    - Configure caching headers
    - _Requirements: 30.2, 30.3, 30.4_

- [ ] 29. Checkpoint - Frontend complete
  - Ensure frontend works end-to-end with backend, test all user workflows, ask the user if questions arise.


- [ ] 30. Docker containerization
  - [ ] 30.1 Create Dockerfile for backend API
    - Use multi-stage build for optimization
    - Install Python dependencies
    - Configure non-root user
    - Add health check
    - _Requirements: 26.1, 26.2, 26.5, 26.6_
  
  - [ ] 30.2 Create Dockerfile for Celery worker
    - Base on backend API image
    - Configure worker startup command
    - _Requirements: 26.1_
  
  - [ ] 30.3 Create Dockerfile for frontend
    - Build React app in first stage
    - Serve with nginx in second stage
    - Configure nginx for SPA routing
    - _Requirements: 26.1, 30.2_
  
  - [ ] 30.4 Create Docker Compose for local development
    - Define services: api, worker, frontend, postgres, redis
    - Configure networking and volumes
    - Add environment variables
    - _Requirements: 27.2_
  
  - [ ] 30.5 Build and tag container images
    - Build images for all services
    - Tag with version and git commit hash
    - Push to Amazon ECR
    - _Requirements: 26.3, 26.4_

- [ ] 31. Kubernetes manifests for EKS deployment
  - [ ] 31.1 Create Kubernetes deployment manifests
    - Create deployment for API backend (2-10 replicas)
    - Create deployment for Celery workers
    - Create deployment for frontend nginx
    - Configure resource requests and limits
    - Add liveness and readiness probes
    - _Requirements: 1.1, 1.2, 1.6, 1.8, 22.6_
  
  - [ ] 31.2 Create Kubernetes service manifests
    - Create ClusterIP service for API
    - Create ClusterIP service for frontend
    - _Requirements: 1.3_
  
  - [ ] 31.3 Create Kubernetes ConfigMap and Secret manifests
    - Create ConfigMap for non-sensitive configuration
    - Create Secret references for AWS Secrets Manager
    - _Requirements: 1.7, 27.1, 27.4_
  
  - [ ] 31.4 Create PersistentVolumeClaim for OAuth tokens
    - Define PVC backed by AWS EBS
    - Mount to API pods
    - _Requirements: 1.5, 29.1, 29.2, 29.3_
  
  - [ ] 31.5 Create HorizontalPodAutoscaler manifest
    - Configure HPA for API backend
    - Set CPU threshold at 70%
    - Set memory threshold at 80%
    - Set min replicas to 2, max to 10
    - Set stabilization window to 30 seconds
    - _Requirements: 1.4, 22.1, 22.2, 22.3, 22.4, 22.5_
  
  - [ ] 31.6 Create Ingress manifest for ALB
    - Configure ALB Ingress Controller
    - Set up TLS termination with ACM certificate
    - Configure routing rules for API and frontend
    - Add HTTP to HTTPS redirect
    - _Requirements: 1.3, 23.1, 23.2, 23.3, 23.4, 23.5, 30.6_

- [ ] 32. AWS infrastructure setup
  - [ ] 32.1 Configure AWS Secrets Manager
    - Create secrets for Gmail API credentials
    - Create secrets for database passwords
    - Create secrets for Cognito configuration
    - Configure IAM role for EKS pod access
    - _Requirements: 11.1, 11.2, 11.3, 11.6_
  
  - [ ] 32.2 Configure AWS Cognito user pool
    - Create Cognito user pool with email/password auth
    - Configure password policy
    - Set up email verification
    - Create app client for API
    - Configure user groups (Admin, User)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1_
  
  - [ ] 32.3 Configure AWS S3 bucket for attachments
    - Create S3 bucket with encryption
    - Configure lifecycle policy for 24-hour expiration
    - Set up IAM role for pod access
    - _Requirements: 17.2, 17.5_
  
  - [ ] 32.4 Configure AWS Certificate Manager
    - Request SSL certificate for custom domain
    - Validate domain ownership
    - _Requirements: 23.4, 23.5_
  
  - [ ] 32.5 Configure CloudWatch
    - Create log groups for application logs
    - Set up custom metrics namespace
    - Configure log retention policies
    - _Requirements: 21.1, 21.2_

- [ ] 33. EKS deployment
  - [ ] 33.1 Deploy PostgreSQL and Redis
    - Deploy PostgreSQL StatefulSet or use RDS
    - Deploy Redis StatefulSet or use ElastiCache
    - Configure persistent storage
    - _Requirements: 19.1, 19.2_
  
  - [ ] 33.2 Run database migrations
    - Apply Alembic migrations to production database
    - Verify schema is correct
    - _Requirements: 19.6_
  
  - [ ] 33.3 Deploy application to EKS
    - Apply all Kubernetes manifests to jhb-streampulse-cluster
    - Verify pods are running
    - Check logs for errors
    - _Requirements: 1.1_
  
  - [ ] 33.4 Configure DNS
    - Point custom domain to ALB
    - Verify HTTPS access
    - _Requirements: 23.5, 30.6_
  
  - [ ] 33.5 Verify deployment
    - Test health check endpoints
    - Test authentication flow
    - Test Gmail OAuth flow
    - Test email operations
    - Test agent chat
    - Test WebSocket connections
    - Verify auto-scaling works
    - _Requirements: 1.6, 22.1_

- [ ] 34. Architecture documentation
  - [ ] 34.1 Create system architecture diagram
    - Document all components and their interactions
    - Show AWS services and EKS cluster
    - _Requirements: 25.1_
  
  - [ ] 34.2 Create data flow diagram
    - Show how data moves through the system
    - Document API request/response flows
    - _Requirements: 25.2_
  
  - [ ] 34.3 Create security architecture diagram
    - Show authentication and authorization flows
    - Document trust boundaries
    - Show encryption points
    - _Requirements: 25.3_
  
  - [ ] 34.4 Create deployment architecture diagram
    - Show EKS cluster layout
    - Document AWS resources
    - Show networking configuration
    - _Requirements: 25.4_
  
  - [ ] 34.5 Create API documentation
    - Document all API endpoints with request/response examples
    - Include authentication requirements
    - Document error codes
    - _Requirements: 25.5_
  
  - [ ] 34.6 Create comprehensive Word document
    - Combine all diagrams and documentation
    - Add introduction and overview
    - Include deployment instructions
    - Format for presentation
    - _Requirements: 25.6, 25.7, 25.8, 25.9, 25.10_

- [ ] 35. Final checkpoint and production readiness
  - Run full test suite (unit + property tests with 1000 iterations)
  - Verify all 90 correctness properties pass
  - Load test the system
  - Verify monitoring and alerting work
  - Confirm backup and disaster recovery procedures
  - Ask the user if questions arise before declaring production ready.

## Notes

- All tasks are required for comprehensive production-ready implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for course correction
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: infrastructure → services → API → integrations → frontend → deployment
