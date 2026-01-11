#!/usr/bin/env python3
"""
Authentication Manager for Production Use
Provides user management, API key generation, and session handling
"""

import secrets
import hashlib
import hmac
import time
import json
import os
from typing import Optional, Dict, List
from pathlib import Path

# Storage for users and API keys
USERS_DB_PATH = Path("data/users.json")
API_KEYS_DB_PATH = Path("data/api_keys.json")

# Ensure data directory exists
os.makedirs("data", exist_ok=True)


class User:
    """User model"""
    def __init__(self, user_id: str, email: str, role: str = "user", created_at: float = None):
        self.user_id = user_id
        self.email = email
        self.role = role  # "user", "admin", "premium"
        self.created_at = created_at or time.time()
        self.last_login = None
        self.api_keys = []
    
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "api_key_count": len(self.api_keys)
        }


class AuthManager:
    """Manages users and API keys"""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.api_keys: Dict[str, Dict] = {}  # api_key -> {user_id, created_at, expires_at, name}
        self.secret_key = os.environ.get("AUTH_SECRET_KEY", secrets.token_urlsafe(32))
        self.load_data()
    
    def load_data(self):
        """Load users and API keys from disk"""
import logging

logger = logging.getLogger("auth_manager")

        try:
            if USERS_DB_PATH.exists():
                with open(USERS_DB_PATH, "r") as f:
                    data = json.load(f)
                    for user_data in data.get("users", []):
                        user = User(**user_data)
                        self.users[user.user_id] = user
                logger.debug(f"Loaded {len(self.users)} users from database")
        except Exception as e:
            logger.warning(f"Could not load users database: {e}")
        
        try:
            if API_KEYS_DB_PATH.exists():
                with open(API_KEYS_DB_PATH, "r") as f:
                    self.api_keys = json.load(f)
                logger.debug(f"Loaded {len(self.api_keys)} API keys from database")
        except Exception as e:
            logger.warning(f"Could not load API keys database: {e}")
    
    def save_data(self):
        """Save users and API keys to disk"""
        try:
            users_data = {"users": [user.to_dict() for user in self.users.values()]}
            with open(USERS_DB_PATH, "w") as f:
                json.dump(users_data, f, indent=2)
            logger.debug(f"Saved {len(self.users)} users to database")
        except Exception as e:
            logger.error(f"Error saving users: {e}", exc_info=True)
        
        try:
            with open(API_KEYS_DB_PATH, "w") as f:
                json.dump(self.api_keys, f, indent=2)
            logger.debug(f"Saved {len(self.api_keys)} API keys to database")
        except Exception as e:
            logger.error(f"Error saving API keys: {e}", exc_info=True)
    
    def create_user(self, email: str, role: str = "user") -> User:
        """Create a new user"""
        user_id = hashlib.sha256(f"{email}{time.time()}".encode()).hexdigest()[:16]
        user = User(user_id, email, role)
        self.users[user_id] = user
        logger.info(f"Created new user: {user_id} ({email}, role: {role})")
        self.save_data()
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    def generate_api_key(self, user_id: str, name: str = "default", expires_days: int = 365) -> str:
        """Generate an API key for a user"""
        if user_id not in self.users:
            raise ValueError(f"User {user_id} not found")
        
        # Generate key
        key_id = secrets.token_urlsafe(16)
        timestamp = str(int(time.time()))
        message = f"{user_id}:{key_id}:{timestamp}"
        signature = hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        api_key = f"gk_{user_id}_{key_id}_{signature[:16]}"
        
        # Store key metadata
        self.api_keys[api_key] = {
            "user_id": user_id,
            "name": name,
            "created_at": time.time(),
            "expires_at": time.time() + (expires_days * 86400),
            "last_used": None
        }
        
        # Add to user's key list
        self.users[user_id].api_keys.append(api_key)
        logger.info(f"Generated API key for user {user_id} (name: {name}, expires in {expires_days} days)")
        self.save_data()
        
        return api_key
    
    def validate_api_key(self, api_key: str) -> Optional[str]:
        """
        Validate API key and return user_id if valid
        Returns None if invalid
        """
        if api_key not in self.api_keys:
            return None
        
        key_data = self.api_keys[api_key]
        
        # Check expiration
        if time.time() > key_data["expires_at"]:
            return None
        
        # Update last used
        key_data["last_used"] = time.time()
        self.save_data()
        
        return key_data["user_id"]
    
    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke an API key"""
        if api_key in self.api_keys:
            user_id = self.api_keys[api_key]["user_id"]
            if user_id in self.users:
                self.users[user_id].api_keys = [
                    k for k in self.users[user_id].api_keys if k != api_key
                ]
            del self.api_keys[api_key]
            self.save_data()
            return True
        return False
    
    def list_user_keys(self, user_id: str) -> List[Dict]:
        """List all API keys for a user"""
        return [
            {"key": key, **data}
            for key, data in self.api_keys.items()
            if data["user_id"] == user_id
        ]
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get statistics for a user"""
        user = self.get_user(user_id)
        if not user:
            return {}
        
        active_keys = [
            k for k in self.list_user_keys(user_id)
            if time.time() < k["expires_at"]
        ]
        
        return {
            "user_id": user_id,
            "email": user.email,
            "role": user.role,
            "active_api_keys": len(active_keys),
            "total_api_keys": len(user.api_keys)
        }


# Global instance
auth_manager = AuthManager()
