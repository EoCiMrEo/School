"""
Custom managers for User models.
Provides enhanced query methods and business logic for user management.
"""

from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
# Initialize logger
try:
    from config.logging import get_logger
    _logger = get_logger('users.managers')
except ImportError:
    import logging
    _logger = logging.getLogger('apps.users.managers')

# Create a wrapper for logger that handles both custom and standard logger
class LoggerWrapper:
    def __init__(self, logger):
        self._logger = logger
    
    def log_user_action(self, user_id, action, details=None, level='info'):
        if hasattr(self._logger, 'log_user_action'):
            self._logger.log_user_action(user_id, action, details, level)
        else:
            message = f"User {user_id} performed action: {action}"
            if details:
                message += f" | Details: {details}"
            getattr(self._logger, level)(message)
    
    def log_security_event(self, event_type, details, severity='warning'):
        if hasattr(self._logger, 'log_security_event'):
            self._logger.log_security_event(event_type, details, severity)
        else:
            message = f"SECURITY: {event_type} | {details}"
            getattr(self._logger, severity)(message)
    
    def log_database_operation(self, operation, table, record_id=None, details=None):
        if hasattr(self._logger, 'log_database_operation'):
            self._logger.log_database_operation(operation, table, record_id, details)
        else:
            message = f"DB {operation} on {table}"
            if record_id:
                message += f" | ID: {record_id}"
            if details:
                message += f" | {details}"
            self._logger.info(message)
    
    def __getattr__(self, name):
        return getattr(self._logger, name)

logger = LoggerWrapper(_logger)


class UserManager(BaseUserManager):
    """
    Custom manager for User model.
    Handles user creation and common queries.
    """
    
    def _create_user(self, email, password, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        logger.log_user_action(
            user.id,
            'user_created',
            f'User created: {email} with role {extra_fields.get("role", "customer")}'
        )
        
        return user
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_email_verified', False)
        
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self._create_user(email, password, **extra_fields)
    
    def create_staff_user(self, email, password, role='technician', **extra_fields):
        """Create and save a staff user (admin, manager, or technician)."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_email_verified', True)
        
        user = self.create_user(email, password, **extra_fields)
        
        # Create profile with staff role
        from apps.users.models import UserProfile
        UserProfile.objects.create(
            user=user,
            role=role,
            full_name=user.get_full_name(),
            **{k: v for k, v in extra_fields.items() if hasattr(UserProfile, k)}
        )
        
        return user
    
    def create_customer(self, email, password, full_name, **extra_fields):
        """Create and save a customer user."""
        user = self.create_user(email, password, **extra_fields)
        
        # Create customer profile
        from apps.users.models import UserProfile
        UserProfile.objects.create(
            user=user,
            role='customer',
            full_name=full_name,
            **{k: v for k, v in extra_fields.items() if hasattr(UserProfile, k)}
        )
        
        return user
    
    def active_users(self):
        """Get all active users."""
        return self.filter(is_active=True)
    
    def verified_users(self):
        """Get all email-verified users."""
        return self.filter(is_email_verified=True)
    
    def locked_users(self):
        """Get all currently locked users."""
        now = timezone.now()
        return self.filter(account_locked_until__gt=now)
    
    def by_role(self, role):
        """Get users by role."""
        return self.filter(profile__role=role)
    
    def customers(self):
        """Get all customer users."""
        return self.by_role('customer')
    
    def staff(self):
        """Get all staff users (admin, manager, technician)."""
        return self.filter(profile__role__in=['admin', 'manager', 'technician'])
    
    def technicians(self):
        """Get all technician users."""
        return self.by_role('technician')
    
    def managers(self):
        """Get all manager users."""
        return self.by_role('manager')
    
    def admins(self):
        """Get all admin users."""
        return self.by_role('admin')


class UserProfileQuerySet(models.QuerySet):
    """Custom QuerySet for UserProfile model."""
    
    def active(self):
        """Get profiles for active users."""
        return self.filter(status='active', user__is_active=True)
    
    def by_role(self, role):
        """Filter by role."""
        return self.filter(role=role)
    
    def customers(self):
        """Get customer profiles."""
        return self.by_role('customer')
    
    def staff(self):
        """Get staff profiles."""
        return self.filter(role__in=['admin', 'manager', 'technician'])
    
    def technicians(self):
        """Get technician profiles."""
        return self.by_role('technician')
    
    def managers(self):
        """Get manager profiles."""
        return self.by_role('manager')
    
    def admins(self):
        """Get admin profiles."""
        return self.by_role('admin')
    
    def with_company(self):
        """Get profiles that have a company name."""
        return self.exclude(company_name__isnull=True).exclude(company_name='')
    
    def recent(self, days=30):
        """Get recently created profiles."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(created_at__gte=cutoff)
    
    def search(self, query):
        """Search profiles by name, email, or company."""
        return self.filter(
            models.Q(full_name__icontains=query) |
            models.Q(user__email__icontains=query) |
            models.Q(company_name__icontains=query)
        )


class UserProfileManager(models.Manager):
    """Custom manager for UserProfile model."""
    
    def get_queryset(self):
        """Return custom QuerySet."""
        return UserProfileQuerySet(self.model, using=self._db)
    
    def active(self):
        """Get active profiles."""
        return self.get_queryset().active()
    
    def by_role(self, role):
        """Get profiles by role."""
        return self.get_queryset().by_role(role)
    
    def customers(self):
        """Get customer profiles."""
        return self.get_queryset().customers()
    
    def staff(self):
        """Get staff profiles."""
        return self.get_queryset().staff()
    
    def technicians(self):
        """Get technician profiles."""
        return self.get_queryset().technicians()
    
    def managers(self):
        """Get manager profiles."""
        return self.get_queryset().managers()
    
    def admins(self):
        """Get admin profiles."""
        return self.get_queryset().admins()
    
    def with_company(self):
        """Get profiles with company."""
        return self.get_queryset().with_company()
    
    def recent(self, days=30):
        """Get recent profiles."""
        return self.get_queryset().recent(days)
    
    def search(self, query):
        """Search profiles."""
        return self.get_queryset().search(query)
    
    def create_with_user(self, user_data, profile_data):
        """Create user and profile together."""
        from apps.users.models import User
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create profile
        profile_data['user'] = user
        profile = self.create(**profile_data)
        
        logger.log_user_action(
            user.id,
            'user_and_profile_created',
            f'User and profile created for {user.email}'
        )
        
        return profile
    
    def get_by_email(self, email):
        """Get profile by user email."""
        try:
            return self.get(user__email=email)
        except self.model.DoesNotExist:
            return None
    
    def update_role(self, user_id, new_role, updated_by=None):
        """Update user role with logging."""
        try:
            profile = self.get(user__id=user_id)
            old_role = profile.role
            profile.role = new_role
            profile.save(update_fields=['role'])
            
            logger.log_user_action(
                user_id,
                'role_changed',
                f'Role changed from {old_role} to {new_role} by {updated_by or "system"}'
            )
            
            return profile
        except self.model.DoesNotExist:
            logger.log_security_event(
                'role_change_failed',
                f'Attempted to change role for non-existent user {user_id}'
            )
            return None


class UserSessionQuerySet(models.QuerySet):
    """Custom QuerySet for UserSession model."""
    
    def active(self):
        """Get active sessions."""
        return self.filter(is_active=True)
    
    def expired(self):
        """Get expired sessions."""
        cutoff = timezone.now() - timezone.timedelta(hours=24)
        return self.filter(
            models.Q(is_active=False) |
            models.Q(last_activity__lt=cutoff)
        )
    
    def for_user(self, user):
        """Get sessions for a specific user."""
        return self.filter(user=user)
    
    def recent(self, hours=24):
        """Get recent sessions."""
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        return self.filter(login_time__gte=cutoff)
    
    def by_ip(self, ip_address):
        """Get sessions by IP address."""
        return self.filter(ip_address=ip_address)


class UserSessionManager(models.Manager):
    """Custom manager for UserSession model."""
    
    def get_queryset(self):
        """Return custom QuerySet."""
        return UserSessionQuerySet(self.model, using=self._db)
    
    def active(self):
        """Get active sessions."""
        return self.get_queryset().active()
    
    def expired(self):
        """Get expired sessions."""
        return self.get_queryset().expired()
    
    def for_user(self, user):
        """Get sessions for user."""
        return self.get_queryset().for_user(user)
    
    def recent(self, hours=24):
        """Get recent sessions."""
        return self.get_queryset().recent(hours)
    
    def by_ip(self, ip_address):
        """Get sessions by IP."""
        return self.get_queryset().by_ip(ip_address)
    
    def create_session(self, user, request):
        """Create a new user session."""
        from django.contrib.sessions.models import Session
        
        # Get or create Django session
        if not request.session.session_key:
            request.session.create()
        
        # Create user session record
        session = self.create(
            user=user,
            session_key=request.session.session_key,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            device_info=self.parse_user_agent(request.META.get('HTTP_USER_AGENT', ''))
        )
        
        logger.log_security_event(
            'session_created',
            f'New session created for {user.email} from {session.ip_address}'
        )
        
        return session
    
    def end_user_sessions(self, user, except_session_key=None):
        """End all sessions for a user except the specified one."""
        sessions = self.for_user(user).active()
        if except_session_key:
            sessions = sessions.exclude(session_key=except_session_key)
        
        for session in sessions:
            session.end_session()
        
        logger.log_security_event(
            'sessions_ended',
            f'All sessions ended for {user.email} except {except_session_key or "none"}'
        )
    
    def cleanup_expired(self):
        """Remove expired sessions."""
        expired_sessions = self.expired()
        count = expired_sessions.count()
        expired_sessions.delete()
        
        logger.log_database_operation(
            'cleanup',
            'user_sessions',
            details=f'Removed {count} expired sessions'
        )
        
        return count
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def parse_user_agent(user_agent):
        """Parse user agent string to extract device info."""
        # Simple parsing - in production, consider using python-user-agents
        device_info = {
            'raw_user_agent': user_agent,
            'browser': 'unknown',
            'os': 'unknown',
            'device': 'unknown'
        }
        
        if 'Chrome' in user_agent:
            device_info['browser'] = 'Chrome'
        elif 'Firefox' in user_agent:
            device_info['browser'] = 'Firefox'
        elif 'Safari' in user_agent:
            device_info['browser'] = 'Safari'
        elif 'Edge' in user_agent:
            device_info['browser'] = 'Edge'
        
        if 'Windows' in user_agent:
            device_info['os'] = 'Windows'
        elif 'Mac' in user_agent:
            device_info['os'] = 'macOS'
        elif 'Linux' in user_agent:
            device_info['os'] = 'Linux'
        elif 'Android' in user_agent:
            device_info['os'] = 'Android'
        elif 'iOS' in user_agent:
            device_info['os'] = 'iOS'
        
        if 'Mobile' in user_agent:
            device_info['device'] = 'Mobile'
        elif 'Tablet' in user_agent:
            device_info['device'] = 'Tablet'
        else:
            device_info['device'] = 'Desktop'
        
        return device_info
