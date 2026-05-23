#!/usr/bin/env python
"""
Minimal manage.py for initial setup that avoids auth_users dependency.
Use this when normal manage.py fails due to missing tables.
Usage: python manage_minimal.py migrate
"""
import os
import sys

if __name__ == '__main__':
    # Temporarily disable the users app to avoid initialization errors
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    # Monkey-patch to disable signals during migration
    os.environ['SKIP_USER_SIGNALS'] = '1'
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # If running migrate command, show helpful message
    if len(sys.argv) > 1 and sys.argv[1] == 'migrate':
        print("🔧 Running minimal migration (signals disabled)")
        print("   This should work even if auth_users table doesn't exist")
    
    execute_from_command_line(sys.argv)
