"""
Base models for Poolcrest backend.
Abstract models that provide common fields and functionality.
"""

import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class BaseModel(models.Model):
    """
    Abstract base model with common fields for all models.
    Provides UUID primary key, timestamps, and soft delete functionality.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for this record")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Timestamp when this record was created")
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Timestamp when this record was last updated")
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        help_text=_("User who created this record")
    )
    
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
        help_text=_("User who last updated this record")
    )
    
    is_deleted = models.BooleanField(
        default=False,
        help_text=_("Soft delete flag")
    )
    
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Timestamp when this record was soft deleted")
    )
    
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_deleted',
        help_text=_("User who deleted this record")
    )
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['is_deleted']),
        ]
    
    def soft_delete(self, user=None):
        """Soft delete this record"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
    
    def restore(self):
        """Restore a soft deleted record"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
    
    def hard_delete(self):
        """Permanently delete this record"""
        super().delete()
    
    @property
    def age(self):
        """Get the age of this record"""
        return timezone.now() - self.created_at


class AddressModel(models.Model):
    """
    Abstract model for address fields.
    Can be inherited by any model that needs address information.
    """
    
    address_line1 = models.CharField(
        max_length=255,
        help_text=_("Street address, P.O. box, company name")
    )
    
    address_line2 = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Apartment, suite, unit, building, floor, etc.")
    )
    
    city = models.CharField(
        max_length=100,
        help_text=_("City name")
    )
    
    state = models.CharField(
        max_length=50,
        help_text=_("State or province")
    )
    
    zip_code = models.CharField(
        max_length=20,
        help_text=_("ZIP or postal code")
    )
    
    country = models.CharField(
        max_length=2,
        default='US',
        help_text=_("Two-letter country code (ISO 3166-1 alpha-2)")
    )
    
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text=_("Latitude coordinate for mapping")
    )
    
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text=_("Longitude coordinate for mapping")
    )
    
    class Meta:
        abstract = True
    
    @property
    def full_address(self):
        """Get formatted full address"""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.state} {self.zip_code}")
        if self.country != 'US':
            parts.append(self.country)
        return ', '.join(parts)
    
    @property
    def short_address(self):
        """Get short formatted address"""
        return f"{self.city}, {self.state}"


class ContactInfoModel(models.Model):
    """
    Abstract model for contact information.
    Can be inherited by any model that needs contact fields.
    """
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Primary phone number")
    )
    
    phone_secondary = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Secondary phone number")
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        help_text=_("Primary email address")
    )
    
    email_secondary = models.EmailField(
        blank=True,
        null=True,
        help_text=_("Secondary email address")
    )
    
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ('phone', _('Phone')),
            ('email', _('Email')),
            ('sms', _('SMS/Text')),
            ('app', _('Mobile App')),
        ],
        default='email',
        help_text=_("Preferred method of contact")
    )
    
    best_time_to_contact = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Best time to contact (e.g., 'Mornings', '9-5 weekdays')")
    )
    
    class Meta:
        abstract = True


class PriceModel(models.Model):
    """
    Abstract model for pricing fields.
    Can be inherited by any model that deals with money.
    """
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_("Price amount")
    )
    
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text=_("Three-letter currency code (ISO 4217)")
    )
    
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        default=0.000,
        help_text=_("Tax rate as decimal (e.g., 0.075 for 7.5%)")
    )
    
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Discount amount")
    )
    
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text=_("Discount percentage")
    )
    
    class Meta:
        abstract = True
    
    @property
    def subtotal(self):
        """Calculate subtotal after discounts"""
        if self.discount_percentage:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price - self.discount_amount
    
    @property
    def tax_amount(self):
        """Calculate tax amount"""
        return self.subtotal * self.tax_rate
    
    @property
    def total(self):
        """Calculate total including tax"""
        return self.subtotal + self.tax_amount


class NotesModel(models.Model):
    """
    Abstract model for notes fields.
    Provides public and internal notes functionality.
    """
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("General notes visible to customer")
    )
    
    internal_notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("Internal notes for staff only")
    )
    
    class Meta:
        abstract = True


class MetadataModel(models.Model):
    """
    Abstract model for storing arbitrary metadata as JSON.
    """
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Additional metadata as JSON")
    )
    
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text=_("Tags for categorization")
    )
    
    class Meta:
        abstract = True
    
    def add_tag(self, tag):
        """Add a tag to the tags list"""
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags'])
    
    def remove_tag(self, tag):
        """Remove a tag from the tags list"""
        if tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags'])
    
    def has_tag(self, tag):
        """Check if a tag exists"""
        return tag in self.tags


class ActiveManager(models.Manager):
    """
    Custom manager that excludes soft-deleted records by default.
    """
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def deleted(self):
        """Get only soft-deleted records"""
        return super().get_queryset().filter(is_deleted=True)
    
    def with_deleted(self):
        """Get all records including soft-deleted ones"""
        return super().get_queryset()


class TimestampedModel(models.Model):
    """
    Simple abstract model with just timestamps.
    For models that don't need full BaseModel functionality.
    """
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class OrderedModel(models.Model):
    """
    Abstract model for models that need ordering/sorting.
    """
    
    order = models.PositiveIntegerField(
        default=0,
        help_text=_("Display order (lower numbers appear first)")
    )
    
    class Meta:
        abstract = True
        ordering = ['order', '-created_at']
    
    def move_to(self, new_order):
        """Move this item to a new position in the order"""
        old_order = self.order
        if new_order == old_order:
            return
        
        # Get all items in the same context (override in subclass if needed)
        qs = self.__class__.objects.all()
        
        if new_order < old_order:
            # Moving up
            qs.filter(order__gte=new_order, order__lt=old_order).update(
                order=models.F('order') + 1
            )
        else:
            # Moving down
            qs.filter(order__gt=old_order, order__lte=new_order).update(
                order=models.F('order') - 1
            )
        
        self.order = new_order
        self.save(update_fields=['order'])
