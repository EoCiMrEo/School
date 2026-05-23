"""
Custom validators for user management.
Provides enhanced validation for passwords, emails, and user data.
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.password_validation import CommonPasswordValidator
from config.logging import get_logger

logger = get_logger('users.validators')


class CustomPasswordValidator(CommonPasswordValidator):
    """
    Custom password validator with business-specific rules.
    """
    
    def validate(self, password, user=None):
        """
        Validate password against custom business rules.
        """
        errors = []
        
        # Check minimum length (8 characters)
        if len(password) < 8:
            errors.append(_('Password must be at least 8 characters long.'))
        
        # Check maximum length (128 characters)
        if len(password) > 128:
            errors.append(_('Password must be no more than 128 characters long.'))
        
        # Must contain at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            errors.append(_('Password must contain at least one uppercase letter.'))
        
        # Must contain at least one lowercase letter
        if not re.search(r'[a-z]', password):
            errors.append(_('Password must contain at least one lowercase letter.'))
        
        # Must contain at least one digit
        if not re.search(r'[0-9]', password):
            errors.append(_('Password must contain at least one number.'))
        
        # Must contain at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(_('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).'))
        
        # Check for common patterns
        if self._contains_common_patterns(password):
            errors.append(_('Password contains common patterns that are easily guessed.'))
        
        # Check against user information if provided
        if user:
            if self._contains_user_info(password, user):
                errors.append(_('Password cannot contain your personal information.'))
        
        if errors:
            raise ValidationError(errors)
    
    def _contains_common_patterns(self, password):
        """Check for common password patterns."""
        common_patterns = [
            r'123',
            r'abc',
            r'password',
            r'admin',
            r'qwerty',
            r'pool',  # Business-specific
            r'service',  # Business-specific
        ]
        
        password_lower = password.lower()
        for pattern in common_patterns:
            if pattern in password_lower:
                return True
        return False
    
    def _contains_user_info(self, password, user):
        """Check if password contains user information."""
        password_lower = password.lower()
        
        # Check email parts
        if user.email:
            email_parts = user.email.lower().split('@')[0].split('.')
            for part in email_parts:
                if len(part) > 2 and part in password_lower:
                    return True
        
        # Check name parts
        if user.first_name and len(user.first_name) > 2:
            if user.first_name.lower() in password_lower:
                return True
        
        if user.last_name and len(user.last_name) > 2:
            if user.last_name.lower() in password_lower:
                return True
        
        return False
    
    def get_help_text(self):
        """Return help text for password requirements."""
        return _(
            'Your password must contain at least 8 characters, including uppercase '
            'and lowercase letters, a number, and a special character. It cannot '
            'contain common patterns or your personal information.'
        )


def validate_phone_number(value):
    """
    Validate phone number format.
    Accepts various international formats.
    """
    if not value:
        return
    
    # Remove all non-digit characters except +
    clean_number = re.sub(r'[^\d+]', '', value)
    
    # Check basic format
    if not re.match(r'^\+?1?\d{10,15}$', clean_number):
        raise ValidationError(
            _('Enter a valid phone number. Format: +1234567890 or (123) 456-7890')
        )
    
    # Check for obviously invalid patterns
    if re.match(r'^(\+?1?)(0{10,}|1{10,}|9{10,})$', clean_number):
        raise ValidationError(_('Please enter a valid phone number.'))


def validate_company_name(value):
    """
    Validate company name for business customers.
    """
    if not value:
        return
    
    # Basic length check
    if len(value.strip()) < 2:
        raise ValidationError(_('Company name must be at least 2 characters long.'))
    
    # Check for valid characters (letters, numbers, spaces, common punctuation)
    if not re.match(r'^[a-zA-Z0-9\s\.\-\&\,\'\"]+$', value):
        raise ValidationError(
            _('Company name contains invalid characters. Use only letters, numbers, and common punctuation.')
        )


def validate_role_change(user, new_role, changed_by=None):
    """
    Validate role changes with business logic.
    """
    from apps.users.models import UserRole
    
    # Only admins and managers can change roles
    if changed_by and not (changed_by.profile.is_admin or changed_by.profile.is_manager):
        raise ValidationError(_('You do not have permission to change user roles.'))
    
    # Cannot demote the last admin
    if (user.profile.role == UserRole.ADMIN and 
        new_role != UserRole.ADMIN):
        
        from apps.users.models import UserProfile
        admin_count = UserProfile.objects.filter(
            role=UserRole.ADMIN,
            status='active',
            user__is_active=True
        ).count()
        
        if admin_count <= 1:
            raise ValidationError(_('Cannot remove the last admin user. Promote another user to admin first.'))
    
    # Log the validation
    logger.log_security_event(
        'role_change_validated',
        f'Role change validated for {user.email}: {user.profile.role} -> {new_role}',
        severity='info'
    )


def validate_email_domain(email):
    """
    Validate email domain against business rules.
    """
    if not email:
        return
    
    domain = email.split('@')[1].lower() if '@' in email else ''
    
    # Block common disposable email providers
    blocked_domains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'yopmail.com',
    ]
    
    if domain in blocked_domains:
        raise ValidationError(_('Please use a permanent email address, not a disposable one.'))
    
    # Block obvious fake domains
    fake_patterns = [
        r'test\.com$',
        r'example\.com$',
        r'fake\.com$',
        r'temp\.com$',
    ]
    
    for pattern in fake_patterns:
        if re.search(pattern, domain):
            raise ValidationError(_('Please enter a valid email address.'))


def validate_user_status_change(user, new_status, changed_by=None):
    """
    Validate user status changes.
    """
    from apps.users.models import UserStatus
    
    # Only admins and managers can change status
    if changed_by and not (changed_by.profile.is_admin or changed_by.profile.is_manager):
        raise ValidationError(_('You do not have permission to change user status.'))
    
    # Cannot suspend yourself
    if changed_by and user == changed_by and new_status == UserStatus.SUSPENDED:
        raise ValidationError(_('You cannot suspend your own account.'))
    
    # Cannot suspend the last admin
    if (user.profile.is_admin and 
        new_status == UserStatus.SUSPENDED):
        
        from apps.users.models import UserProfile
        active_admin_count = UserProfile.objects.filter(
            role='admin',
            status='active',
            user__is_active=True
        ).exclude(user=user).count()
        
        if active_admin_count == 0:
            raise ValidationError(_('Cannot suspend the last active admin user.'))


def validate_notification_preferences(preferences):
    """
    Validate notification preferences structure.
    """
    if not isinstance(preferences, dict):
        raise ValidationError(_('Notification preferences must be a valid JSON object.'))
    
    # Define valid preference keys
    valid_keys = {
        'email_notifications',
        'sms_notifications', 
        'appointment_reminders',
        'quote_updates',
        'emergency_alerts',
        'marketing_emails',
        'service_completion_reports',
    }
    
    # Check for invalid keys
    invalid_keys = set(preferences.keys()) - valid_keys
    if invalid_keys:
        raise ValidationError(
            _('Invalid notification preference keys: %(keys)s') % 
            {'keys': ', '.join(invalid_keys)}
        )
    
    # Check for valid boolean values
    for key, value in preferences.items():
        if not isinstance(value, bool):
            raise ValidationError(
                _('Notification preference "%(key)s" must be true or false.') % 
                {'key': key}
            )


def validate_timezone(timezone_str):
    """
    Validate timezone string.
    """
    try:
        import pytz
        pytz.timezone(timezone_str)
    except pytz.exceptions.UnknownTimeZoneError:
        raise ValidationError(_('Invalid timezone. Please select a valid timezone.'))
    except ImportError:
        # If pytz is not available, do basic validation
        if not re.match(r'^[A-Za-z_]+/[A-Za-z_]+$', timezone_str):
            raise ValidationError(_('Invalid timezone format.'))


def validate_address_format(address):
    """
    Basic address validation.
    """
    if not address:
        return
    
    # Basic length check
    if len(address.strip()) < 10:
        raise ValidationError(_('Please enter a complete address.'))
    
    # Check for suspicious patterns
    if re.match(r'^(.)\1{10,}$', address.strip()):  # Repeated characters
        raise ValidationError(_('Please enter a valid address.'))


class BusinessRuleValidator:
    """
    Centralized business rule validator for user-related operations.
    """
    
    @staticmethod
    def validate_customer_creation(data):
        """Validate customer creation data."""
        errors = {}
        
        # Required fields for customers
        required_fields = ['email', 'full_name', 'phone']
        for field in required_fields:
            if not data.get(field):
                errors[field] = _('This field is required for customer registration.')
        
        return errors
    
    @staticmethod
    def validate_staff_creation(data, created_by=None):
        """Validate staff user creation."""
        errors = {}
        
        # Only admins can create other staff
        if created_by and not created_by.profile.is_admin:
            errors['permission'] = _('Only administrators can create staff accounts.')
        
        # Required fields for staff
        required_fields = ['email', 'full_name', 'role']
        for field in required_fields:
            if not data.get(field):
                errors[field] = _('This field is required for staff registration.')
        
        return errors
    
    @staticmethod
    def validate_bulk_operation(users, operation, performed_by=None):
        """Validate bulk operations on users."""
        errors = []
        
        # Check permissions
        if performed_by and not performed_by.profile.can_manage_users:
            errors.append(_('You do not have permission to perform bulk operations.'))
        
        # Limit bulk operation size
        if len(users) > 100:
            errors.append(_('Bulk operations are limited to 100 users at a time.'))
        
        # Check for protected users in destructive operations
        if operation in ['delete', 'suspend']:
            from apps.users.models import UserProfile
            
            protected_users = [
                user for user in users 
                if user.profile.role == 'admin' or user == performed_by
            ]
            
            if protected_users:
                errors.append(
                    _('Cannot perform %(operation)s on admin users or yourself.') % 
                    {'operation': operation}
                )
        
        return errors


# Utility functions for custom validation
def is_strong_password(password):
    """
    Quick check if password meets strength requirements.
    Returns True if strong, False otherwise.
    """
    try:
        validator = CustomPasswordValidator()
        validator.validate(password)
        return True
    except ValidationError:
        return False


def sanitize_user_input(data):
    """
    Sanitize user input data.
    """
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            # Strip whitespace
            value = value.strip()
            
            # Remove null bytes
            value = value.replace('\x00', '')
            
            # Limit length for text fields
            if key in ['full_name', 'company_name']:
                value = value[:255]
            elif key == 'address':
                value = value[:500]
            elif key == 'internal_notes':
                value = value[:1000]
        
        sanitized[key] = value
    
    return sanitized
