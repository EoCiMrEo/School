"""
RESTful API views for user management.
Provides complete CRUD operations with role-based permissions.
"""

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.http import urlencode
import os

from apps.users.models import User, UserProfile, UserSession, PasswordResetToken, EmailVerificationCode
from apps.users.serializers import (
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, CustomTokenObtainPairSerializer,
    UserSessionSerializer, StaffUserCreationSerializer
)

from apps.users.permissions import (
    IsOwnerOrAdmin, IsAdminOrManager, IsAuthenticated,
    IsAdminOnly, IsOwnerOrReadOnly
)

from django.shortcuts import render
# Create your views here.
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import User, UserProfile  # replace with your app name

from config.logging import get_logger

logger = get_logger('users.views')


@login_required
def dashboard_view(request):
    users = User.objects.all().select_related('profile')  # assuming OneToOneField named `profile`
    return render(request, 'dashboard.html', {'users': users})

# ============================================================================
# Authentication Views
# ============================================================================

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login endpoint that returns JWT tokens and user info.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle login with session tracking."""
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user from email
            email = request.data.get('email') or request.data.get('username')
            try:
                user = User.objects.get(email=email)
                
                # Create session record in our custom UserSession model
                from apps.users.models import UserSession
                session = UserSession.objects.create_session(user, request)
                
                # Update last login
                user.last_login = timezone.now()
                user.last_login_ip = UserSession.objects.get_client_ip(request)
                user.save(update_fields=['last_login', 'last_login_ip'])
                
                # Add session info to response
                response.data['session_key'] = session.session_key
                response.data['user'] = UserSerializer(user, context={'request': request}).data
                
                logger.info(f"User {user.email} logged in successfully from {session.ip_address}")
                
            except User.DoesNotExist:
                pass
        
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout endpoint that blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle logout with token blacklisting."""
        try:
            # Get refresh token from request
            refresh_token = request.data.get('refresh_token')

            # Blacklist the refresh token
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # End user sessions
            UserSession.objects.end_user_sessions(
                request.user,
                except_session_key=request.session.session_key if hasattr(request, 'session') else None
            )
            
            # Clear Django session
            if hasattr(request, 'session'):
                request.session.flush()  

            logger.info(f"User {request.user.email} logged out")

            return Response(
                {"detail": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    Refresh JWT access token.
    """
    pass


class RegisterView(APIView):
    """
    POST /api/auth/register/
    User registration endpoint.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def post(self, request):
        """Handle user registration."""
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens for auto-login
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================================
# User Management Views
# ============================================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model.
    Provides CRUD operations with role-based permissions.
    
    Endpoints:
    - GET /api/users/ - List all users (admin/manager only)
    - GET /api/users/{id}/ - Get user details
    - PUT /api/users/{id}/ - Update user (full)
    - PATCH /api/users/{id}/ - Update user (partial)
    - DELETE /api/users/{id}/ - Delete user (admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_staff', 'is_email_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'last_login', 'email']
    ordering = ['-date_joined']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'list':
            permission_classes = [IsAdminOrManager]
        elif self.action == 'create':
            permission_classes = [IsAdminOrManager]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [IsOwnerOrAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAdminOnly]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        # Admins see all users
        if hasattr(user, 'profile') and user.profile.is_admin:
            return User.objects.all()
        
        # Managers see customers and technicians
        elif hasattr(user, 'profile') and user.profile.is_manager:
            return User.objects.filter(
                Q(profile__role='customer') | 
                Q(profile__role='technician') |
                Q(id=user.id)
            )
        
        # Regular users only see themselves
        else:
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        GET /api/users/me/
        Get current user's information.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_me(self, request):
        """
        PATCH /api/users/update_me/
        Update current user's information.
        """
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrAdmin])
    def change_password(self, request, pk=None):
        """
        POST /api/users/{id}/change_password/
        Change user password.
        """
        user = self.get_object()
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Password changed successfully'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOnly])
    def reset_password(self, request, pk=None):
        """
        POST /api/users/{id}/reset_password/
        Admin can reset any user's password.
        """
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response(
                {'error': 'New password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        # End all user sessions
        UserSession.objects.end_user_sessions(user)
        
        logger.info(f"Password reset for {user.email} by admin {request.user.email}")
        
        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def activate(self, request, pk=None):
        """
        POST /api/users/{id}/activate/
        Activate a user account.
        """
        user = self.get_object()
        user.is_active = True
        user.save()
        
        if hasattr(user, 'profile'):
            user.profile.status = 'active'
            user.profile.save()
        
        return Response(
            {'message': f'User {user.email} activated'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def deactivate(self, request, pk=None):
        """
        POST /api/users/{id}/deactivate/
        Deactivate a user account.
        """
        user = self.get_object()
        
        # Don't allow deactivating yourself
        if user == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = False
        user.save()
        
        if hasattr(user, 'profile'):
            user.profile.status = 'inactive'
            user.profile.save()
        
        # End all user sessions
        UserSession.objects.end_user_sessions(user)
        
        return Response(
            {'message': f'User {user.email} deactivated'},
            status=status.HTTP_200_OK
        )

# ============================================================================
# UserProfile Management Views
# ============================================================================

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserProfile model.
    
    Endpoints:
    - GET /api/profiles/ - List all profiles
    - GET /api/profiles/{id}/ - Get profile details
    - POST /api/profiles/ - Create profile (admin/manager)
    - PUT /api/profiles/{id}/ - Update profile (full)
    - PATCH /api/profiles/{id}/ - Update profile (partial)
    - DELETE /api/profiles/{id}/ - Delete profile (admin only)
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'status', 'preferred_contact_method']
    search_fields = ['full_name', 'phone', 'company_name', 'user__email']
    ordering_fields = ['created_at', 'full_name']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action == 'create':
            permission_classes = [IsAdminOrManager]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsOwnerOrAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAdminOnly]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        # Admins and managers see all profiles
        if hasattr(user, 'profile') and user.profile.can_manage_users:
            return UserProfile.objects.all()
        
        # Regular users only see their own profile
        else:
            return UserProfile.objects.filter(user=user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """
        GET /api/profiles/my_profile/
        Get current user's profile.
        """
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_my_profile(self, request):
        """
        PATCH /api/profiles/update_my_profile/
        Update current user's profile.
        """
        try:
            profile = request.user.profile
            serializer = self.get_serializer(
                profile,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def create_user_account(self, request, pk=None):
        """
        POST /api/profiles/{id}/create_user_account/
        Create a user account for a profile without one.
        """
        profile = self.get_object()
        
        if profile.user:
            return Response(
                {'error': 'Profile already has a user account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user data from request
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Create user and link to profile
                from apps.users.signals import set_profile_to_link
                
                set_profile_to_link(profile.id)
                
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=profile.full_name.split()[0] if ' ' in profile.full_name else profile.full_name,
                    last_name=profile.full_name.split()[-1] if ' ' in profile.full_name else ''
                )
                
                # Verify link
                profile.refresh_from_db()
                if profile.user != user:
                    profile.user = user
                    profile.save()
                
                return Response({
                    'message': 'User account created successfully',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrManager])
    def without_users(self, request):
        """
        GET /api/profiles/without_users/
        Get all profiles that don't have user accounts.
        """
        profiles = UserProfile.objects.filter(user__isnull=True)
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrManager])
    def by_role(self, request):
        """
        GET /api/profiles/by_role/?role=customer
        Get profiles filtered by role.
        """
        role = request.query_params.get('role')
        if not role:
            return Response(
                {'error': 'Role parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profiles = UserProfile.objects.filter(role=role)
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)


# ============================================================================
# Password Reset Views
# ============================================================================

class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/
    Request password reset email.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'password_reset'
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        """Handle password reset request."""
        serializer = self.serializer_class(
            data=request.data,
            context={'ip_address': UserSession.objects.get_client_ip(request)}
        )
        
        if serializer.is_valid():
            # Always respond generically to prevent user enumeration
            try:
                serializer.save()
            except Exception:
                # Intentionally swallow specific errors to avoid revealing account existence
                pass
            return Response(
                {'message': 'If the email exists, a reset link has been sent'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm/
    Confirm password reset with token.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        """Handle password reset confirmation."""
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'Password reset successful'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================================
# Email Verification (basic placeholders)
# ============================================================================

class ResendVerificationEmailView(APIView):
    """
    POST /api/auth/resend-verification/
    Resend verification email to current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _frontend_origin(self, request):
        origin = request.headers.get('Origin') or request.META.get('HTTP_ORIGIN')
        if origin:
            return origin
        # Fallback to dev vite origin
        return os.getenv('FRONTEND_ORIGIN', 'http://localhost:4028')

    def post(self, request):
        try:
            user: User = request.user

            if user.is_email_verified:
                return Response({"message": "Email already verified"}, status=status.HTTP_200_OK)

            # Create fresh verification record (generates token)
            code_obj = EmailVerificationCode.create_or_replace(
                user,
                ttl_minutes=10,
                ip=UserSession.objects.get_client_ip(request),
            )

            # Build magic link to FE page
            base = self._frontend_origin(request).rstrip('/')
            params = urlencode({'token': code_obj.token})
            verify_url = f"{base}/auth/verify-email?{params}"

            # Compose HTML email (no OTP code shown)
            subject = "Confirm your email"
            context = {
                'user_name': user.get_full_name() or user.email,
                'verify_url': verify_url,
                'company_name': getattr(settings, 'COMPANY_NAME', 'Poolcrest'),
                'support_email': getattr(settings, 'COMPANY_EMAIL', 'support@poolcrest.com'),
            }
            html_message = render_to_string('emails/verify_email.html', context)
            plain_message = strip_tags(html_message)
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@poolcrest.local')

            try:
                sent = send_mail(
                    subject,
                    plain_message,
                    from_email,
                    [user.email],
                    html_message=html_message,
                    fail_silently=getattr(settings, 'EMAIL_FAIL_SILENTLY', False),
                )
                logger.info(
                    f"Verification email dispatch result: sent={sent} host={getattr(settings, 'EMAIL_HOST', 'unknown')}"
                )
            except Exception as e:
                logger.warning(f"Failed to send verification email: {e}")

            logger.info(f"Verification email generated for {user.email}")
            return Response({"message": "Verification email sent"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    Verify email using either a magic-link token or a 6-digit code. If the
    request is authenticated and provides a code, the current user is assumed.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = (request.data.get('token') or '').strip()
        code = (request.data.get('code') or '').strip()
        email = (request.data.get('email') or '').strip().lower()

        try:
            user = None
            record = None

            # Token flow (can be unauthenticated)
            if token:
                try:
                    record = EmailVerificationCode.objects.select_related('user').get(token=token, is_used=False)
                except EmailVerificationCode.DoesNotExist:
                    return Response({"error": "Invalid or used token"}, status=status.HTTP_400_BAD_REQUEST)

                user = record.user
            else:
                # Code flow - prefer authenticated user
                if request.user and request.user.is_authenticated:
                    user = request.user
                elif email:
                    user = User.objects.filter(email=email).first()
                if not user:
                    return Response({"error": "Authentication or email required"}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    record = EmailVerificationCode.objects.filter(user=user, is_used=False).order_by('-created_at').first()
                except EmailVerificationCode.DoesNotExist:
                    record = None

                if not record:
                    return Response({"error": "No active verification code. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

                if not code or record.code != code:
                    # Increment attempts to discourage brute force
                    record.attempts = (record.attempts or 0) + 1
                    record.save(update_fields=['attempts'])
                    return Response({"error": "Invalid verification code"}, status=status.HTTP_400_BAD_REQUEST)

            # Final checks
            if record.is_used:
                return Response({"error": "This verification has already been used"}, status=status.HTTP_400_BAD_REQUEST)
            if record.is_expired():
                return Response({"error": "Verification code has expired"}, status=status.HTTP_400_BAD_REQUEST)

            # Mark user verified
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified'])

            # Mark record used and invalidate others
            record.mark_used()
            EmailVerificationCode.objects.filter(user=user, is_used=False).update(is_used=True)

            logger.info(f"Email verified for {user.email}")
            return Response({"message": "Email verified"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# User Session Views
# ============================================================================

class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for UserSession model (read-only).
    
    Endpoints:
    - GET /api/sessions/ - List user sessions
    - GET /api/sessions/{id}/ - Get session details
    """
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['login_time', 'last_activity']
    ordering = ['-login_time']
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        # Admins see all sessions
        if hasattr(user, 'profile') and user.profile.is_admin:
            return UserSession.objects.all()
        
        # Regular users only see their own sessions
        else:
            return UserSession.objects.filter(user=user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_sessions(self, request):
        """
        GET /api/sessions/my_sessions/
        Get current user's sessions.
        """
        sessions = UserSession.objects.filter(user=request.user)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def end_all(self, request):
        """
        POST /api/sessions/end_all/
        End all sessions for current user.
        """
        UserSession.objects.end_user_sessions(request.user)
        return Response(
            {'message': 'All sessions ended'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrAdmin])
    def end(self, request, pk=None):
        """
        POST /api/sessions/{id}/end/
        End a specific session.
        """
        session = self.get_object()
        session.end_session()
        return Response(
            {'message': 'Session ended'},
            status=status.HTTP_200_OK
        )


# ============================================================================
# Admin/Staff Views
# ============================================================================

class StaffUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and managing staff users (admin only).
    
    Endpoints:
    - GET /api/staff/ - List all staff users
    - POST /api/staff/ - Create new staff user
    - PUT/PATCH /api/staff/{id}/ - Update staff user
    - DELETE /api/staff/{id}/ - Delete staff user
    """
    queryset = User.objects.filter(is_staff=True)
    serializer_class = StaffUserCreationSerializer
    permission_classes = [IsAdminOnly]
    
    def create(self, request, *args, **kwargs):
        """Create new staff user."""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================================
# Statistics Views
# ============================================================================

class UserStatisticsView(APIView):
    """
    GET /api/stats/users/
    Get user statistics (admin/manager only).
    """
    permission_classes = [IsAdminOrManager]
    
    def get(self, request):
        """Get user statistics."""
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'verified_users': User.objects.filter(is_email_verified=True).count(),
            'staff_users': User.objects.filter(is_staff=True).count(),
            'roles': {
                'admins': UserProfile.objects.filter(role='admin').count(),
                'managers': UserProfile.objects.filter(role='manager').count(),
                'technicians': UserProfile.objects.filter(role='technician').count(),
                'customers': UserProfile.objects.filter(role='customer').count(),
            },
            'recent_registrations': User.objects.filter(
                date_joined__gte=timezone.now() - timezone.timedelta(days=30)
            ).count(),
            'active_sessions': UserSession.objects.filter(is_active=True).count(),
        }
        
        return Response(stats)
