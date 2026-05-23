"""
Management command to fix user permissions based on their profiles.
Usage: python manage.py fix_user_permissions
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserProfile, UserRole

User = get_user_model()


class Command(BaseCommand):
    help = 'Fix user permissions based on their profile roles'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Fix permissions for specific user email'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes'
        )
    
    def handle(self, *args, **options):
        email = options.get('email')
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes will be made'))
        
        # Get users to process
        if email:
            users = User.objects.filter(email__iexact=email)
            if not users.exists():
                self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
                return
        else:
            users = User.objects.all()
        
        fixed_count = 0
        
        for user in users:
            changes = []
            
            # Check if user has profile
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                # Create profile for users without one
                if not dry_run:
                    profile = UserProfile.objects.create(
                        user=user,
                        full_name=user.get_full_name(),
                        role=UserRole.ADMIN if user.is_superuser else UserRole.CUSTOMER,
                        status='active' if user.is_active else 'inactive'
                    )
                    self.stdout.write(f'Created profile for {user.email}')
                else:
                    self.stdout.write(f'Would create profile for {user.email}')
                continue
            
            # Determine correct permissions based on role
            should_be_staff = profile.role in [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN]
            should_be_superuser = profile.role == UserRole.ADMIN
            should_be_active = profile.status == 'active'
            
            # Check what needs to be changed
            if user.is_staff != should_be_staff:
                changes.append(f'is_staff: {user.is_staff} → {should_be_staff}')
                if not dry_run:
                    user.is_staff = should_be_staff
                    
            if user.is_superuser != should_be_superuser:
                changes.append(f'is_superuser: {user.is_superuser} → {should_be_superuser}')
                if not dry_run:
                    user.is_superuser = should_be_superuser
                    
            if user.is_active != should_be_active:
                changes.append(f'is_active: {user.is_active} → {should_be_active}')
                if not dry_run:
                    user.is_active = should_be_active
            
            # Save changes
            if changes:
                fixed_count += 1
                if not dry_run:
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Fixed {user.email} ({profile.role}): {", ".join(changes)}')
                    )
                else:
                    self.stdout.write(
                        f'Would fix {user.email} ({profile.role}): {", ".join(changes)}'
                    )
            else:
                if email:  # Only show if specific user requested
                    self.stdout.write(f'✓ {user.email} permissions are correct')
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(f'\nFixed {fixed_count} user(s)') if not dry_run
            else f'\nWould fix {fixed_count} user(s)'
        )
        
        # Show admin users
        if not email:
            admin_count = User.objects.filter(
                is_active=True,
                is_staff=True,
                is_superuser=True
            ).count()
            
            self.stdout.write(f'\nActive admin users: {admin_count}')
