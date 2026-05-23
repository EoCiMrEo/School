"""
Custom permission classes for role-based access control.
"""

from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticated(permissions.IsAuthenticated):
    """
    Allows access only to authenticated users.
    Wrapper for consistency in imports.
    """
    pass


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an 'owner' or 'user' attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user or (
                hasattr(obj.owner, 'user') and obj.owner.user == request.user
            )
        
        return False


class IsOwnerOrAdmin(BasePermission):
    """
    Allows access to owner or admin users.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Admins have full access
        if request.user.profile.is_admin:
            return True
        
        # Check ownership
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            if hasattr(obj.owner, 'user'):
                return obj.owner.user == request.user
            return obj.owner == request.user.profile
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user.profile
        
        # For User model, check if it's the same user
        if obj.__class__.__name__ == 'User':
            return obj == request.user
        
        return False


class IsAdminOnly(BasePermission):
    """
    Allows access only to admin users.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if user is admin
        return request.user.profile.is_admin


class IsAdminOrManager(BasePermission):
    """
    Allows access to admin or manager users.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if user is admin or manager
        return request.user.profile.is_admin or request.user.profile.is_manager


class IsStaffMember(BasePermission):
    """
    Allows access to staff members (admin, manager, technician).
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if user is staff
        return request.user.profile.is_staff_member


class IsTechnicianOrAbove(BasePermission):
    """
    Allows access to technicians, managers, and admins.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check role
        return request.user.profile.role in ['admin', 'manager', 'technician']


class IsCustomer(BasePermission):
    """
    Allows access only to customer users.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if user is customer
        return request.user.profile.is_customer


class CanManageUsers(BasePermission):
    """
    Allows access to users who can manage other users (admin, manager).
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if user can manage users
        return request.user.profile.can_manage_users


class IsOwnerOrStaff(BasePermission):
    """
    Allows access to owner or any staff member.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Staff members have full access
        if request.user.profile.is_staff_member:
            return True
        
        # Check ownership
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            if hasattr(obj.owner, 'user'):
                return obj.owner.user == request.user
            return obj.owner == request.user.profile
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user.profile
        
        return False


class ReadOnlyOrAdmin(BasePermission):
    """
    Allows read-only access to everyone, write access to admins only.
    """
    
    def has_permission(self, request, view):
        # Read permissions for all
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions for admins only
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.is_admin


class HasProfilePermission(BasePermission):
    """
    Ensures user has a profile before allowing access.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        return hasattr(request.user, 'profile') and request.user.profile is not None


class IsProfileOwner(BasePermission):
    """
    Allows access only to the owner of the profile.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For UserProfile objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # For User objects with profile
        if hasattr(obj, 'profile'):
            return obj == request.user
        
        return False


class CanViewInternalNotes(BasePermission):
    """
    Permission to view internal notes (admin and manager only).
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Only admin and manager can view internal notes
        return request.user.profile.role in ['admin', 'manager']


class CanEditUserRole(BasePermission):
    """
    Permission to edit user roles (admin only).
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Only admin can edit roles
        return request.user.profile.is_admin


class IsActiveUser(BasePermission):
    """
    Ensures user account is active.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is active
        if not request.user.is_active:
            return False
        
        # Check if profile exists and is active
        if hasattr(request.user, 'profile'):
            return request.user.profile.status == 'active'
        
        return True


class IsEmailVerified(BasePermission):
    """
    Ensures user has verified their email.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if email is verified
        return request.user.is_email_verified


# Composite permissions
class IsOwnerAdminOrManager(BasePermission):
    """
    Allows access to owner, admin, or manager.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            return False
        
        # Admin and Manager have full access
        if request.user.profile.role in ['admin', 'manager']:
            return True
        
        # Check ownership
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            if hasattr(obj.owner, 'user'):
                return obj.owner.user == request.user
            return obj.owner == request.user.profile
        
        return False

