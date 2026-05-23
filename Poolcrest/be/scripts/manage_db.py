#!/usr/bin/env python
"""
Database setup and management script for Poolcrest.
Handles database initialization, user creation, and synchronization.
"""

import os
import sys
import django
import psycopg2
from pathlib import Path

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import connection
from apps.users.models import UserProfile, UserRole

User = get_user_model()


def print_header(title):
    """Print a formatted header."""
    print(f"\n{'=' * 60}")
    print(f" {title}")
    print(f"{'=' * 60}\n")


def check_postgresql_running():
    """Check if PostgreSQL is running locally."""
    try:
        import subprocess
        # Try to check PostgreSQL status
        result = subprocess.run(['pg_isready'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ PostgreSQL is running")
            return True
        else:
            print("❌ PostgreSQL is not running")
            print("\nTo start PostgreSQL:")
            print("  - Windows: Start PostgreSQL service from Services")
            print("  - Mac: brew services start postgresql")
            print("  - Linux: sudo systemctl start postgresql")
            print("\nOr use Docker:")
            print("  docker run --name poolcrest-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres")
            return False
    except FileNotFoundError:
        print("⚠️  PostgreSQL tools not found. PostgreSQL might not be installed.")
        return False


def setup_docker_postgresql():
    """Set up PostgreSQL using Docker."""
    print_header("Docker PostgreSQL Setup")
    
    print("To run PostgreSQL in Docker, execute:")
    print("\ndocker run --name poolcrest-db \\")
    print("  -e POSTGRES_USER=postgres \\")
    print("  -e POSTGRES_PASSWORD=postgres \\")
    print("  -e POSTGRES_DB=poolcrest_db \\")
    print("  -p 5432:5432 \\")
    print("  -d postgres:15\n")
    
    response = input("Have you started Docker PostgreSQL? (yes/no): ")
    return response.lower() == 'yes'


def create_superuser_safe(username, email, password, first_name="", last_name=""):
    """Create a superuser with proper error handling."""
    try:
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            print(f"⚠️  User with email {email} already exists")
            user = User.objects.get(email=email)
            # Update to superuser if not already
            if not user.is_superuser:
                user.is_superuser = True
                user.is_staff = True
                user.save()
                print(f"✅ Updated {email} to superuser")
            return user
        
        # Create new superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Ensure user is properly configured
        user.is_active = True
        user.is_email_verified = True
        user.save()
        
        # Create admin profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': f"{first_name} {last_name}".strip() or email,
                'role': UserRole.ADMIN,
                'status': 'active',
            }
        )
        
        print(f"✅ Created superuser: {email}")
        return user
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        return None


def sync_users_from_sqlite():
    """Sync users from SQLite to current database."""
    print_header("User Synchronization")
    
    current_db = connection.settings_dict['ENGINE']
    print(f"Current database: {current_db}")
    
    if 'sqlite' in current_db:
        print("Currently using SQLite. Switch to PostgreSQL to sync users.")
        return
    
    # Get SQLite database path
    sqlite_path = settings.BASE_DIR / 'db.sqlite3'
    if not sqlite_path.exists():
        print("No SQLite database found to sync from.")
        return
    
    print(f"Found SQLite database at: {sqlite_path}")
    
    try:
        import sqlite3
        
        # Connect to SQLite
        sqlite_conn = sqlite3.connect(sqlite_path)
        cursor = sqlite_conn.cursor()
        
        # Get users from SQLite
        cursor.execute("""
            SELECT id, email, username, first_name, last_name, 
                   is_superuser, is_staff, is_active, password
            FROM auth_users
        """)
        
        users = cursor.fetchall()
        print(f"Found {len(users)} users in SQLite")
        
        # Sync each user
        for user_data in users:
            user_id, email, username, first_name, last_name, is_superuser, is_staff, is_active, password = user_data
            
            try:
                # Check if user exists
                if User.objects.filter(email=email).exists():
                    print(f"  - User {email} already exists, skipping")
                    continue
                
                # Create user (password is already hashed)
                user = User(
                    email=email,
                    username=username or email,
                    first_name=first_name or '',
                    last_name=last_name or '',
                    is_superuser=bool(is_superuser),
                    is_staff=bool(is_staff),
                    is_active=bool(is_active),
                    is_email_verified=True,
                    password=password  # Already hashed
                )
                user.save()
                
                # Create profile
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'full_name': f"{first_name} {last_name}".strip() or email,
                        'role': UserRole.ADMIN if is_superuser else UserRole.CUSTOMER,
                        'status': 'active' if is_active else 'inactive',
                    }
                )
                
                print(f"  ✅ Synced user: {email}")
                
            except Exception as e:
                print(f"  ❌ Error syncing {email}: {e}")
        
        sqlite_conn.close()
        print("\n✅ User synchronization complete")
        
    except Exception as e:
        print(f"❌ Error during synchronization: {e}")


def test_admin_access():
    """Test Django admin access for all admin users."""
    print_header("Admin Access Test")
    
    admin_users = User.objects.filter(is_superuser=True, is_active=True)
    print(f"Found {admin_users.count()} admin users:\n")
    
    for user in admin_users:
        print(f"Email: {user.email}")
        print(f"  - Username: {user.username}")
        print(f"  - Is Active: {user.is_active}")
        print(f"  - Is Staff: {user.is_staff}")
        print(f"  - Is Superuser: {user.is_superuser}")
        print(f"  - Email Verified: {user.is_email_verified}")
        
        # Check profile
        try:
            profile = user.profile
            print(f"  - Profile Role: {profile.role}")
            print(f"  - Profile Status: {profile.status}")
        except:
            print(f"  - Profile: MISSING")
        
        # Check permissions
        if user.is_active and user.is_staff:
            print(f"  ✅ Can access Django admin")
        else:
            print(f"  ❌ Cannot access Django admin")
        print()


def reset_user_password():
    """Reset password for a user."""
    print_header("Reset User Password")
    
    email = input("Enter user email: ")
    
    try:
        user = User.objects.get(email=email)
        new_password = input("Enter new password (or press Enter for 'password123'): ") or 'password123'
        
        user.set_password(new_password)
        user.save()
        
        print(f"✅ Password reset for {email}")
        print(f"   New password: {new_password}")
        
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found")


def main():
    """Main menu for database management."""
    while True:
        print_header("Poolcrest Database Management")
        print("1. Check PostgreSQL status")
        print("2. Setup Docker PostgreSQL")
        print("3. Create superuser")
        print("4. Sync users from SQLite to PostgreSQL")
        print("5. Test admin access")
        print("6. Reset user password")
        print("7. Run migrations")
        print("8. Exit")
        
        choice = input("\nSelect option (1-8): ")
        
        if choice == '1':
            check_postgresql_running()
            
        elif choice == '2':
            setup_docker_postgresql()
            
        elif choice == '3':
            print_header("Create Superuser")
            email = input("Email: ")
            username = input("Username (or press Enter to use email): ") or email
            password = input("Password (or press Enter for 'password123'): ") or 'password123'
            first_name = input("First name: ")
            last_name = input("Last name: ")
            
            create_superuser_safe(username, email, password, first_name, last_name)
            
        elif choice == '4':
            sync_users_from_sqlite()
            
        elif choice == '5':
            test_admin_access()
            
        elif choice == '6':
            reset_user_password()
            
        elif choice == '7':
            print_header("Running Migrations")
            os.system("python manage.py migrate")
            
        elif choice == '8':
            print("\nGoodbye!")
            break
            
        else:
            print("Invalid option. Please try again.")
        
        input("\nPress Enter to continue...")


if __name__ == '__main__':
    main()
