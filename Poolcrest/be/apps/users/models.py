from django.db import models

# Create your models here.
"""
User models for Poolcrest backend.
Mirrors the Supabase user_profiles table structure with Django best practices.
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .managers import UserManager, UserProfileManager, UserSessionManager
import secrets

# Initialize logger
try:
    from config.logging import get_logger
    logger = get_logger('users.models')
except ImportError:
    import logging
    logger = logging.getLogger('apps.users.models')


class UserRole(models.TextChoices):
    """User role choices matching Supabase enum"""
    ADMIN = 'admin', _('Administrator')
    MANAGER = 'manager', _('Manager')
    TECHNICIAN = 'technician', _('Technician')
    CUSTOMER = 'customer', _('Customer')


class UserStatus(models.TextChoices):
    """User status choices matching Supabase enum"""
    ACTIVE = 'active', _('Active')
    INACTIVE = 'inactive', _('Inactive')
    SUSPENDED = 'suspended', _('Suspended')


class User(AbstractUser):
    """
    Extended user model that integrates with Supabase authentication.
    Serves as the primary user model for Django backend operations.
    """
    
    # Override the default id to use UUID (matching Supabase)
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="UUID matching Supabase auth.users.id"
    )
    
    # Email is required and unique
    email = models.EmailField(
        _('email address'),
        unique=True,
        help_text=_('Required. Enter a valid email address.')
    )
    
    # Make username optional (we'll use email as primary identifier)
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text=_('Optional. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[RegexValidator(
            regex=r'^[\w.@+-]+$',
            message=_('Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.')
        )],
    )
    
    # Additional fields for better user management
    is_email_verified = models.BooleanField(
        _('email verified'),
        default=False,
        help_text=_('Designates whether the user has verified their email address.')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    # Custom manager
    objects = UserManager()
    
    class Meta:
        db_table = 'auth_users'  # Custom table name
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active', 'is_email_verified']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def save(self, *args, **kwargs):
        # Auto-generate username if not provided
        if not self.username:
            self.username = self.email
            
        # Log user creation/update
        is_new = not self.pk
        
        super().save(*args, **kwargs)
        
        if is_new:
            if hasattr(logger, 'log_user_action'):
                logger.log_user_action(self.id, 'user_created', f'New user {self.email} created')
            else:
                logger.info(f'New user {self.email} created')
        else:
            if hasattr(logger, 'log_user_action'):
                logger.log_user_action(self.id, 'user_updated', f'User {self.email} updated')
            else:
                logger.info(f'User {self.email} updated')
    
    def get_full_name(self):
        """Return the full name for the user."""
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.email
    
    def is_account_locked(self):
        """Check if account is currently locked due to failed login attempts."""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    def unlock_account(self):
        """Unlock the user account."""
        self.failed_login_attempts = 0
        self.account_locked_until = None
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
        if hasattr(logger, 'log_security_event'):
            logger.log_security_event(
                'account_unlocked', 
                f'Account {self.email} unlocked',
                severity='info'
            )
        else:
            logger.info(f'Account {self.email} unlocked')
    
    def lock_account(self, duration_minutes=30):
        """Lock the user account for a specified duration."""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])
        if hasattr(logger, 'log_security_event'):
            logger.log_security_event(
                'account_locked',
                f'Account {self.email} locked for {duration_minutes} minutes',
                severity='warning'
            )
        else:
            logger.warning(f'Account {self.email} locked for {duration_minutes} minutes')


class UserProfile(models.Model):
    """
    Extended user profile matching Supabase user_profiles table.
    Contains business-specific user information and role-based access.
    """

    # Unique identifier for the user profile
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="ID "
    )
    
    # One-to-one relationship with User model (optional)
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        related_name='profile',
        null=True,  # Allow null to make it optional
        blank=True,  # Allow blank in forms
        help_text="Optional. Link to Django User model. Can be set later."
    )
    
    # Mirror Supabase fields
    full_name = models.CharField(
        _('full name'),
        max_length=255,
        help_text=_('User\'s full name for display purposes')
    )
    
    phone = models.CharField(
        _('phone number'),
        max_length=20,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message=_('Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.')
        )],
        help_text=_('Phone number in international format')
    )
    
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        help_text=_('User role for access control')
    )
    
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=UserStatus.choices,
        default=UserStatus.ACTIVE,
        help_text=_('User account status')
    )
    
    avatar_url = models.URLField(
        _('avatar URL'),
        blank=True,
        null=True,
        help_text=_('URL to user\'s profile picture')
    )
    
    address = models.TextField(
        _('address'),
        blank=True,
        null=True,
        help_text=_('User\'s primary address')
    )
    
    company_name = models.CharField(
        _('company name'),
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Company name (for business customers)')
    )
    
    # Date of Birth
    date_of_birth = models.DateField(
        _('date of birth'),
        null=True,
        blank=True,
        help_text=_('User\'s date of birth')
    )

    # Additional business fields
    timezone = models.CharField(
        _('timezone'),
        max_length=50,
        default='America/New_York',
        help_text=_('User\'s preferred timezone')
    )
    
    language_preference = models.CharField(
        _('language preference'),
        max_length=10,
        default='en',
        choices=[
            ('en', _('English')),
            ('es', _('Spanish')),
            ('fr', _('French')),
        ],
        help_text=_('User\'s preferred language')
    )
    
    notification_preferences = models.JSONField(
        _('notification preferences'),
        default=dict,
        blank=True,
        help_text=_('User notification preferences as JSON')
    )
    
    # Emergency contact information
    emergency_contact_name = models.CharField(
        _('emergency contact name'),
        max_length=255,
        blank=True,
        null=True
    )
    
    emergency_contact_phone = models.CharField(
        _('emergency contact phone'),
        max_length=20,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message=_('Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.')
        )]
    )
    
    # Business metadata
    customer_since = models.DateField(
        _('customer since'),
        null=True,
        blank=True,
        help_text=_('Date when user became a customer')
    )
    
    preferred_contact_method = models.CharField(
        _('preferred contact method'),
        max_length=20,
        choices=[
            ('email', _('Email')),
            ('phone', _('Phone')),
            ('sms', _('SMS')),
            ('app', _('In-App')),
        ],
        default='email',
        help_text=_('User\'s preferred contact method')
    )
    
    # Internal notes (admin only)
    internal_notes = models.TextField(
        _('internal notes'),
        blank=True,
        null=True,
        help_text=_('Internal notes for staff use only')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = UserProfileManager()
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['status']),
            models.Index(fields=['company_name']),
            models.Index(fields=['created_at']),
        ]
        permissions = [
            ('view_internal_notes', 'Can view internal notes'),
            ('edit_user_role', 'Can edit user roles'),
            ('manage_all_users', 'Can manage all users'),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"
    
    def save(self, *args, **kwargs):
        # Set customer_since date for new customers
        if not self.customer_since and self.role == UserRole.CUSTOMER:
            self.customer_since = timezone.now().date()
            
        # Ensure full_name is set
        if not self.full_name and self.user:
            self.full_name = self.user.get_full_name()
            
        # Log profile changes (only if user exists)
        if self.user:
            if self.pk:
                if hasattr(logger, 'log_user_action'):
                    logger.log_user_action(
                        self.user.id, 
                        'profile_updated', 
                        f'Profile updated for {self.user.email}'
                    )
                else:
                    logger.info(f'Profile updated for {self.user.email}')
            else:
                if hasattr(logger, 'log_user_action'):
                    logger.log_user_action(
                        self.user.id, 
                        'profile_created', 
                        f'Profile created for {self.user.email}'
                    )
                else:
                    logger.info(f'Profile created for {self.user.email}')
        else:
            # Log profile without user
            if self.pk:
                logger.info(f'Profile updated: {self.full_name} (no user linked)')
            else:
                logger.info(f'Profile created: {self.full_name} (no user linked)')
            
        super().save(*args, **kwargs)
    
    @property
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == UserRole.ADMIN
    
    @property
    def is_manager(self):
        """Check if user has manager role"""
        return self.role == UserRole.MANAGER
    
    @property
    def is_technician(self):
        """Check if user has technician role"""
        return self.role == UserRole.TECHNICIAN
    
    @property
    def is_customer(self):
        """Check if user has customer role"""
        return self.role == UserRole.CUSTOMER
    
    @property
    def is_staff_member(self):
        """Check if user is staff (admin, manager, or technician)"""
        return self.role in [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN]
    
    @property
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.role in [UserRole.ADMIN, UserRole.MANAGER]
    
    def get_default_notification_preferences(self):
        """Get default notification preferences"""
        return {
            'email_notifications': True,
            'sms_notifications': False,
            'appointment_reminders': True,
            'quote_updates': True,
            'emergency_alerts': True,
            'marketing_emails': False,
            'service_completion_reports': True,
        }
    
    def update_notification_preferences(self, preferences):
        """Update notification preferences"""
        current_prefs = self.notification_preferences or self.get_default_notification_preferences()
        current_prefs.update(preferences)
        self.notification_preferences = current_prefs
        self.save(update_fields=['notification_preferences'])
        
        if self.user:
            if hasattr(logger, 'log_user_action'):
                logger.log_user_action(
                    self.user.id,
                    'notifications_updated',
                    f'Notification preferences updated for {self.user.email}'
                )
            else:
                logger.info(f'Notification preferences updated for {self.user.email}')
        else:
            logger.info(f'Notification preferences updated for profile: {self.full_name}')


class UserSession(models.Model):
    """
    Track user sessions for security and analytics.
    Complements Django's session framework.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    
    session_key = models.CharField(
        _('session key'),
        max_length=40,
        unique=True
    )
    
    ip_address = models.GenericIPAddressField(
        _('IP address')
    )
    
    user_agent = models.TextField(
        _('user agent'),
        blank=True
    )
    
    device_info = models.JSONField(
        _('device information'),
        default=dict,
        blank=True,
        help_text=_('Device and browser information as JSON')
    )
    
    login_time = models.DateTimeField(
        _('login time'),
        auto_now_add=True
    )
    
    last_activity = models.DateTimeField(
        _('last activity'),
        auto_now=True
    )
    
    logout_time = models.DateTimeField(
        _('logout time'),
        null=True,
        blank=True
    )
    
    is_active = models.BooleanField(
        _('is active'),
        default=True
    )
    
    # Custom manager
    objects = UserSessionManager()
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = _('User Session')
        verbose_name_plural = _('User Sessions')
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_key']),
            models.Index(fields=['last_activity']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.ip_address} ({self.login_time})"
    
    def end_session(self):
        """End the user session"""
        self.logout_time = timezone.now()
        self.is_active = False
        self.save(update_fields=['logout_time', 'is_active'])
        
        if hasattr(logger, 'log_security_event'):
            logger.log_security_event(
                'session_ended',
                f'Session ended for {self.user.email} from {self.ip_address}'
            )
        else:
            logger.info(f'Session ended for {self.user.email} from {self.ip_address}')
    
    @property
    def duration(self):
        """Get session duration"""
        end_time = self.logout_time or timezone.now()
        return end_time - self.login_time
    
    @property
    def is_expired(self):
        """Check if session is expired (inactive for more than 24 hours)"""
        if not self.is_active:
            return True
        return timezone.now() - self.last_activity > timezone.timedelta(hours=24)


class PasswordResetToken(models.Model):
    """
    Track password reset tokens for security.
    Complements Django's built-in password reset functionality.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    
    token = models.CharField(
        _('token'),
        max_length=64,
        unique=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = _('Password Reset Token')
        verbose_name_plural = _('Password Reset Tokens')
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'is_used']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    def is_expired(self):
        """Check if token is expired (24 hours)"""
        return timezone.now() - self.created_at > timezone.timedelta(hours=24)
    
    def use_token(self):
        """Mark token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])
        
        if hasattr(logger, 'log_security_event'):
            logger.log_security_event(
                'password_reset_completed',
                f'Password reset completed for {self.user.email}'
            )
        else:
            logger.info(f'Password reset completed for {self.user.email}')


class EmailVerificationCode(models.Model):
    """
    One-time password (OTP) and token records for email verification.
    Supports both code entry and magic-link flows.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verifications'
    )

    # 6-digit numeric code for manual entry
    code = models.CharField(max_length=6)

    # Long token for magic link clicks
    token = models.CharField(max_length=64, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    sent_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = 'email_verification_codes'
        indexes = [
            models.Index(fields=['user', 'is_used']),
            models.Index(fields=['token']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Email verification for {self.user.email}"

    @staticmethod
    def generate_code():
        return f"{secrets.randbelow(1000000):06d}"

    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)

    @classmethod
    def create_or_replace(cls, user, ttl_minutes=10, ip=None):
        # Invalidate previous unused tokens
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        code = cls.generate_code()
        token = cls.generate_token()
        now = timezone.now()
        obj = cls.objects.create(
            user=user,
            code=code,
            token=token,
            expires_at=now + timezone.timedelta(minutes=ttl_minutes),
            sent_ip=ip,
        )
        return obj

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])
