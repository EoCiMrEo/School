"""
Admin configuration for user management.
Fixed to properly handle creating users for existing profiles.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django import forms
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import path, reverse
from django.utils.html import format_html
from django.contrib.auth.forms import UserCreationForm
from apps.users.models import User, UserProfile, UserSession, PasswordResetToken
from apps.users.signals import set_profile_to_link, clear_profile_to_link
import logging

logger = logging.getLogger(__name__)


class CreateUserForProfileForm(forms.Form):
    """Form to create a user account for an existing profile."""
    email = forms.EmailField(
        label="Email Address",
        help_text="This will be the login email for the user account"
    )
    first_name = forms.CharField(
        max_length=150,
        required=False,
        help_text="Optional. Will use profile's full name if not provided"
    )
    last_name = forms.CharField(
        max_length=150,
        required=False,
        help_text="Optional. Will use profile's full name if not provided"
    )
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput,
        help_text="Enter a strong password"
    )
    password2 = forms.CharField(
        label="Password Confirmation",
        widget=forms.PasswordInput,
        help_text="Enter the same password again"
    )
    send_welcome_email = forms.BooleanField(
        required=False,
        initial=True,
        help_text="Send welcome email with login details to the user"
    )
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        
        # Check if email already exists
        email = cleaned_data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise forms.ValidationError(f"A user with email {email} already exists")
        
        return cleaned_data


class UserProfileAdminForm(forms.ModelForm):
    """Custom form for UserProfile admin with optional user field."""
    
    user = forms.ModelChoiceField(
        queryset=User.objects.all(),
        required=False,
        empty_label="(No user - Create profile first)",
        help_text="Optional. You can create a profile without a user and link it later."
    )
    
    class Meta:
        model = UserProfile
        fields = '__all__'
    
    def clean(self):
        """Custom validation."""
        cleaned_data = super().clean()
        user = cleaned_data.get('user')
        
        # If a user is selected, check if they already have a profile
        if user and self.instance.pk is None:  # Only check on creation
            existing_profile = UserProfile.objects.filter(user=user).first()
            if existing_profile:
                raise forms.ValidationError({
                    'user': f'This user already has a profile (ID: {existing_profile.id}). Each user can only have one profile.'
                })
        
        return cleaned_data


class CustomUserCreationForm(UserCreationForm):
    """Custom user creation form with option to skip profile creation."""
    skip_profile_creation = forms.BooleanField(
        required=False,
        initial=False,
        label="Skip automatic profile creation",
        help_text="Check this if you want to link to an existing profile instead"
    )
    link_to_profile = forms.ModelChoiceField(
        queryset=UserProfile.objects.filter(user__isnull=True),
        required=False,
        empty_label="-- Select existing profile to link --",
        label="Link to existing profile",
        help_text="Optional: Select an existing profile without a user to link to this new user"
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Check if we should skip profile creation
        if self.cleaned_data.get('skip_profile_creation'):
            user._skip_profile_creation = True
        
        # Check if we should link to existing profile
        profile_to_link = self.cleaned_data.get('link_to_profile')
        if profile_to_link:
            set_profile_to_link(profile_to_link.id)
        
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with profile linking options."""
    
    add_form = CustomUserCreationForm
    
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'has_profile', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    ordering = ('-date_joined',)
    
    def has_profile(self, obj):
        """Check if user has a profile."""
        return hasattr(obj, 'profile') and obj.profile is not None
    has_profile.boolean = True
    has_profile.short_description = 'Has Profile'
    
    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_email_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        }),
        (_('Security'), {
            'fields': ('failed_login_attempts', 'account_locked_until', 'last_login_ip'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
        ('Profile Options', {
            'fields': ('skip_profile_creation', 'link_to_profile'),
            'description': 'Choose whether to create a new profile or link to an existing one.'
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'last_login_ip')
    
    def save_model(self, request, obj, form, change):
        """Save user with profile options."""
        try:
            # Set username if not provided
            if not obj.username:
                obj.username = obj.email
            
            # Save the user
            super().save_model(request, obj, form, change)
            
            # Log success
            action = "updated" if change else "created"
            logger.info(f"User {obj.email} {action} by {request.user}")
            
            # Success message
            messages.success(
                request, 
                f'User "{obj.email}" was {"updated" if change else "created"} successfully.'
            )
                
        except Exception as e:
            logger.error(f"Error saving user {obj.email}: {str(e)}", exc_info=True)
            messages.error(request, f"Error saving user: {str(e)}")
            raise


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Profile admin with ability to create user accounts."""
    
    form = UserProfileAdminForm
    
    list_display = ('get_display_name', 'user_email', 'role', 'status', 'phone', 'company_name', 'user_account_action', 'created_at')
    list_filter = ('role', 'status', 'created_at')
    search_fields = ('full_name', 'user__email', 'phone', 'company_name')
    ordering = ('-created_at',)
    actions = ['create_user_accounts']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'full_name', 'phone', 'role', 'status'),
        }),
        (_('Contact Information'), {
            'fields': ('address', 'company_name', 'preferred_contact_method'),
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone'),
            'classes': ('collapse',)
        }),
        (_('Preferences'), {
            'fields': ('timezone', 'language_preference', 'notification_preferences'),
            'classes': ('collapse',)
        }),
        (_('Internal'), {
            'fields': ('customer_since', 'internal_notes'),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_display_name(self, obj):
        """Display name for the profile."""
        if obj.user:
            return f"{obj.full_name} ({obj.user.email})"
        return f"{obj.full_name} (No user linked)"
    get_display_name.short_description = 'Profile'
    
    def user_email(self, obj):
        """Get user email if exists."""
        return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'
    
    def user_account_action(self, obj):
        """Show action button to create user account if none exists."""
        if obj.user:
            return format_html('<span style="color: green;">✓ Has account</span>')
        else:
            url = reverse('admin:users_userprofile_create_user', args=[obj.pk])
            return format_html(
                '<a class="button" href="{}">Create User Account</a>',
                url
            )
    user_account_action.short_description = 'User Account'
    user_account_action.allow_tags = True
    
    def get_urls(self):
        """Add custom URL for creating user account."""
        urls = super().get_urls()
        custom_urls = [
            path(
                '<uuid:profile_id>/create-user/',
                self.admin_site.admin_view(self.create_user_view),
                name='users_userprofile_create_user',
            ),
        ]
        return custom_urls + urls
    
    def create_user_view(self, request, profile_id):
        """View to create a user account for a profile."""
        from django.db import transaction
        
        profile = UserProfile.objects.get(pk=profile_id)
        
        if profile.user:
            messages.warning(request, f"Profile {profile.full_name} already has a user account.")
            return redirect('admin:users_userprofile_change', profile_id)
        
        if request.method == 'POST':
            form = CreateUserForProfileForm(request.POST)
            if form.is_valid():
                try:
                    with transaction.atomic():
                        # IMPORTANT: Set the profile to link BEFORE creating the user
                        # This tells the signal to link to this profile instead of creating a new one
                        set_profile_to_link(profile.id)
                        
                        # Extract name from profile if not provided
                        first_name = form.cleaned_data.get('first_name')
                        last_name = form.cleaned_data.get('last_name')
                        
                        if not first_name and ' ' in profile.full_name:
                            first_name = profile.full_name.split()[0]
                        elif not first_name:
                            first_name = profile.full_name
                        
                        if not last_name and ' ' in profile.full_name:
                            last_name = profile.full_name.split()[-1]
                        
                        # Create the user - the signal will link it to the profile
                        user = User.objects.create_user(
                            email=form.cleaned_data['email'],
                            password=form.cleaned_data['password1'],
                            first_name=first_name,
                            last_name=last_name or '',
                        )
                        
                        # Verify the profile was linked
                        profile.refresh_from_db()
                        if profile.user != user:
                            # If signal didn't link it, do it manually
                            profile.user = user
                            profile.save()
                        
                        # Clear the profile link flag
                        clear_profile_to_link()
                    
                    messages.success(request, f"User account created successfully for {profile.full_name}")
                    
                    # TODO: Send welcome email if requested
                    if form.cleaned_data.get('send_welcome_email'):
                        # Implement email sending here
                        pass
                    
                    return redirect('admin:users_user_change', user.pk)
                    
                except Exception as e:
                    # Make sure to clear the flag on error
                    clear_profile_to_link()
                    logger.error(f"Error creating user for profile {profile.id}: {str(e)}", exc_info=True)
                    messages.error(request, f"Error creating user account: {str(e)}")
        else:
            # Pre-fill form with profile data
            initial_data = {}
            if ' ' in profile.full_name:
                initial_data['first_name'] = profile.full_name.split()[0]
                initial_data['last_name'] = profile.full_name.split()[-1]
            else:
                initial_data['first_name'] = profile.full_name
            
            form = CreateUserForProfileForm(initial=initial_data)
        
        context = {
            'form': form,
            'profile': profile,
            'opts': self.model._meta,
            'title': f'Create User Account for {profile.full_name}',
        }
        
        # Render a custom template or use Django's default
        from django.template.response import TemplateResponse
        return TemplateResponse(
            request,
            'admin/users/create_user_for_profile.html',
            context
        )
    
    def create_user_accounts(self, request, queryset):
        """Bulk action to create user accounts for selected profiles."""
        profiles_without_users = queryset.filter(user__isnull=True)
        count = profiles_without_users.count()
        
        if count == 0:
            messages.warning(request, "All selected profiles already have user accounts.")
        else:
            messages.info(request, f"Found {count} profiles without user accounts. Please create them individually.")
    
    create_user_accounts.short_description = "Check which profiles need user accounts"
    
    def save_model(self, request, obj, form, change):
        """Save profile."""
        try:
            # Set full name if not provided
            if obj.user and not obj.full_name:
                obj.full_name = obj.user.get_full_name() or obj.user.email
            
            # Save the profile
            super().save_model(request, obj, form, change)
            
            # Log success
            action = "updated" if change else "created"
            logger.info(f"Profile {obj.full_name} {action} by {request.user}")
            
            # Success message
            messages.success(
                request,
                f'Profile "{obj.full_name}" was {"updated" if change else "created"} successfully.'
            )
                
        except Exception as e:
            logger.error(f"Error saving profile {obj.full_name}: {str(e)}", exc_info=True)
            messages.error(request, f"Error saving profile: {str(e)}")
            raise
    
    def get_readonly_fields(self, request, obj=None):
        """Dynamic readonly fields based on permissions."""
        readonly = list(super().get_readonly_fields(request, obj))
        
        # Non-superusers can't change certain fields
        if not request.user.is_superuser:
            readonly.extend(['role', 'status', 'internal_notes'])
        
        # Can't change user once set (to prevent breaking OneToOne)
        if obj and obj.user:
            readonly.append('user')
        
        return readonly


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Admin for user sessions."""
    list_display = ('user', 'ip_address', 'login_time', 'last_activity', 'is_active')
    list_filter = ('is_active', 'login_time', 'last_activity')
    search_fields = ('user__email', 'ip_address', 'session_key')
    readonly_fields = ('session_key', 'user', 'ip_address', 'user_agent', 'device_info', 
                      'login_time', 'last_activity', 'logout_time')
    
    def has_add_permission(self, request):
        return False


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin for password reset tokens."""
    list_display = ('user', 'created_at', 'is_used', 'ip_address')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('user', 'token', 'created_at', 'used_at', 'ip_address')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


# Customize admin site headers
admin.site.site_header = "Poolcrest Administration"
admin.site.site_title = "Poolcrest Admin"
admin.site.index_title = "Welcome to Poolcrest Administration"
