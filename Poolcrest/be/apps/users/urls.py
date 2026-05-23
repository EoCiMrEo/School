"""
URL configuration for users/authentication app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import auth views (cookie-based secure authentication)
from .auth_views import (
    LoginView,
    RegisterView,
    LogoutView,
    RefreshTokenView,
    CSRFTokenView,
    ValidateTokenView,
    GetMeView,
    SessionListView,
    TerminateSessionView,
    TerminateAllSessionsView,
)

from .views import (
    # User management views
    UserViewSet,
    UserProfileViewSet,
    
    # Password management
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ResendVerificationEmailView,
    VerifyEmailView,
    
    # User statistics
    UserStatisticsView,
    
    # Dashboard (temporary)
    dashboard_view,
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')

app_name = 'users'

urlpatterns = [
    # =====================================================================
    # Authentication Endpoints (SECURE - Cookie-based)
    # =====================================================================
    
    # Core Authentication (Secure)
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/csrf/', CSRFTokenView.as_view(), name='csrf_token'),
    path('auth/validate/', ValidateTokenView.as_view(), name='validate_token'),
    path('auth/me/', GetMeView.as_view(), name='current_user'),
    
    # Session Management
    path('auth/sessions/', SessionListView.as_view(), name='session_list'),
    path('auth/sessions/<str:session_key>/terminate/', TerminateSessionView.as_view(), name='terminate_session'),
    path('auth/sessions/terminate-all/', TerminateAllSessionsView.as_view(), name='terminate_all_sessions'),
    
    # Password Management
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
    path('auth/verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    
    # Current User Endpoints
    path('auth/me/', UserViewSet.as_view({'get': 'me'}), name='current_user'),
    path('auth/me/update/', UserViewSet.as_view({'patch': 'update_me'}), name='update_current_user'),
    path('auth/me/change-password/', UserViewSet.as_view({'post': 'change_password'}), name='change_password'),
    
    # Dashboard (temporary)
    path('dashboard/', dashboard_view, name='dashboard'),
    
    # =====================================================================
    # User Management Endpoints (Admin/Manager)
    # =====================================================================
    
    # Include all viewset routes
    path('', include(router.urls)),
    
    # Statistics
    path('stats/', UserStatisticsView.as_view(), name='user_statistics'),
]
