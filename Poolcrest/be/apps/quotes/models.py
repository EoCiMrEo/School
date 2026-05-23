"""
Quote models for service estimates and pricing.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from apps.core.models import BaseModel, NotesModel, MetadataModel
from apps.users.models import UserProfile
from apps.properties.models import Property
from apps.services.models import Service
import uuid


class QuoteStatus(models.TextChoices):
    """Status choices for quotes"""
    DRAFT = 'draft', _('Draft')  # Customer saving, not yet submitted
    INITIALIZED = 'initialized', _('Initialized')  # Customer created, waiting for staff
    PROCESSED = 'processed', _('Processed')  # Staff is working on it
    AWAITING_PAYMENT = 'awaiting_payment', _('Awaiting Payment')  # Sent to customer for payment
    PAID = 'paid', _('Paid')  # Customer completed payment
    CONFIRMED = 'confirmed', _('Confirmed')  # Customer accepted
    REJECTED = 'rejected', _('Rejected')  # Customer declined
    EXPIRED = 'expired', _('Expired')  # Past validity date
    CANCELLED = 'cancelled', _('Cancelled')  # Cancelled by staff/customer


## Payment models were moved to apps.payments.models


class Quote(BaseModel, NotesModel, MetadataModel):
    """
    Service quotes for customer estimates.
    Main quote model containing header information.
    """
    
    # Identification
    quote_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text=_("Unique quote number")
    )
    
    # Relationships
    customer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='quotes',
        limit_choices_to={'role': 'customer'},
        help_text=_("Customer requesting the quote")
    )

    contact_email = models.EmailField(
        blank=True,
        null=True,
        help_text=_("Contact email when no account is associated")
    )

    contact_first_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("First name provided for guest contact")
    )

    contact_last_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("Last name provided for guest contact")
    )

    contact_phone = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        help_text=_("Phone provided for guest contact")
    )
    
    property_ref = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotes',
        help_text=_("Property for the quote (optional)")
    )
    
    # Quote details
    title = models.CharField(
        max_length=255,
        help_text=_("Quote title/subject")
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text=_("Detailed description of work to be done")
    )
    
    # Status tracking
    status = models.CharField(
        max_length=30,
        choices=QuoteStatus.choices,
        default=QuoteStatus.INITIALIZED,
        help_text=_("Current quote status")
    )
    
    # Staff handling
    processed_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_quotes',
        limit_choices_to={'role__in': ['admin', 'manager']},
        help_text=_("Staff member processing the quote")
    )
    
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When the quote was processed by staff")
    )
    
    # Validity
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text=_("Quote expiration date")
    )
    
    # Customer response
    customer_response_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When customer responded (confirmed/rejected)")
    )
    
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text=_("Reason for rejection if applicable")
    )
    
    # Financial summary (calculated from line items)
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Subtotal before discounts and tax")
    )
    
    # Discount
    promotion_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Applied promotion code")
    )
    
    promotion = models.ForeignKey(
        'promotions.Promotion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotes',
        help_text=_("Applied promotion")
    )
    
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Discount percentage (0-100)")
    )
    
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Fixed discount amount")
    )
    
    # Tax
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        default=Decimal('0.000'),
        help_text=_("Tax rate (e.g., 0.075 for 7.5%)")
    )
    
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Calculated tax amount")
    )
    
    # Total
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total quote amount")
    )
    
    # Terms
    terms_conditions = models.TextField(
        blank=True,
        null=True,
        help_text=_("Terms and conditions")
    )
    
    # Notification tracking
    customer_notified = models.BooleanField(
        default=False,
        help_text=_("Has customer been notified?")
    )
    
    customer_notified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When customer was notified")
    )
    
    # View tracking
    viewed_by_customer = models.BooleanField(
        default=False,
        help_text=_("Has customer viewed the quote?")
    )
    
    viewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When customer first viewed the quote")
    )
    
    class Meta:
        verbose_name = _("Quote")
        verbose_name_plural = _("Quotes")
        db_table = 'quotes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['quote_number']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['valid_until']),
            models.Index(fields=['contact_email']),
        ]
    
    def __str__(self):
        return f"{self.quote_number} - {self.title}"

    @property
    def contact_name(self):
        """Return the best available contact name for this quote."""
        if self.customer and getattr(self.customer, 'full_name', None):
            return self.customer.full_name

        parts = [
            (self.contact_first_name or '').strip(),
            (self.contact_last_name or '').strip(),
        ]
        name = ' '.join(part for part in parts if part)
        return name or (self.contact_email or '')
    
    def save(self, *args, **kwargs):
        # Generate quote number if not set (needs to happen before first save)
        if not self.quote_number:
            self.quote_number = self.generate_quote_number()

        # Set default validity (30 days from creation) — safe to set before save
        if not self.valid_until and self.status == QuoteStatus.INITIALIZED:
            self.valid_until = (timezone.now() + timedelta(days=30)).date()

        # Check if expired based on validity date (status change can be saved later)
        if self.valid_until and self.valid_until < timezone.now().date():
            if self.status not in [QuoteStatus.CONFIRMED, QuoteStatus.REJECTED, QuoteStatus.CANCELLED]:
                self.status = QuoteStatus.EXPIRED

        # First, perform the standard save so the instance has a primary key.
        is_new = not bool(self.pk)
        super().save(*args, **kwargs)

        # Now that the instance has a PK, safely calculate totals from related items
        # Now that the instance has a PK, safely calculate totals from related items
        self.calculate_totals()
        # Persist totals fields only to avoid triggering full save hooks again
        super().save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
    
    def generate_quote_number(self):
        """Generate unique quote number"""
        import random
        from datetime import datetime
        
        date_str = datetime.now().strftime('%Y%m%d')
        while True:
            random_str = ''.join(random.choices('0123456789', k=4))
            quote_number = f"QTE-{date_str}-{random_str}"
            if not Quote.objects.filter(quote_number=quote_number).exists():
                return quote_number
    
    def calculate_totals(self):
        """Calculate quote totals from line items"""
        # Calculate subtotal from line items
        if hasattr(self, 'items'):
            self.subtotal = sum(item.total_price for item in self.items.all())
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = self.subtotal * (self.discount_percentage / 100)
        
        # Calculate after discount
        after_discount = self.subtotal - self.discount_amount
        
        # Calculate tax
        if self.tax_rate > 0:
            self.tax_amount = after_discount * self.tax_rate
        
        # Calculate total
        self.total_amount = after_discount + self.tax_amount
    
    def apply_promotion(self, promotion_code):
        """Apply a promotion code to the quote"""
        try:
            # Import here to avoid circular imports at app load time
            from apps.promotions.models import Promotion
            promotion = Promotion.objects.get(
                code=promotion_code,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
            
            # Check if promotion is applicable
            if promotion.can_apply_to_quote(self):
                self.promotion = promotion
                self.promotion_code = promotion_code
                
                if promotion.discount_type == 'percentage':
                    self.discount_percentage = promotion.discount_value
                else:  # fixed amount
                    self.discount_amount = promotion.discount_value
                
                self.calculate_totals()
                self.save()
                return True, _("Promotion applied successfully")
            else:
                return False, _("Promotion not applicable to this quote")
        except Promotion.DoesNotExist:
            return False, _("Invalid or expired promotion code")
    
    @property
    def is_expired(self):
        """Check if quote has expired"""
        if self.status in [QuoteStatus.CONFIRMED, QuoteStatus.REJECTED, QuoteStatus.CANCELLED]:
            return False
        return self.valid_until and self.valid_until < timezone.now().date()
    
    @property
    def days_until_expiry(self):
        """Get days until quote expires"""
        if not self.valid_until:
            return None
        delta = self.valid_until - timezone.now().date()
        return delta.days
    
    @property
    def can_be_confirmed(self):
        """Check if quote can be confirmed (temporary: confirmation stands in for payment)."""
        return self.status == QuoteStatus.AWAITING_PAYMENT and not self.is_expired
    
    def mark_as_viewed(self):
        """Mark quote as viewed by customer"""
        if not self.viewed_by_customer:
            self.viewed_by_customer = True
            self.viewed_at = timezone.now()
            self.save(update_fields=['viewed_by_customer', 'viewed_at'])
    
    def process(self, staff_user):
        """Mark quote as processed by staff"""
        self.status = QuoteStatus.PROCESSED
        self.processed_by = staff_user.profile if hasattr(staff_user, 'profile') else None
        self.processed_at = timezone.now()
        self.save(update_fields=['status', 'processed_by', 'processed_at'])
    
    def send_to_customer(self):
        """Send quote to customer and mark as awaiting payment."""
        self.status = QuoteStatus.AWAITING_PAYMENT
        self.customer_notified = True
        self.customer_notified_at = timezone.now()
        self.save(update_fields=['status', 'customer_notified', 'customer_notified_at'])
    
    def confirm(self):
        """Customer confirms the quote"""
        self.status = QuoteStatus.CONFIRMED
        self.customer_response_at = timezone.now()
        self.save(update_fields=['status', 'customer_response_at'])
    
    def reject(self, reason=''):
        """Customer rejects the quote"""
        self.status = QuoteStatus.REJECTED
        self.customer_response_at = timezone.now()
        self.rejection_reason = reason
        self.save(update_fields=['status', 'customer_response_at', 'rejection_reason'])


class QuoteItem(BaseModel):
    """
    Line items in a quote.
    Each item represents a service or product in the quote.
    """
    
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_("Parent quote")
    )
    
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quote_items',
        help_text=_("Service being quoted (optional)")
    )
    
    # Item details
    item_type = models.CharField(
        max_length=20,
        choices=[
            ('service', _('Service')),
            ('material', _('Material/Part')),
            ('labor', _('Labor')),
            ('other', _('Other')),
        ],
        default='service',
        help_text=_("Type of item")
    )
    
    description = models.CharField(
        max_length=500,
        help_text=_("Item description")
    )
    
    detailed_description = models.TextField(
        blank=True,
        null=True,
        help_text=_("Detailed description of the item")
    )
    
    # Pricing
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(0.01)],
        help_text=_("Quantity")
    )
    
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_("Price per unit")
    )
    
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total price (quantity × unit_price)")
    )
    
    # Optional fields
    is_optional = models.BooleanField(
        default=False,
        help_text=_("Is this an optional item?")
    )
    
    is_included = models.BooleanField(
        default=True,
        help_text=_("Is this item included in the total?")
    )
    
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Display order in quote")
    )
    
    class Meta:
        verbose_name = _("Quote Item")
        verbose_name_plural = _("Quote Items")
        db_table = 'quote_items'
        ordering = ['sort_order', 'created_at']
    
    def __str__(self):
        return f"{self.description} - {self.quote.quote_number}"
    
    def save(self, *args, **kwargs):
        # Calculate total price
        self.total_price = Decimal(str(self.quantity)) * Decimal(str(self.unit_price))
        
        # If service is selected, use its details if not overridden
        if self.service and not self.description:
            self.description = self.service.name
        if self.service and not self.unit_price:
            self.unit_price = self.service.base_price
        
        super().save(*args, **kwargs)
        
        # Update parent quote totals
        if self.quote:
            self.quote.calculate_totals()
            self.quote.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])


## Promotion model was moved to apps.promotions.models
