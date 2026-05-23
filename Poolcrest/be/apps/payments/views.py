from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from decimal import Decimal

from apps.payments.models import PaymentHistory
from .serializers import PaymentHistorySerializer
from apps.quotes.models import Quote, QuoteStatus


class PaymentHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentHistory.objects.all()
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'provider', 'customer', 'quote']
    search_fields = ['payment_intent_id', 'checkout_session_id', 'quote__quote_number']
    ordering_fields = ['created_at', 'paid_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = PaymentHistory.objects.select_related('quote', 'customer')
        user = self.request.user
        profile = getattr(user, 'profile', None)
        if not profile:
            return PaymentHistory.objects.none()
        if getattr(profile, 'is_customer', False):
            qs = qs.filter(customer=profile)
        return qs

    def _backfill_from_quotes(self, profile):
        """Create missing PaymentHistory rows from paid quotes metadata.

        This helps local/dev where webhooks aren't configured and historical
        payments predate the payments app split.
        """
        try:
            paid_quotes = Quote.objects.filter(
                customer=profile,
                status=QuoteStatus.PAID,
                is_deleted=False,
            )
            created = 0
            for quote in paid_quotes:
                meta = quote.metadata or {}
                stripe_meta = meta.get('stripe', {}) or {}
                # Use checkout_session_id as a stable key if available
                session_id = stripe_meta.get('checkout_session_id')
                defaults = {
                    'quote': quote,
                    'customer': profile,
                    'amount': Decimal(str(quote.total_amount or 0)),
                    'currency': stripe_meta.get('currency', 'usd'),
                    'status': 'paid',
                    'provider': 'stripe',
                    'payment_intent_id': stripe_meta.get('payment_intent'),
                    'paid_at': timezone.now(),
                    'metadata': meta,
                }
                if session_id:
                    obj, _created = PaymentHistory.objects.get_or_create(
                        checkout_session_id=session_id,
                        defaults=defaults,
                    )
                else:
                    # Fall back to a per-quote record
                    obj, _created = PaymentHistory.objects.get_or_create(
                        quote=quote,
                        defaults=defaults,
                    )
                if _created:
                    created += 1
            return created
        except Exception:
            return 0

    @action(detail=False, methods=['get'])
    def my(self, request):
        qs = self.get_queryset()
        profile = getattr(request.user, 'profile', None)
        if profile and not qs.exists() and getattr(profile, 'is_customer', False):
            # Opportunistic backfill for the current customer
            self._backfill_from_quotes(profile)
            qs = self.get_queryset()

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
