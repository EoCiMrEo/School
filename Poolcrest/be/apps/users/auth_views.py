"""
Enhanced Authentication Views with Cookie-Based JWT Storage

Provides secure authentication endpoints that store JWT tokens
in httpOnly cookies to prevent XSS attacks.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone
from django.contrib.auth import authenticate
from django.conf import settings
from django.middleware.csrf import get_token
import json
import os
import hashlib
import random

from apps.users.models import User, UserSession
from apps.users.models import EmailVerificationCode
from apps.quotes.services import attach_guest_quotes_to_profile
from apps.users.serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer
)
from config.logging import get_logger

logger = get_logger('users.auth')


def set_auth_cookies(response, access_token, refresh_token):
    """
    Set JWT tokens as httpOnly cookies in the response
    """
    is_production = getattr(settings, 'IS_PRODUCTION', False)
    cookie_secure = getattr(settings, 'JWT_AUTH_COOKIE_SECURE', is_production)
    cookie_samesite = getattr(settings, 'JWT_AUTH_COOKIE_SAMESITE', 'Lax')
    cookie_domain = getattr(settings, 'JWT_AUTH_COOKIE_DOMAIN', None)
    
    # In development, don't use secure cookies (HTTP doesn't support it)
    # Also don't set domain to allow cookies to work on localhost
    if not is_production:
        cookie_secure = False
        cookie_samesite = 'Lax'
        cookie_domain = None  # Let browser decide (works for localhost)
    
    # Set access token cookie (1 hour)
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=3600,  # 1 hour
        httponly=True,  # Prevent JavaScript access
        secure=cookie_secure,  # HTTPS only in production
        samesite=cookie_samesite,  # CSRF protection
        domain=cookie_domain,
        path='/',  # Available on all paths
    )
    
    # Set refresh token cookie (7 days)
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=604800,  # 7 days
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        domain=cookie_domain,
        path='/',  # Available on all paths
    )
    
    # Log cookie setting in development
    if settings.DEBUG:
        print(f"🍪 Setting cookies: access_token (1h), refresh_token (7d)")
        print(f"   Domain: {cookie_domain or 'browser default'}")
        print(f"   Secure: {cookie_secure}, SameSite: {cookie_samesite}")
        print(f"   HttpOnly: True, Path: /")


def clear_auth_cookies(response):
    """Clear JWT token cookies from the response"""
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')


def get_client_info(request):
    """Extract client information from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0].strip()
    else:
        ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
    
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    device_info = {
        'os': 'unknown',
        'device': 'Desktop',
        'browser': 'unknown',
        'raw_user_agent': user_agent
    }
    
    if 'Windows' in user_agent:
        device_info['os'] = 'Windows'
    elif 'Mac' in user_agent:
        device_info['os'] = 'macOS'
    elif 'Linux' in user_agent:
        device_info['os'] = 'Linux'
    elif 'Android' in user_agent:
        device_info['os'] = 'Android'
        device_info['device'] = 'Mobile'
    elif 'iPhone' in user_agent or 'iPad' in user_agent:
        device_info['os'] = 'iOS'
        device_info['device'] = 'Mobile' if 'iPhone' in user_agent else 'Tablet'
    
    if 'Chrome' in user_agent:
        device_info['browser'] = 'Chrome'
    elif 'Firefox' in user_agent:
        device_info['browser'] = 'Firefox'
    elif 'Safari' in user_agent and 'Chrome' not in user_agent:
        device_info['browser'] = 'Safari'
    elif 'Edge' in user_agent:
        device_info['browser'] = 'Edge'
    
    return {
        'ip_address': ip_address,
        'user_agent': user_agent,
        'device_info': device_info
    }


def create_user_session(user, request):
    """Create a new user session"""
    client_info = get_client_info(request)
    
    session_key = hashlib.sha256(
        f"{user.id}{timezone.now()}{random.random()}".encode()
    ).hexdigest()[:40]
    
    user_session = UserSession.objects.create(
        user=user,
        session_key=session_key,
        ip_address=client_info['ip_address'],
        user_agent=client_info['user_agent'],
        device_info=client_info['device_info'],
        is_active=True
    )
    
    return user_session


class LoginView(APIView):
    """
    POST /api/users/auth/login/
    Secure login endpoint that stores tokens in httpOnly cookies
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # Do not attempt JWT auth on login
    throttle_scope = 'login'
    
    def post(self, request, *args, **kwargs):
        """Handle login with cookie-based token storage"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.filter(email=email).first()
            
            if not user:
                logger.warning(f"Login attempt for non-existent user: {email}")
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.is_active:
                return Response(
                    {'error': 'Account is disabled'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if not user.check_password(password):
                user.failed_login_attempts += 1
                user.save(update_fields=['failed_login_attempts'])
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Create user session
            user_session = create_user_session(user, request)

            linked_guest_quotes = 0
            profile = getattr(user, 'profile', None)
            if profile:
                try:
                    linked_guest_quotes = attach_guest_quotes_to_profile(profile)
                except Exception as exc:
                    logger.warning(
                        "Failed to attach guest quotes during login for %s: %s",
                        user.email,
                        exc,
                    )
            
            # Update user's last login info
            client_info = get_client_info(request)
            user.last_login = timezone.now()
            user.last_login_ip = client_info['ip_address']
            user.failed_login_attempts = 0
            user.save(update_fields=['last_login', 'last_login_ip', 'failed_login_attempts'])
            
            response_data = {
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user, context={'request': request}).data,
                'session': {
                    'session_key': user_session.session_key,
                    'ip_address': client_info['ip_address'],
                    'device': client_info['device_info'].get('device', 'Unknown'),
                    'browser': client_info['device_info'].get('browser', 'Unknown')
                }
            }

            if linked_guest_quotes:
                response_data['linked_guest_quotes'] = linked_guest_quotes
            
            response = Response(response_data, status=status.HTTP_200_OK)
            set_auth_cookies(response, access_token, refresh_token)
            
            # Debug: Log response headers
            if settings.DEBUG:
                # Avoid printing raw token values in logs
                print("📤 Login Response Headers (sanitized for cookies)")
                for key, value in response.items():
                    if 'set-cookie' in key.lower():
                        print(f"   {key}: [httpOnly cookies set]")
            
            logger.info(f"User {user.email} logged in successfully")
            return response
            
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response(
                {'error': 'Login failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    POST /api/users/auth/logout/
    Secure logout endpoint that clears cookies and blacklists tokens
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle logout with cookie clearing and token blacklisting"""
        try:
            # Get refresh token from cookie
            refresh_token = request.COOKIES.get('refresh_token')
            session_key = request.data.get('session_key')
            
            # Blacklist the refresh token
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                    logger.info(f"Refresh token blacklisted for user {request.user.email}")
                except TokenError as e:
                    logger.warning(f"Could not blacklist token: {e}")
                except Exception as e:
                    logger.error(f"Token blacklist error: {e}")
            
            # End user session
            if session_key:
                try:
                    session = UserSession.objects.get(
                        user=request.user,
                        session_key=session_key,
                        is_active=True
                    )
                    session.logout_time = timezone.now()
                    session.is_active = False
                    session.save()
                    logger.info(f"Session {session_key} ended for user {request.user.email}")
                except UserSession.DoesNotExist:
                    logger.warning(f"Session {session_key} not found")
            else:
                # SAFER DEFAULT: If no explicit session_key is provided,
                # end only the most recent active session for this user
                # instead of terminating all devices unexpectedly.
                latest_session = (
                    UserSession.objects.filter(user=request.user, is_active=True)
                    .order_by('-login_time')
                    .first()
                )
                if latest_session:
                    latest_session.logout_time = timezone.now()
                    latest_session.is_active = False
                    latest_session.save(update_fields=['logout_time', 'is_active'])
                    logger.info(
                        f"Ended latest session {latest_session.session_key} for user {request.user.email}"
                    )
                else:
                    logger.info(
                        f"No active sessions found to end for user {request.user.email}"
                    )
            
            # Clear Django session
            if hasattr(request, 'session'):
                request.session.flush()
            
            response = Response(
                {'success': True, 'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
            
            # Clear auth cookies
            clear_auth_cookies(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response(
                {'error': 'Logout failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegisterView(APIView):
    """
    POST /api/users/auth/register/
    Secure registration endpoint with cookie-based auto-login
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # No auth required for registration
    throttle_classes = []  # DRF handles scoped throttling via DEFAULT_THROTTLE_CLASSES
    throttle_scope = 'register'
    
    def post(self, request):
        """Handle user registration with cookie-based auth"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create user
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            from django.utils.html import strip_tags
            from django.utils.http import urlencode
            user = serializer.save()

            linked_guest_quotes = 0
            profile = getattr(user, 'profile', None)
            if profile:
                try:
                    linked_guest_quotes = attach_guest_quotes_to_profile(profile)
                except Exception as exc:
                    logger.warning(
                        "Failed to attach guest quotes during registration for %s: %s",
                        user.email,
                        exc,
                    )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Create initial session
            user_session = create_user_session(user, request)
            
            response_data = {
                'success': True,
                'message': 'Registration successful',
                'user': UserSerializer(user).data,
                'session': {
                    'session_key': user_session.session_key
                }
            }

            if linked_guest_quotes:
                response_data['linked_guest_quotes'] = linked_guest_quotes
            
            response = Response(response_data, status=status.HTTP_201_CREATED)
            set_auth_cookies(response, access_token, refresh_token)
            
            logger.info(f"New user registered: {user.email}")
            # Fire-and-forget welcome email (HTML) with verify link
            try:
                # Build a verification token and link (only if not verified yet)
                verify_url = None
                if not getattr(user, 'is_email_verified', False):
                    try:
                        code_obj = EmailVerificationCode.create_or_replace(
                            user,
                            ttl_minutes=60*24,  # 24 hours
                            ip=request.META.get('REMOTE_ADDR')
                        )
                        origin = request.headers.get('Origin') or request.META.get('HTTP_ORIGIN')
                        if not origin:
                            origin = os.getenv('FRONTEND_ORIGIN', 'http://localhost:4028')
                        params = urlencode({'token': code_obj.token})
                        verify_url = f"{origin.rstrip('/')}/auth/verify-email?{params}"
                    except Exception as exc:
                        logger.warning(f"Could not prepare verification link for welcome email: {exc}")

                context = {
                    'user_name': getattr(user, 'full_name', None) or getattr(user, 'email', ''),
                    'company_name': getattr(settings, 'COMPANY_NAME', 'Poolcrest'),
                    'support_email': getattr(settings, 'COMPANY_EMAIL', 'support@poolcrest.com'),
                    'verify_url': verify_url,
                }
                html_message = render_to_string('emails/welcome_email.html', context)
                plain_message = strip_tags(html_message)
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@poolcrest.local')
                send_mail(
                    subject=f"Welcome to {context['company_name']}",
                    message=plain_message,
                    from_email=from_email,
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=getattr(settings, 'EMAIL_FAIL_SILENTLY', True),
                )
            except Exception as exc:
                logger.warning(f"Welcome email not sent for {user.email}: {exc}")
            return response
            
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RefreshTokenView(APIView):
    """
    POST /api/users/auth/refresh/
    Refresh access token using refresh token from httpOnly cookie
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # Do not attempt JWT auth on refresh
    
    def post(self, request):
        """Refresh the access token using the refresh token cookie"""
        refresh_token = request.COOKIES.get(settings.JWT_AUTH_REFRESH_COOKIE)
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)

            validated = serializer.validated_data
            access_token = validated.get('access')
            rotated_refresh_token = validated.get('refresh') or refresh_token

            response_data = {
                'success': True,
                'message': 'Token refreshed successfully'
            }

            response = Response(response_data, status=status.HTTP_200_OK)

            # Re-issue cookies so both tokens stay in sync with rotation settings
            if access_token:
                set_auth_cookies(response, access_token, rotated_refresh_token)

            logger.info("Access token refreshed successfully")
            return response

        except TokenError as e:
            logger.warning(f"Token refresh rejected: {e}")
        except Exception as e:
            logger.error(f"Token refresh error: {e}")

        response = Response(
            {'error': 'Invalid or expired refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
        clear_auth_cookies(response)
        return response


class CSRFTokenView(APIView):
    """
    GET /api/users/auth/csrf/
    Issue a CSRF token and set the csrftoken cookie for SPA clients.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token}, status=status.HTTP_200_OK)


class ValidateTokenView(APIView):
    """
    GET /api/auth/validate/
    Validate if the current token is valid and session is active.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Check if token and session are valid."""
        session_key = request.headers.get('X-Session-Key')
        
        # Check if user has active session
        if session_key:
            try:
                session = UserSession.objects.get(
                    user=request.user,
                    session_key=session_key,
                    is_active=True
                )
                # Update last activity
                session.last_activity = timezone.now()
                session.save(update_fields=['last_activity'])
                
                return Response({
                    'valid': True,
                    'user': UserSerializer(request.user).data,
                    'session': {
                        'session_key': session_key,
                        'login_time': session.login_time,
                        'last_activity': session.last_activity
                    }
                })
            except UserSession.DoesNotExist:
                return Response({
                    'valid': False,
                    'error': 'Session not found or expired'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Token is valid but no session tracking
        return Response({
            'valid': True,
            'user': UserSerializer(request.user).data,
            'session': None
        })


class GetMeView(APIView):
    """
    GET /api/users/auth/me/
    Get current authenticated user's information
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return current user's data"""
        session_key = request.headers.get('X-Session-Key')
        session_obj = None

        if session_key:
            try:
                session_obj = UserSession.objects.get(
                    user=request.user,
                    session_key=session_key,
                    is_active=True
                )
            except UserSession.DoesNotExist:
                session_obj = None

        if session_obj is None:
            session_obj = (
                UserSession.objects.filter(user=request.user, is_active=True)
                .order_by('-login_time')
                .first()
            )

        session_payload = None
        if session_obj:
            session_obj.last_activity = timezone.now()
            session_obj.save(update_fields=['last_activity'])

            session_payload = {
                'session_key': session_obj.session_key,
                'ip_address': session_obj.ip_address,
                'device_info': session_obj.device_info,
                'login_time': session_obj.login_time,
                'last_activity': session_obj.last_activity,
                'is_active': session_obj.is_active,
            }

        return Response({
                'success': True,
                'user': UserSerializer(request.user, context={'request': request}).data,
                'session': session_payload
            })


class SessionListView(APIView):
    """
    GET /api/auth/sessions/
    List all sessions for the current user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all sessions for current user."""
        sessions = UserSession.objects.filter(user=request.user).order_by('-login_time')
        
        session_data = []
        for session in sessions[:20]:  # Limit to last 20 sessions
            session_data.append({
                'session_key': session.session_key,
                'ip_address': session.ip_address,
                'device_info': session.device_info,
                'login_time': session.login_time,
                'logout_time': session.logout_time,
                'last_activity': session.last_activity,
                'is_active': session.is_active,
                'duration': str(session.duration) if session.logout_time else None
            })
        
        return Response({
            'sessions': session_data,
            'active_count': sessions.filter(is_active=True).count(),
            'total_count': sessions.count()
        })


class TerminateSessionView(APIView):
    """
    POST /api/auth/sessions/{session_key}/terminate/
    Terminate a specific session.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_key):
        """Terminate a specific session."""
        try:
            session = UserSession.objects.get(
                user=request.user,
                session_key=session_key,
                is_active=True
            )
            session.logout_time = timezone.now()
            session.is_active = False
            session.save()
            
            return Response({
                'message': 'Session terminated successfully'
            })
        except UserSession.DoesNotExist:
            return Response({
                'error': 'Session not found'
            }, status=status.HTTP_404_NOT_FOUND)


class TerminateAllSessionsView(APIView):
    """
    POST /api/auth/sessions/terminate-all/
    Terminate all sessions except current.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Terminate all sessions except current."""
        current_session_key = request.data.get('current_session_key')
        
        # End all sessions except current
        sessions = UserSession.objects.filter(
            user=request.user,
            is_active=True
        )
        
        if current_session_key:
            sessions = sessions.exclude(session_key=current_session_key)
        
        count = sessions.update(
            logout_time=timezone.now(),
            is_active=False
        )
        
        return Response({
            'message': f'Terminated {count} sessions'
        })
