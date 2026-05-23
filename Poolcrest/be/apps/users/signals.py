"""
Signal handlers for user management.
Fixed to properly handle linking existing profiles without creating duplicates.
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from apps.users.models import User, UserProfile
import logging
import os
import threading

logger = logging.getLogger(__name__)

# Thread-local storage for profile linking
_thread_locals = threading.local()

def set_profile_to_link(profile_id):
    """Set a profile ID to link to the next created user."""
    _thread_locals.profile_to_link = profile_id
    logger.debug(f"Set profile to link: {profile_id}")

def get_profile_to_link():
    """Get the profile ID to link, if any."""
    profile_id = getattr(_thread_locals, 'profile_to_link', None)
    logger.debug(f"Getting profile to link: {profile_id}")
    return profile_id

def clear_profile_to_link():
    """Clear the profile ID after use."""
    if hasattr(_thread_locals, 'profile_to_link'):
        logger.debug(f"Clearing profile to link: {_thread_locals.profile_to_link}")
        del _thread_locals.profile_to_link


@receiver(post_save, sender=User, dispatch_uid='create_user_profile')
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create or link user profile when user is saved.
    Fixed to prevent duplicate profiles when linking existing ones.
    """
    
    # Skip if running migrations or if signal should be skipped
    if os.environ.get('SKIP_USER_SIGNALS') == '1':
        return
    
    # Skip during migrations
    import sys
    if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
        return
    
    if not created:
        # User was updated - update their profile if needed
        try:
            if hasattr(instance, 'profile') and instance.profile:
                profile = instance.profile
                
                # Update full name if user's name changed
                current_full_name = instance.get_full_name()
                if current_full_name and profile.full_name != current_full_name:
                    profile.full_name = current_full_name
                    profile.save(update_fields=['full_name'])
                    logger.info(f"Profile name updated for user: {instance.email}")
        except Exception as e:
            logger.error(f"Error updating profile for {instance.email}: {str(e)}")
        return
    
    # User was created - handle profile creation/linking
    try:
        with transaction.atomic():
            # FIRST: Check if we should link to an existing profile
            profile_to_link_id = get_profile_to_link()
            
            if profile_to_link_id:
                logger.info(f"Attempting to link profile {profile_to_link_id} to user {instance.email}")
                try:
                    # Get the profile that doesn't have a user yet
                    profile = UserProfile.objects.select_for_update().get(
                        id=profile_to_link_id, 
                        user__isnull=True
                    )
                    
                    # Link it to the new user
                    profile.user = instance
                    profile.save()
                    
                    logger.info(f"Successfully linked existing profile {profile.full_name} to user {instance.email}")
                    clear_profile_to_link()  # Clear after successful link
                    return  # Important: return here to avoid creating a new profile
                    
                except UserProfile.DoesNotExist:
                    logger.warning(f"Profile {profile_to_link_id} not found or already has a user")
                    clear_profile_to_link()
                    # Continue to normal profile creation
                except Exception as e:
                    logger.error(f"Error linking profile {profile_to_link_id}: {str(e)}")
                    clear_profile_to_link()
                    # Continue to normal profile creation
            
            # SECOND: Check if user already has a profile (shouldn't happen but be safe)
            if hasattr(instance, 'profile') and instance.profile:
                logger.info(f"User {instance.email} already has a profile")
                return
            
            # THIRD: Check if user creation was flagged to skip profile creation
            if getattr(instance, '_skip_profile_creation', False):
                logger.info(f"Skipping profile creation for user {instance.email} (flagged)")
                return
            
            # FINALLY: Normal behavior - create a new profile
            # Use get_or_create to avoid duplicates
            profile, profile_created = UserProfile.objects.get_or_create(
                user=instance,
                defaults={
                    'full_name': instance.get_full_name() or instance.email,
                    'role': 'admin' if instance.is_superuser else 'customer',
                    'status': 'active' if instance.is_active else 'inactive',
                }
            )
            
            if profile_created:
                logger.info(f"Profile automatically created for user: {instance.email}")
            else:
                logger.info(f"Profile already exists for user: {instance.email}")
                
    except Exception as e:
        logger.error(f"Error in user profile signal for {instance.email}: {str(e)}")
        # Clear the profile link flag on any error
        clear_profile_to_link()


@receiver(pre_save, sender=User, dispatch_uid='user_pre_save')
def user_pre_save_handler(sender, instance, **kwargs):
    """Handle user pre-save logic."""
    # Ensure username is set (use email if not provided)
    if not instance.username:
        instance.username = instance.email
    
    # Log if this is a new user or update
    if instance.pk:
        try:
            old_user = User.objects.get(pk=instance.pk)
            
            # Check if email changed
            if old_user.email != instance.email:
                logger.info(f"Email change detected: {old_user.email} -> {instance.email}")
                
                # Update username if it was the old email
                if instance.username == old_user.email:
                    instance.username = instance.email
                    
        except User.DoesNotExist:
            pass


@receiver(pre_save, sender=UserProfile, dispatch_uid='profile_pre_save')
def profile_pre_save_handler(sender, instance, **kwargs):
    """Handle profile pre-save logic."""
    # If no user is linked but full_name is empty, set a default
    if not instance.user and not instance.full_name:
        instance.full_name = "Unlinked Profile"
    
    # Ensure role is set
    if not instance.role:
        instance.role = 'customer'
    
    # Ensure status is set
    if not instance.status:
        instance.status = 'active'
