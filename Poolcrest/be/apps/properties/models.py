"""
Property models for managing customer pool properties.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel, AddressModel, NotesModel, MetadataModel
from apps.core.enums import PoolType, PoolSize
from apps.users.models import User, UserProfile
import uuid


class Property(BaseModel, AddressModel, NotesModel, MetadataModel):
    """
    Customer property with pool information.
    Central model for all property-related data.
    """
    
    # Ownership
    customer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='properties',
        help_text=_("Property owner")
    )
    
    # Property identification
    property_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Custom name for the property (e.g., 'Main House', 'Beach House')")
    )
    
    property_code = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text=_("Unique property identifier")
    )
    
    # Pool information
    pool_type = models.CharField(
        max_length=20,
        choices=PoolType.choices,
        default=PoolType.CHLORINE,
        help_text=_("Type of pool")
    )
    
    pool_size = models.CharField(
        max_length=20,
        choices=PoolSize.choices,
        default=PoolSize.MEDIUM,
        help_text=_("Pool size category")
    )
    
    pool_volume_gallons = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(100), MaxValueValidator(500000)],
        help_text=_("Pool volume in gallons")
    )
    
    # Pool specifications
    pool_length_feet = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
        help_text=_("Pool length in feet")
    )
    
    pool_width_feet = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
        help_text=_("Pool width in feet")
    )
    
    pool_depth_shallow_feet = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text=_("Shallow end depth in feet")
    )
    
    pool_depth_deep_feet = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text=_("Deep end depth in feet")
    )
    
    # Pool features (stored as JSON array)
    pool_features = models.JSONField(
        default=list,
        blank=True,
        help_text=_("Pool features like 'Waterfall', 'Hot tub', 'Slide', etc.")
    )
    
    # Equipment information
    equipment_info = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Equipment details (pump, filter, heater, etc.)")
    )
    
    # Access information
    gate_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Gate or access code")
    )
    
    access_instructions = models.TextField(
        blank=True,
        null=True,
        help_text=_("Special access instructions")
    )
    
    key_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Location of keys if needed")
    )
    
    parking_instructions = models.TextField(
        blank=True,
        null=True,
        help_text=_("Parking instructions for technicians")
    )
    
    # Property details
    is_primary = models.BooleanField(
        default=False,
        help_text=_("Is this the customer's primary property?")
    )
    
    is_rental = models.BooleanField(
        default=False,
        help_text=_("Is this a rental property?")
    )
    
    has_pets = models.BooleanField(
        default=False,
        help_text=_("Are there pets on the property?")
    )
    
    pet_notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("Information about pets (type, behavior, etc.)")
    )
    
    # Service preferences
    preferred_service_day = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Preferred day for regular service")
    )
    
    preferred_service_time = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Preferred time window for service")
    )
    
    service_frequency = models.CharField(
        max_length=20,
        choices=[
            ('weekly', _('Weekly')),
            ('biweekly', _('Bi-Weekly')),
            ('monthly', _('Monthly')),
            ('as_needed', _('As Needed')),
        ],
        default='weekly',
        help_text=_("Typical service frequency")
    )
    
    # Chemical preferences
    chemical_preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Preferred chemicals and treatment options")
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text=_("Is this property currently being serviced?")
    )
    
    inactive_reason = models.TextField(
        blank=True,
        null=True,
        help_text=_("Reason for property being inactive")
    )
    
    # Service history summary
    last_service_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Date of last service")
    )
    
    next_service_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Scheduled next service date")
    )
    
    total_services = models.PositiveIntegerField(
        default=0,
        help_text=_("Total number of services performed")
    )
    
    class Meta:
        verbose_name = _("Property")
        verbose_name_plural = _("Properties")
        db_table = 'properties'
        ordering = ['-is_primary', 'property_name', 'created_at']
        indexes = [
            models.Index(fields=['customer', 'is_active']),
            models.Index(fields=['property_code']),
            models.Index(fields=['zip_code']),
            models.Index(fields=['next_service_date']),
        ]
    
    def __str__(self):
        if self.property_name:
            return f"{self.property_name} - {self.customer.full_name}"
        return f"{self.short_address} - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        # Generate property code if not set
        if not self.property_code:
            self.property_code = self.generate_property_code()
        
        # Ensure only one primary property per customer
        if self.is_primary:
            Property.objects.filter(
                customer=self.customer,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    def generate_property_code(self):
        """Generate unique property code"""
        import random
        import string
        
        while True:
            code = 'PROP-' + ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=8)
            )
            if not Property.objects.filter(property_code=code).exists():
                return code
    
    @property
    def display_name(self):
        """Get display name for property"""
        if self.property_name:
            return self.property_name
        return f"{self.address_line1}, {self.city}"
    
    @property
    def requires_service(self):
        """Check if property needs service"""
        from django.utils import timezone
        if not self.next_service_date:
            return True
        return self.next_service_date <= timezone.now()
    
    def add_feature(self, feature):
        """Add a pool feature"""
        if feature not in self.pool_features:
            self.pool_features.append(feature)
            self.save(update_fields=['pool_features'])
    
    def remove_feature(self, feature):
        """Remove a pool feature"""
        if feature in self.pool_features:
            self.pool_features.remove(feature)
            self.save(update_fields=['pool_features'])


class PropertyPhoto(BaseModel):
    """
    Photos of customer properties.
    Used for documentation and reference.
    """
    
    property_ref = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='photos',
        help_text=_("Associated property")
    )
    
    photo = models.ImageField(
        upload_to='properties/photos/%Y/%m/',
        help_text=_("Property photo")
    )
    
    photo_type = models.CharField(
        max_length=50,
        choices=[
            ('pool_overview', _('Pool Overview')),
            ('equipment', _('Equipment')),
            ('access', _('Access Point')),
            ('issue', _('Issue/Problem')),
            ('before', _('Before Service')),
            ('after', _('After Service')),
            ('other', _('Other')),
        ],
        default='pool_overview',
        help_text=_("Type of photo")
    )
    
    caption = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Photo caption or description")
    )
    
    is_primary = models.BooleanField(
        default=False,
        help_text=_("Is this the primary photo for the property?")
    )
    
    taken_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When the photo was taken")
    )
    
    class Meta:
        verbose_name = _("Property Photo")
        verbose_name_plural = _("Property Photos")
        db_table = 'property_photos'
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"Photo for {self.property_ref.display_name} - {self.get_photo_type_display()}"
    
    def save(self, *args, **kwargs):
        # Ensure only one primary photo per property
        if self.is_primary:
            PropertyPhoto.objects.filter(
                property_ref=self.property_ref,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        super().save(*args, **kwargs)


class PropertyNote(BaseModel):
    """
    Internal notes about properties.
    For staff communication and historical records.
    """
    
    property_ref = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='property_notes',
        help_text=_("Associated property")
    )
    
    note_type = models.CharField(
        max_length=50,
        choices=[
            ('general', _('General Note')),
            ('service', _('Service Note')),
            ('access', _('Access Note')),
            ('safety', _('Safety Note')),
            ('billing', _('Billing Note')),
            ('customer', _('Customer Preference')),
            ('warning', _('Warning/Alert')),
        ],
        default='general',
        help_text=_("Type of note")
    )
    
    subject = models.CharField(
        max_length=255,
        help_text=_("Note subject/title")
    )
    
    content = models.TextField(
        help_text=_("Note content")
    )
    
    is_pinned = models.BooleanField(
        default=False,
        help_text=_("Pin this note to top of list")
    )
    
    is_alert = models.BooleanField(
        default=False,
        help_text=_("Show as alert to technicians")
    )
    
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When this note expires (optional)")
    )
    
    class Meta:
        verbose_name = _("Property Note")
        verbose_name_plural = _("Property Notes")
        db_table = 'property_notes'
        ordering = ['-is_pinned', '-is_alert', '-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.property_ref.display_name}"
    
    @property
    def is_expired(self):
        """Check if note has expired"""
        from django.utils import timezone
        if not self.expires_at:
            return False
        return self.expires_at <= timezone.now()


class ServiceArea(BaseModel):
    """
    Service areas/zones for routing and pricing.
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text=_("Area name")
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text=_("Area description")
    )
    
    zip_codes = models.JSONField(
        default=list,
        help_text=_("List of ZIP codes in this area")
    )
    
    # Pricing modifiers
    travel_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Additional travel fee for this area")
    )
    
    price_modifier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=1.00,
        validators=[MinValueValidator(0.5), MaxValueValidator(3.0)],
        help_text=_("Price multiplier for services in this area (1.0 = no change)")
    )
    
    # Service availability
    is_active = models.BooleanField(
        default=True,
        help_text=_("Is this area currently being serviced?")
    )
    
    max_properties = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Maximum properties to service in this area")
    )
    
    current_properties = models.PositiveIntegerField(
        default=0,
        help_text=_("Current number of properties in this area")
    )
    
    # Scheduling preferences
    service_days = models.JSONField(
        default=list,
        help_text=_("Days of week when this area is serviced")
    )
    
    assigned_technicians = models.ManyToManyField(
        UserProfile,
        blank=True,
        related_name='service_areas',
        limit_choices_to={'role': 'technician'},
        help_text=_("Technicians assigned to this area")
    )
    
    class Meta:
        verbose_name = _("Service Area")
        verbose_name_plural = _("Service Areas")
        db_table = 'service_areas'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def is_zip_code_covered(self, zip_code):
        """Check if ZIP code is in this service area"""
        return zip_code in self.zip_codes
    
    def has_capacity(self):
        """Check if area has capacity for more properties"""
        if not self.max_properties:
            return True
        return self.current_properties < self.max_properties
    
    def update_property_count(self):
        """Update the current property count"""
        from django.db.models import Count
        count = Property.objects.filter(
            zip_code__in=self.zip_codes,
            is_active=True
        ).count()
        self.current_properties = count
        self.save(update_fields=['current_properties'])
