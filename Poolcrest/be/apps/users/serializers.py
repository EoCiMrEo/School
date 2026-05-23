"""
Serializers for user management API endpoints.
Handles serialization and validation of user data for REST API operations.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.users.models import User, UserProfile, UserSession, PasswordResetToken
from apps.users.validators import (
    validate_phone_number, validate_company_name, validate_email_domain,
    validate_notification_preferences, validate_timezone, CustomPasswordValidator,
    sanitize_user_input
)
from config.logging import get_logger

logger = get_logger('users.serializers')


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    Handles user profile data with role-based field access.
    """
    
    # Read-only fields
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    is_staff_member = serializers.BooleanField(read_only=True)
    customer_since = serializers.DateField(read_only=True)
    
    # Write-only sensitive field
    internal_notes = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user_id', 'user_email', 'full_name', 'phone', 'role', 'status',
            'avatar_url', 'address', 'company_name', 'date_of_birth', 'timezone', 
            'language_preference', 'notification_preferences',
            'emergency_contact_name', 'emergency_contact_phone',
            'customer_since', 'preferred_contact_method', 'internal_notes',
            'is_staff_member', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Remove sensitive fields based on user permissions
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            
            # Only admins and managers can see internal notes
            if not (user.profile.is_admin or user.profile.is_manager):
                self.fields.pop('internal_notes', None)
            
            # Only admins can modify roles and status
            if not user.profile.is_admin:
                self.fields['role'].read_only = True
                self.fields['status'].read_only = True
    
    def validate_phone(self, value):
        """Validate phone number."""
        if value:
            validate_phone_number(value)
        return value
    
    def validate_company_name(self, value):
        """Validate company name."""
        if value:
            validate_company_name(value)
        return value
    
    def validate_notification_preferences(self, value):
        """Validate notification preferences structure."""
        if value:
            validate_notification_preferences(value)
        return value
    
    def validate_timezone(self, value):
        """Validate timezone."""
        validate_timezone(value)
        return value
    
    def validate_emergency_contact_phone(self, value):
        """Validate emergency contact phone."""
        if value:
            validate_phone_number(value)
        return value
    
    def validate(self, attrs):
        """Perform cross-field validation."""
        # Sanitize input data
        attrs = sanitize_user_input(attrs)
        
        # Business rule validation
        request = self.context.get('request')
        current_user = request.user if request else None
        
        # Check role change permissions
        if 'role' in attrs and self.instance:
            from apps.users.validators import validate_role_change
            try:
                validate_role_change(self.instance.user, attrs['role'], current_user)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'role': e.messages})
        
        # Check status change permissions
        if 'status' in attrs and self.instance:
            from apps.users.validators import validate_user_status_change
            try:
                validate_user_status_change(self.instance.user, attrs['status'], current_user)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'status': e.messages})
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update user profile with logging."""
        old_role = instance.role
        old_status = instance.status
        
        updated_instance = super().update(instance, validated_data)
        
        # Log significant changes
        request = self.context.get('request')
        changed_by = request.user if request else None
        
        if old_role != updated_instance.role:
            logger.log_security_event(
                'user_role_updated',
                f'User {instance.user.email} role changed from {old_role} to {updated_instance.role} by {changed_by or "system"}',
                severity='warning'
            )
        
        if old_status != updated_instance.status:
            logger.log_security_event(
                'user_status_updated',
                f'User {instance.user.email} status changed from {old_status} to {updated_instance.status} by {changed_by or "system"}',
                severity='info'
            )
        
        return updated_instance


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Handles basic user authentication data.
    """
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_account_locked = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'is_active', 'is_email_verified', 'last_login', 'date_joined',
            'failed_login_attempts', 'is_account_locked', 'profile'
        ]
        read_only_fields = [
            'id', 'last_login', 'date_joined', 'failed_login_attempts',
            'is_account_locked'
        ]
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email with business rules."""
        validate_email_domain(value)
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Handles creation of new user accounts with profiles.
    """
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, validators=[validate_phone_number])
    company_name = serializers.CharField(max_length=255, required=False, allow_blank=True, validators=[validate_company_name])
    role = serializers.ChoiceField(choices=['customer'], default='customer')  # Only allow customer registration
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'full_name', 'phone', 'company_name', 'date_of_birth', 'role'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness and format."""
        validate_email_domain(value)
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_('A user with this email already exists.'))
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and business rules."""
        # Check password confirmation
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': _('Password confirmation does not match.')
            })
        
        # Validate password strength
        try:
            validator = CustomPasswordValidator()
            validator.validate(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        # Sanitize input
        attrs = sanitize_user_input(attrs)
        
        return attrs
    
    def create(self, validated_data):
        """Create user and profile."""
        # Remove password_confirm and profile data
        validated_data.pop('password_confirm')
        profile_data = {
            'full_name': validated_data.pop('full_name'),
            'phone': validated_data.pop('phone', ''),
            'company_name': validated_data.pop('company_name', ''),
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'role': validated_data.pop('role', 'customer'),
        }
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create profile (signals may also create one, but we want to persist extra fields)
        try:
            from apps.users.models import UserProfile
            # If signal already made one, update it, else create
            profile, _ = UserProfile.objects.get_or_create(user=user)
            for k, v in profile_data.items():
                if v is not None and v != '':
                    setattr(profile, k, v)
            if not profile.full_name:
                profile.full_name = f"{user.first_name} {user.last_name}".strip() or user.email
            if not profile.role:
                profile.role = 'customer'
            profile.save()
        except Exception:
            pass
        
        logger.log_user_action(
            user.id,
            'user_registered',
            f'New user registered: {user.email} with role {profile_data["role"]}'
        )
        
        return user


class StaffUserCreationSerializer(UserRegistrationSerializer):
    """
    Serializer for staff user creation (admin only).
    Allows creation of admin, manager, and technician accounts.
    """
    
    role = serializers.ChoiceField(
        choices=['admin', 'manager', 'technician'],
        required=True
    )
    
    def validate(self, attrs):
        """Additional validation for staff creation."""
        attrs = super().validate(attrs)
        
        # Check if current user can create staff
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if not request.user.profile.is_admin:
                raise serializers.ValidationError({
                    'permission': _('Only administrators can create staff accounts.')
                })
        
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change operations.
    """
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('Current password is incorrect.'))
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and strength."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('Password confirmation does not match.')
            })
        
        # Additional strength validation
        user = self.context['request'].user
        try:
            validator = CustomPasswordValidator()
            validator.validate(attrs['new_password'], user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return attrs
    
    def save(self):
        """Change user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        # End all other sessions
        UserSession.objects.end_user_sessions(user, except_session_key=None)
        
        logger.log_security_event(
            'password_changed',
            f'Password changed for user {user.email}',
            severity='info'
        )
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset requests.
    """
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email exists."""
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal whether email exists
            pass
        return value
    
    def save(self):
        """Initiate password reset process."""
        email = self.validated_data['email']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Create reset token (in a real app, you'd send an email here)
            import secrets
            token = secrets.token_urlsafe(32)
            
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                ip_address=self.context.get('ip_address', '0.0.0.0')
            )
            
            logger.log_security_event(
                'password_reset_requested',
                f'Password reset requested for {email}',
                severity='info'
            )
            
            return {'token': token}  # In production, don't return token directly
            
        except User.DoesNotExist:
            logger.log_security_event(
                'password_reset_invalid_email',
                f'Password reset requested for non-existent email: {email}',
                severity='warning'
            )
            return {}


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """
    
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_token(self, value):
        """Validate reset token."""
        try:
            reset_token = PasswordResetToken.objects.get(
                token=value,
                is_used=False
            )
            
            if reset_token.is_expired():
                raise serializers.ValidationError(_('Password reset token has expired.'))
            
            self.context['reset_token'] = reset_token
            return value
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError(_('Invalid password reset token.'))
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('Password confirmation does not match.')
            })
        
        # Validate password strength
        reset_token = self.context['reset_token']
        try:
            validator = CustomPasswordValidator()
            validator.validate(attrs['new_password'], reset_token.user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return attrs
    
    def save(self):
        """Reset user password."""
        reset_token = self.context['reset_token']
        user = reset_token.user
        
        # Set new password
        user.set_password(self.validated_data['new_password'])
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.save()
        
        # Mark token as used
        reset_token.use_token()
        
        # End all user sessions
        UserSession.objects.end_user_sessions(user)
        
        logger.log_security_event(
            'password_reset_completed',
            f'Password reset completed for {user.email}',
            severity='info'
        )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with enhanced security.
    """
    
    def validate(self, attrs):
        """Enhanced authentication validation."""
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(_('Email and password are required.'))
        
        # Check if user exists and is active
        try:
            user = User.objects.get(email=email)
            
            # Check if account is locked
            if user.is_account_locked():
                raise serializers.ValidationError(
                    _('Account is temporarily locked due to failed login attempts. Please try again later.')
                )
            
            # Check if user is active
            if not user.is_active:
                raise serializers.ValidationError(_('User account is disabled.'))
            
            # Check if profile status is active
            if hasattr(user, 'profile') and user.profile.status != 'active':
                raise serializers.ValidationError(_('User account is not active.'))
            
        except User.DoesNotExist:
            # Continue to let parent class handle the authentication
            pass
        
        # Call parent validation
        data = super().validate(attrs)
        
        # Add custom claims
        user = self.user
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.get_full_name(),
            'role': user.profile.role if hasattr(user, 'profile') else 'customer',
            'is_staff': user.is_staff,
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to token."""
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.profile.role if hasattr(user, 'profile') else 'customer'
        token['full_name'] = user.get_full_name()
        
        return token


class UserSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for user session tracking.
    """
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    duration = serializers.CharField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'user_email', 'ip_address', 'user_agent', 'device_info',
            'login_time', 'last_activity', 'logout_time', 'is_active',
            'duration', 'is_expired'
        ]
        read_only_fields = '__all__'


class BulkUserOperationSerializer(serializers.Serializer):
    """
    Serializer for bulk user operations.
    """
    
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    operation = serializers.ChoiceField(
        choices=['activate', 'deactivate', 'delete', 'change_role']
    )
    role = serializers.ChoiceField(
        choices=['admin', 'manager', 'technician', 'customer'],
        required=False
    )
    
    def validate(self, attrs):
        """Validate bulk operation."""
        operation = attrs['operation']
        
        # Role is required for change_role operation
        if operation == 'change_role' and not attrs.get('role'):
            raise serializers.ValidationError({
                'role': _('Role is required for change_role operation.')
            })
        
        # Get users
        user_ids = attrs['user_ids']
        users = User.objects.filter(id__in=user_ids)
        
        if len(users) != len(user_ids):
            raise serializers.ValidationError({
                'user_ids': _('Some user IDs are invalid.')
            })
        
        # Business rule validation
        request = self.context.get('request')
        current_user = request.user if request else None
        
        from apps.users.validators import BusinessRuleValidator
        errors = BusinessRuleValidator.validate_bulk_operation(
            users, operation, current_user
        )
        
        if errors:
            raise serializers.ValidationError({'non_field_errors': errors})
        
        attrs['users'] = users
        return attrs
