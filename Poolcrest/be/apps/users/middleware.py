"""
Custom middleware to ensure database commits.
This is a real-world pattern used in production Django applications.
"""

from django.db import transaction, connection
import logging
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class DatabaseCommitMiddleware:
    """
    Middleware to ensure database changes are committed.
    Used in production environments where data persistence is critical.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Process the request
        response = self.get_response(request)
        
        # After response is generated, ensure commits
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            try:
                # Commit any pending transactions
                transaction.commit()
                
                # Log successful commits for admin actions
                if '/admin/' in request.path:
                    logger.debug(f"Database commit successful for {request.path}")
                    
            except Exception as e:
                logger.error(f"Error committing transaction: {e}")
        
        return response


class AdminTransactionMiddleware:
    """
    Special middleware for Django admin to ensure saves persist.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Only apply to admin URLs
        if not request.path.startswith('/admin/'):
            return self.get_response(request)
        
        # For admin POST requests (saves)
        if request.method == 'POST':
            # Ensure we're not in a transaction that might rollback
            if connection.in_atomic_block:
                logger.warning("Admin save occurring inside atomic block - may rollback")
        
        response = self.get_response(request)
        
        # After admin saves, explicitly commit
        if request.method == 'POST' and '/admin/' in request.path:
            try:
                # Force commit
                connection.commit()
                logger.info(f"Forced commit for admin save: {request.path}")
            except Exception as e:
                logger.error(f"Failed to commit admin save: {e}")
        
        return response


class TokenBlacklistMiddleware(MiddlewareMixin):
    """
    Middleware to check if the JWT token has been blacklisted.
    """
    
    def process_request(self, request):
        # Only check for API endpoints
        if not request.path.startswith('/api/'):
            return None
            
        # Get authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token_str = auth_header.split(' ')[1]
            
            try:
                # Decode the token
                token = AccessToken(token_str)
                user_id = token.get('user_id')
                
                # Check if user exists and is active
                from apps.users.models import User
                try:
                    user = User.objects.get(id=user_id)
                    if not user.is_active:
                        return JsonResponse(
                            {'error': 'User account is disabled'},
                            status=401
                        )
                    
                    # Check if user has any active sessions
                    # This is optional - only if you want to enforce session-based validation
                    from apps.users.models import UserSession
                    active_sessions = UserSession.objects.filter(
                        user=user,
                        is_active=True
                    ).exists()

                    if not active_sessions:
                        return JsonResponse(
                            {'error': 'No active session found'},
                            status=401
                        )
                    
                except User.DoesNotExist:
                    return JsonResponse(
                        {'error': 'User not found'},
                        status=401
                    )
                    
            except TokenError:
                # Invalid token, let JWT authentication handle it
                pass
        
        return None
