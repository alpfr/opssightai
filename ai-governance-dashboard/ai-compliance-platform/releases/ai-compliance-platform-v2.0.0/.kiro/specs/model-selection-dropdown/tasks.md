# Implementation Plan: Model Selection Dropdown

## Overview

This implementation plan converts the model selection dropdown design into discrete coding tasks that build incrementally. The approach starts with database schema and backend API development, then moves to frontend integration, and concludes with testing and validation. Each task builds on previous work to ensure seamless integration with the existing AI Compliance Platform.

## Tasks

- [ ] 1. Database schema and model setup
  - [x] 1.1 Create database migration for new tables
    - Add ai_models table with id, name, provider, version, description, capabilities, supported_industries, is_active, is_recommended fields
    - Add model_configurations table with model_id, organization_id, settings, is_active fields  
    - Add test_results table with model_id field and enhanced audit tracking
    - Create indexes for performance optimization
    - _Requirements: 5.1, 3.1, 4.1_

  - [ ]* 1.2 Write property test for database schema
    - **Property 11: Model Availability Management**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [x] 1.3 Seed database with sample AI models
    - Create sample models for GPT-4, Claude, Gemini with realistic metadata
    - Set up default configurations for each industry profile
    - Mark recommended models for different industries
    - _Requirements: 5.1, 8.2_

  - [ ]* 1.4 Write unit tests for database seeding
    - Test sample data creation and validation
    - Test default configuration assignment
    - _Requirements: 5.1, 3.3_

- [ ] 2. Backend API development
  - [x] 2.1 Create Pydantic models for AI models and configurations
    - Implement AIModel, ModelConfiguration, enhanced LLMFilterRequest/Response classes
    - Add validation logic for model settings and configurations
    - _Requirements: 3.2, 2.1, 2.2_

  - [ ]* 2.2 Write property test for model validation
    - **Property 9: Configuration Validation**
    - **Validates: Requirements 3.2**

  - [ ] 2.3 Implement ModelService class
    - Create get_available_models, get_model_by_id, get_model_configuration methods
    - Implement update_model_configuration, validate_model_availability methods
    - Add industry profile filtering and recommendation logic
    - _Requirements: 5.1, 3.1, 8.2_

  - [ ]* 2.4 Write property test for ModelService
    - **Property 6: Configuration Application**
    - **Validates: Requirements 2.4, 3.3, 3.4**

  - [x] 2.5 Create new API endpoints for model management
    - Implement GET /models, GET /models/{model_id}, GET /models/{model_id}/configuration
    - Implement PUT /models/{model_id}/configuration with role-based access control
    - Add proper error handling and response formatting
    - _Requirements: 3.1, 3.5, 8.1_

  - [ ]* 2.6 Write property test for API access control
    - **Property 8: Configuration Access Control**
    - **Validates: Requirements 3.1, 3.5**

- [ ] 3. Enhanced guardrail filtering with model support
  - [x] 3.1 Extend GuardrailFilterService to support model selection
    - Modify filter_content method to accept model_id parameter
    - Implement model-specific configuration application
    - Ensure backward compatibility when model_id is not provided
    - _Requirements: 2.1, 2.4, 6.1, 6.2_

  - [ ]* 3.2 Write property test for guardrail consistency
    - **Property 4: Guardrail Rule Consistency**
    - **Validates: Requirements 2.3, 6.4**

  - [x] 3.3 Update /guardrails/filter endpoint
    - Add optional model_id parameter to LLMFilterRequest
    - Include model information in LLMFilterResponse
    - Maintain backward compatibility with existing clients
    - _Requirements: 2.1, 2.2, 6.2_

  - [ ]* 3.4 Write property test for model context processing
    - **Property 5: Model Context Processing**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.5 Enhance audit trail logging for model usage
    - Update audit trail entries to include model information
    - Log model selection changes and configuration updates
    - Ensure all model-related actions are tracked
    - _Requirements: 2.5, 5.5_

  - [ ]* 3.6 Write property test for audit trail completeness
    - **Property 7: Audit Trail Completeness**
    - **Validates: Requirements 2.5, 5.5**

- [ ] 4. Checkpoint - Backend API testing
  - Ensure all backend tests pass, verify API endpoints work correctly, ask the user if questions arise.

- [ ] 5. Frontend model selection component
  - [x] 5.1 Create ModelSelectionDropdown component
    - Implement dropdown with model name, provider, version display
    - Add industry profile filtering and recommendation indicators
    - Include tooltips and help text for model differences
    - _Requirements: 1.1, 1.3, 8.1, 8.2, 8.5_

  - [ ]* 5.2 Write property test for model information display
    - **Property 2: Model Information Display Completeness**
    - **Validates: Requirements 1.3, 8.1, 8.2, 8.3, 8.4, 8.5**

  - [x] 5.3 Implement model selection state management
    - Create React hooks for model selection state
    - Implement session persistence using localStorage
    - Add model selection change handlers and validation
    - _Requirements: 1.2, 1.5, 7.1, 7.2_

  - [ ]* 5.4 Write property test for model selection state
    - **Property 1: Model Selection State Management**
    - **Validates: Requirements 1.2, 1.5, 7.1, 7.2, 7.3, 7.5**

  - [x] 5.5 Add default model behavior and reset functionality
    - Implement default model selection when none is chosen
    - Add reset to default functionality
    - Show clear indication of default model usage
    - _Requirements: 1.4, 7.5_

  - [ ]* 5.6 Write property test for default model behavior
    - **Property 3: Default Model Behavior**
    - **Validates: Requirements 1.4, 6.3**

- [ ] 6. Integration with existing Guardrails component
  - [x] 6.1 Enhance Test Content Dialog with model selection
    - Integrate ModelSelectionDropdown into existing dialog
    - Update test submission to include selected model
    - Maintain existing UI patterns and design consistency
    - _Requirements: 1.1, 6.5_

  - [x] 6.2 Update test results display to show model information
    - Add model details to test results interface
    - Show model-specific information in results summary
    - Maintain backward compatibility with existing results
    - _Requirements: 2.2, 8.3_

  - [x] 6.3 Implement session cleanup on logout
    - Clear model selection state when user logs out
    - Handle session timeout scenarios
    - Ensure proper state management across browser tabs
    - _Requirements: 7.3_

  - [ ]* 6.4 Write property test for backward compatibility
    - **Property 12: Backward Compatibility Preservation**
    - **Validates: Requirements 6.1, 6.2, 6.5**

- [ ] 7. Industry profile context handling
  - [x] 7.1 Implement industry profile model filtering
    - Filter available models based on current industry profile
    - Handle model selection persistence across profile changes
    - Implement graceful fallback when selected model doesn't support new profile
    - _Requirements: 7.4, 8.2_

  - [ ]* 7.2 Write property test for industry profile context
    - **Property 13: Industry Profile Context Preservation**
    - **Validates: Requirements 7.4**

- [ ] 8. Results tracking and reporting enhancements
  - [x] 8.1 Update test results storage with model information
    - Modify test result persistence to include model data
    - Ensure all historical data includes model context
    - Add indexing for efficient model-based queries
    - _Requirements: 4.1_

  - [x] 8.2 Implement model-based filtering and reporting
    - Add filtering capabilities for viewing results by model
    - Create model-specific compliance statistics calculations
    - Implement export functionality for model-specific reports
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 8.3 Write property test for results tracking
    - **Property 10: Results Persistence and Tracking**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 9. Error handling and edge cases
  - [x] 9.1 Implement model availability error handling
    - Handle scenarios where selected model becomes unavailable
    - Implement graceful fallback to available models
    - Add user notifications for model availability changes
    - _Requirements: 5.4_

  - [x] 9.2 Add configuration validation and error handling
    - Validate model configurations before saving
    - Provide clear error messages for invalid settings
    - Handle database constraint violations gracefully
    - _Requirements: 3.2_

  - [ ]* 9.3 Write unit tests for error scenarios
    - Test model unavailability handling
    - Test invalid configuration rejection
    - Test session timeout scenarios
    - _Requirements: 5.4, 3.2, 7.3_

- [ ] 10. Final integration and testing
  - [x] 10.1 Integration testing across all components
    - Test complete workflow from model selection to results display
    - Verify backward compatibility with existing functionality
    - Test cross-browser compatibility and session management
    - _Requirements: 6.1, 6.2_

  - [ ]* 10.2 Write integration property tests
    - Test end-to-end model selection workflows
    - Test session state consistency across components
    - Test audit trail completeness for all operations
    - _Requirements: 1.1, 2.1, 2.5_

- [ ] 11. Final checkpoint - Complete system validation
  - Ensure all tests pass, verify complete feature functionality, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation maintains strict backward compatibility with existing functionality