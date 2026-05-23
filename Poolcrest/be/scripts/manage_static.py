#!/usr/bin/env python
"""
Static files management script for Poolcrest backend.
This script helps diagnose and fix static file issues.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.core.management import call_command
from django.contrib.staticfiles import finders
from django.contrib.staticfiles.storage import staticfiles_storage


def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'=' * 60}")
    print(f" {title}")
    print(f"{'=' * 60}\n")


def check_static_configuration():
    """Check and display static files configuration."""
    print_section("Static Files Configuration")
    
    print(f"DEBUG: {settings.DEBUG}")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")
    
    # Check if directories exist
    print("\nDirectory Status:")
    for static_dir in settings.STATICFILES_DIRS:
        exists = os.path.exists(static_dir)
        print(f"  {static_dir}: {'EXISTS' if exists else 'MISSING'}")
    
    static_root_exists = os.path.exists(settings.STATIC_ROOT)
    print(f"  {settings.STATIC_ROOT}: {'EXISTS' if static_root_exists else 'MISSING'}")


def find_admin_static():
    """Find Django admin static files."""
    print_section("Django Admin Static Files")
    
    # Try to find admin static files
    admin_css = finders.find('admin/css/base.css')
    if admin_css:
        admin_static_root = Path(admin_css).parent.parent
        print(f"Admin static files found at: {admin_static_root}")
        
        # List some admin static files
        print("\nSample admin static files:")
        for item in ['css/base.css', 'css/dashboard.css', 'js/admin/RelatedObjectLookups.js']:
            file_path = admin_static_root / 'admin' / item
            if file_path.exists():
                print(f"  ✓ admin/{item}")
            else:
                print(f"  ✗ admin/{item}")
    else:
        print("⚠️  Django admin static files not found!")
        print("This usually means Django is not properly installed.")


def collect_static_files():
    """Run collectstatic command."""
    print_section("Collecting Static Files")
    
    response = input("Do you want to run 'collectstatic' now? (yes/no): ").lower()
    if response == 'yes':
        try:
            call_command('collectstatic', '--noinput', '--clear')
            print("✓ Static files collected successfully!")
        except Exception as e:
            print(f"✗ Error collecting static files: {e}")
    else:
        print("Skipped collectstatic.")


def test_static_url():
    """Test if static URLs are working."""
    print_section("Testing Static URLs")
    
    print("When DEBUG=True, Django should serve static files automatically.")
    print(f"Try accessing: http://localhost:8000{settings.STATIC_URL}admin/css/base.css")
    print("\nIf this doesn't work, check that:")
    print("1. Your urls.py has static() helper for DEBUG mode")
    print("2. You're running the development server (python manage.py runserver)")
    print("3. django.contrib.staticfiles is in INSTALLED_APPS")


def check_whitenoise():
    """Check WhiteNoise configuration."""
    print_section("WhiteNoise Configuration")
    
    # Check if WhiteNoise is in middleware
    whitenoise_middleware = 'whitenoise.middleware.WhiteNoiseMiddleware'
    if whitenoise_middleware in settings.MIDDLEWARE:
        position = settings.MIDDLEWARE.index(whitenoise_middleware)
        print(f"✓ WhiteNoise middleware found at position {position}")
        
        # Check if it's after SecurityMiddleware
        security_middleware = 'django.middleware.security.SecurityMiddleware'
        security_position = settings.MIDDLEWARE.index(security_middleware)
        
        if position == security_position + 1:
            print("✓ WhiteNoise is correctly placed after SecurityMiddleware")
        else:
            print("⚠️  WhiteNoise should be immediately after SecurityMiddleware")
    else:
        print("✗ WhiteNoise middleware not found in MIDDLEWARE")


def main():
    """Main function to run all checks."""
    print("\n" + "="*60)
    print(" POOLCREST STATIC FILES DIAGNOSTIC TOOL")
    print("="*60)
    
    # Run all checks
    check_static_configuration()
    find_admin_static()
    check_whitenoise()
    test_static_url()
    
    # Ask if user wants to collect static
    collect_static_files()
    
    print_section("Summary")
    print("If admin CSS/JS still don't load:")
    print("1. Make sure DEBUG=True in your .env file")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000/admin/")
    print("4. Check browser console for 404 errors")
    print("\nFor production:")
    print("1. Set DEBUG=False")
    print("2. Run: python manage.py collectstatic")
    print("3. WhiteNoise will serve static files")


if __name__ == '__main__':
    main()
