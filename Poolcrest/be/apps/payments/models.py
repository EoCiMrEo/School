from django.db import models
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.core.models import BaseModel, MetadataModel
from apps.users.models import UserProfile


class PaymentStatus(models.TextChoices):
    """Payment lifecycle states"""
    INITIATED = 'initiated', _('Initiated')
    PAID = 'paid', _('Paid')
    FAILED = 'failed', _('Failed')
    REFUNDED = 'refunded', _('Refunded')
    CANCELLED = 'cancelled', _('Cancelled')


class PaymentHistory(BaseModel, MetadataModel):
    """Stores payment records for quotes.

    This keeps an auditable trail of Stripe payments linked to a quote and
    customer. It is intentionally simple and provider-agnostic.
    """

    PROVIDER_CHOICES = (
        ('stripe', 'Stripe'),
    )

    quote = models.ForeignKey(
        'quotes.Quote', on_delete=models.CASCADE, related_name='payments'
    )
    customer = models.ForeignKey(
        UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=10, default='usd')
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='stripe')
    payment_intent_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    checkout_session_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        # Preserve the original table name from when this model lived in the quotes app
        db_table = 'quotes_paymenthistory'
        indexes = [
            models.Index(fields=['payment_intent_id']),
            models.Index(fields=['checkout_session_id']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.provider}:{self.payment_intent_id or self.checkout_session_id} ({self.status})"
