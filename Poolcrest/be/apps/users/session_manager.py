"""
Enhanced session management for user tracking and security auditing.
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from typing import Optional
import json

User = get_user_model()


class UserSessionManager(models.Manager):
    """Custom manager for UserSession model."""
    
    def create_session(self, user, request):
        """
        Create a new session record for user login.
        
        Args:
            user: User instance
            request: HttpRequest object
        
        Returns:
            UserSession instance
        """
        # Get client IP
        ip_address = self.get_client_ip(request)
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Parse device info from user agent
        device_info = self.parse_device_info(user_agent)
        
        # Generate session key
        session_key = request.session.session_key if hasattr(request, 'session') else None
        if not session_key and hasattr(request, 'session'):
            request.session.save()
            session_key = request.session.session_key
        
        # If no Django session, generate a unique key
        if not session_key:
            import uuid
            session_key = str(uuid.uuid4())
        
        # Create session record
        session = self.create(
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent,
            device_info=device_info,
            login_time=timezone.now(),
            last_activity=timezone.now(),
            is_active=True
        )
        
        return session
    
    def get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or '0.0.0.0'
    
    def parse_device_info(self, user_agent):
        """Parse device information from user agent string."""
        device_info = {
            'os': 'unknown',
            'device': 'Desktop',
            'browser': 'unknown',
            'raw_user_agent': user_agent
        }
        
        user_agent_lower = user_agent.lower()
        
        # Detect OS
        if 'windows' in user_agent_lower:
            device_info['os'] = 'Windows'
        elif 'mac' in user_agent_lower:
            device_info['os'] = 'macOS'
        elif 'linux' in user_agent_lower:
            device_info['os'] = 'Linux'
        elif 'android' in user_agent_lower:
            device_info['os'] = 'Android'
            device_info['device'] = 'Mobile'
        elif 'iphone' in user_agent_lower or 'ipad' in user_agent_lower:
            device_info['os'] = 'iOS'
            device_info['device'] = 'Mobile' if 'iphone' in user_agent_lower else 'Tablet'
        
        # Detect Browser
        if 'chrome' in user_agent_lower:
            device_info['browser'] = 'Chrome'
        elif 'firefox' in user_agent_lower:
            device_info['browser'] = 'Firefox'
        elif 'safari' in user_agent_lower and 'chrome' not in user_agent_lower:
            device_info['browser'] = 'Safari'
        elif 'edge' in user_agent_lower:
            device_info['browser'] = 'Edge'
        elif 'postman' in user_agent_lower:
            device_info['browser'] = 'Postman'
            device_info['device'] = 'API Client'
        
        return device_info
    
    def end_user_sessions(self, user, except_session_key=None):
        """
        End all active sessions for a user.
        
        Args:
            user: User instance
            except_session_key: Optional session key to exclude from ending
        """
        sessions = self.filter(user=user, is_active=True)
        
        if except_session_key:
            sessions = sessions.exclude(session_key=except_session_key)
        
        # Update all matching sessions
        sessions.update(
            is_active=False,
            logout_time=timezone.now()
        )
        
        return sessions.count()
    
    def end_session(self, session_key):
        """
        End a specific session by session key.
        
        Args:
            session_key: The session key to end
        
        Returns:
            Boolean indicating success
        """
        try:
            session = self.get(session_key=session_key, is_active=True)
            session.is_active = False
            session.logout_time = timezone.now()
            session.save()
            return True
        except self.model.DoesNotExist:
            return False
    
    def get_active_sessions(self, user):
        """Get all active sessions for a user."""
        return self.filter(user=user, is_active=True).order_by('-login_time')
    
    def cleanup_expired_sessions(self, hours=24):
        """
        Clean up sessions that have been inactive for specified hours.
        
        Args:
            hours: Number of hours of inactivity before considering expired
        """
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours)
        
        # End sessions that haven't been active
        expired = self.filter(
            is_active=True,
            last_activity__lt=cutoff_time
        )
        
        count = expired.count()
        expired.update(
            is_active=False,
            logout_time=timezone.now()
        )
        
        return count
    
    def update_activity(self, session_key):
        """Update last activity time for a session."""
        try:
            session = self.get(session_key=session_key, is_active=True)
            session.last_activity = timezone.now()
            session.save(update_fields=['last_activity'])
            return True
        except self.model.DoesNotExist:
            return False
