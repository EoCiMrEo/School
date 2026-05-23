"""
Management command to fix user profile issues.
Usage: python manage.py fix_user_profiles
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User, UserProfile


class Command(BaseCommand):
    help = 'Fix user profile issues and ensure data consistency'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting user profile fix...'))
        
        # Fix 1: Ensure all users have profiles
        self.ensure_all_users_have_profiles()
        
        # Fix 2: Remove orphaned profiles
        self.remove_orphaned_profiles()
        
        # Fix 3: Update profile full names
        self.update_profile_names()
        
        # Fix 4: Fix admin roles
        self.fix_admin_roles()
        
        self.stdout.write(self.style.SUCCESS('✅ User profile fix completed!'))
    
    def ensure_all_users_have_profiles(self):
        """Ensure every user has a profile."""
        users_without_profiles = User.objects.filter(profile__isnull=True)
        count = 0
        
        for user in users_without_profiles:
            with transaction.atomic():
                profile, created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'full_name': user.get_full_name() or user.email,
                        'role': 'admin' if user.is_superuser else 'customer',
                        'status': 'active' if user.is_active else 'inactive',
                    }
                )
                if created:
                    count += 1
                    self.stdout.write(f"  Created profile for: {user.email}")
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f"✅ Created {count} missing profiles"))
        else:
            self.stdout.write("  All users already have profiles")
    
    def remove_orphaned_profiles(self):
        """Remove profiles without users."""
        orphaned_profiles = UserProfile.objects.filter(user__isnull=True)
        count = orphaned_profiles.count()
        
        if count > 0:
            orphaned_profiles.delete()
            self.stdout.write(self.style.WARNING(f"  Removed {count} orphaned profiles"))
        else:
            self.stdout.write("  No orphaned profiles found")
    
    def update_profile_names(self):
        """Update profile names from user data."""
        profiles = UserProfile.objects.select_related('user')
        updated = 0
        
        for profile in profiles:
            user_full_name = profile.user.get_full_name()
            if user_full_name and profile.full_name != user_full_name:
                profile.full_name = user_full_name
                profile.save(update_fields=['full_name'])
                updated += 1
                self.stdout.write(f"  Updated name for: {profile.user.email}")
        
        if updated > 0:
            self.stdout.write(self.style.SUCCESS(f"✅ Updated {updated} profile names"))
        else:
            self.stdout.write("  All profile names are up to date")
    
    def fix_admin_roles(self):
        """Ensure superusers have admin role."""
        superusers = User.objects.filter(is_superuser=True)
        updated = 0
        
        for user in superusers:
            if hasattr(user, 'profile') and user.profile.role != 'admin':
                user.profile.role = 'admin'
                user.profile.save(update_fields=['role'])
                updated += 1
                self.stdout.write(f"  Fixed admin role for: {user.email}")
        
        # Also check staff users
        staff_users = User.objects.filter(is_staff=True, is_superuser=False)
        for user in staff_users:
            if hasattr(user, 'profile') and user.profile.role == 'customer':
                user.profile.role = 'technician'  # Default staff to technician
                user.profile.save(update_fields=['role'])
                updated += 1
                self.stdout.write(f"  Fixed staff role for: {user.email}")
        
        if updated > 0:
            self.stdout.write(self.style.SUCCESS(f"✅ Fixed {updated} user roles"))
        else:
            self.stdout.write("  All user roles are correct")
