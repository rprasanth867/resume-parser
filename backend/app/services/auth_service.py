from app.models.user import User
from app.extensions import db
import re

class AuthService:
    """Service for handling authentication logic"""
    
    def register_user(self, email, password, full_name):
        """Register a new user"""
        # Validate email format
        if not self._is_valid_email(email):
            raise ValueError('Invalid email format')
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            raise ValueError('Email already registered')
        
        # Validate password strength
        if not self._is_valid_password(password):
            raise ValueError('Password must be at least 8 characters long')
        
        # Create new user
        user = User(
            email=email.lower(),
            full_name=full_name
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    def authenticate_user(self, email, password):
        """Authenticate user with email and password"""
        user = User.query.filter_by(email=email.lower()).first()
        
        if not user or not user.is_active:
            return None
        
        if not user.check_password(password):
            return None
        
        return user
    
    def _is_valid_email(self, email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _is_valid_password(self, password):
        """Validate password strength"""
        return len(password) >= 8
