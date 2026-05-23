from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, RegexValidator
from django.utils.translation import gettext_lazy as _

from apps.core.models import BaseModel


class Promotion(BaseModel):
    """
    Promotion codes for discounts on quotes.
    """

    code = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            RegexValidator(
                regex='^[A-Z0-9_-]+$',
                message='Promotion code must contain only uppercase letters, numbers, hyphens, and underscores',
            )
        ],
        help_text=_("Unique promotion code")
    )

    name = models.CharField(
        max_length=255,
        help_text=_("Promotion name")
    )

    description = models.TextField(
        blank=True,
        null=True,
        help_text=_("Promotion description")
    )

    # Discount details
    discount_type = models.CharField(
        max_length=20,
        choices=[
            ('percentage', _('Percentage')),
            ('fixed', _('Fixed Amount')),
        ],
        default='percentage',
        help_text=_("Type of discount")
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_("Discount value (percentage or fixed amount)")
    )

    # Validity period
    valid_from = models.DateTimeField(
        help_text=_("Promotion start date")
    )

    valid_until = models.DateTimeField(
        help_text=_("Promotion end date")
    )

    # Usage limits
    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Maximum number of times this promotion can be used (null = unlimited)")
    )

    usage_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of times this promotion has been used")
    )

    usage_limit_per_customer = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Maximum uses per customer (null = unlimited)")
    )

    # Conditions
    minimum_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text=_("Minimum quote amount required")
    )

    applicable_services = models.ManyToManyField(
        'services.Service',
        blank=True,
        related_name='promotions',
        help_text=_("Services this promotion applies to (empty = all)")
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text=_("Is this promotion currently active?")
    )

    # Customer restrictions
    for_new_customers_only = models.BooleanField(
        default=False,
        help_text=_("Only applicable to new customers?")
    )

    for_existing_customers_only = models.BooleanField(
        default=False,
        help_text=_("Only applicable to existing customers?")
    )

    class Meta:
        verbose_name = _("Promotion")
        verbose_name_plural = _("Promotions")
        db_table = 'promotions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['valid_from', 'valid_until']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def is_valid(self):
        """Check if promotion is currently valid"""
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.usage_limit is None or self.usage_count < self.usage_limit)
        )

    @property
    def remaining_uses(self):
        """Get remaining uses for this promotion"""
        if self.usage_limit is None:
            return None
        return max(0, self.usage_limit - self.usage_count)

    def can_apply_to_quote(self, quote):
        """Check if promotion can be applied to a specific quote"""
        from apps.quotes.models import Quote, QuoteStatus  # local import to avoid cycles

        # Check if promotion is valid
        if not self.is_valid:
            return False

        # Check minimum amount
        if self.minimum_amount and quote.subtotal < self.minimum_amount:
            return False

        # Check customer type restrictions
        customer = quote.customer
        if self.for_new_customers_only:
            # Check if customer has any previous confirmed quotes
            has_previous = Quote.objects.filter(
                customer=customer,
                status=QuoteStatus.CONFIRMED
            ).exclude(id=quote.id).exists()
            if has_previous:
                return False

        if self.for_existing_customers_only:
            # Check if customer has previous confirmed quotes
            has_previous = Quote.objects.filter(
                customer=customer,
                status=QuoteStatus.CONFIRMED
            ).exclude(id=quote.id).exists()
            if not has_previous:
                return False

        # Check usage limit per customer
        if self.usage_limit_per_customer:
            customer_usage = Quote.objects.filter(
                customer=customer,
                promotion=self,
                status=QuoteStatus.CONFIRMED
            ).count()
            if customer_usage >= self.usage_limit_per_customer:
                return False

        # Check applicable services if specified
        if self.applicable_services.exists():
            quote_services = set(item.service_id for item in quote.items.all() if item.service_id)
            applicable_service_ids = set(self.applicable_services.values_list('id', flat=True))
            if not quote_services.intersection(applicable_service_ids):
                return False

        return True

    def use(self):
        """Increment usage count when promotion is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])
