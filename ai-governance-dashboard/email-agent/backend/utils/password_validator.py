"""
Password complexity validation
"""
import re
from typing import List, Tuple


class PasswordValidator:
    """Validator for password complexity requirements."""
    
    def __init__(
        self,
        min_length: int = 8,
        require_uppercase: bool = True,
        require_lowercase: bool = True,
        require_numbers: bool = True,
        require_special: bool = True,
    ):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_numbers = require_numbers
        self.require_special = require_special
    
    def validate(self, password: str) -> Tuple[bool, List[str]]:
        """
        Validate password against complexity requirements.
        
        Args:
            password: Password to validate
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Check minimum length
        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")
        
        # Check for uppercase letters
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Check for lowercase letters
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        # Check for numbers
        if self.require_numbers and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        # Check for special characters
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def get_requirements_text(self) -> str:
        """
        Get human-readable password requirements.
        
        Returns:
            String describing password requirements
        """
        requirements = [f"At least {self.min_length} characters"]
        
        if self.require_uppercase:
            requirements.append("At least one uppercase letter")
        
        if self.require_lowercase:
            requirements.append("At least one lowercase letter")
        
        if self.require_numbers:
            requirements.append("At least one number")
        
        if self.require_special:
            requirements.append("At least one special character")
        
        return "Password must contain: " + ", ".join(requirements)


# Global password validator instance
password_validator = PasswordValidator(
    min_length=8,
    require_uppercase=True,
    require_lowercase=True,
    require_numbers=True,
    require_special=True,
)
