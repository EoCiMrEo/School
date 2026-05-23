from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from apps.promotions.models import Promotion
from apps.quotes.models import Quote, QuoteStatus
from .serializers import PromotionSerializer
from apps.users.permissions import IsAdminOrManager


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_deleted=False)
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'discount_type']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['created_at', 'valid_from', 'valid_until']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        validity = self.request.query_params.get('validity')
        now = timezone.now()
        if validity == 'active':
            queryset = queryset.filter(
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now
            )
        elif validity == 'upcoming':
            queryset = queryset.filter(valid_from__gt=now)
        elif validity == 'expired':
            queryset = queryset.filter(valid_until__lt=now)
        return queryset.select_related('created_by', 'updated_by').prefetch_related('applicable_services')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        promotion = self.get_object()
        promotion.is_active = not promotion.is_active
        promotion.save(update_fields=['is_active'])
        return Response({
            'message': f"Promotion {'activated' if promotion.is_active else 'deactivated'}",
            'is_active': promotion.is_active
        })

    @action(detail=True, methods=['get'])
    def usage_report(self, request, pk=None):
        promotion = self.get_object()
        quotes = Quote.objects.filter(promotion=promotion, is_deleted=False)
        report = {
            'promotion': {
                'code': promotion.code,
                'name': promotion.name,
                'discount_type': promotion.discount_type,
                'discount_value': promotion.discount_value
            },
            'usage': {
                'total_uses': promotion.usage_count,
                'usage_limit': promotion.usage_limit,
                'remaining_uses': promotion.remaining_uses
            },
            'quotes': {
                'total': quotes.count(),
                'confirmed': quotes.filter(status=QuoteStatus.CONFIRMED).count(),
                'total_discount_given': quotes.aggregate(
                    total=Sum('discount_amount')
                )['total'] or 0
            },
            'validity': {
                'is_valid': promotion.is_valid,
                'valid_from': promotion.valid_from,
                'valid_until': promotion.valid_until
            }
        }
        return Response(report)

    @action(detail=False, methods=['get'])
    def check_code(self, request):
        code = request.query_params.get('code', '').upper().strip()
        if not code:
            return Response({'error': _("Promotion code is required")}, status=status.HTTP_400_BAD_REQUEST)
        try:
            promotion = Promotion.objects.get(code=code)
            return Response({
                'valid': promotion.is_valid,
                'promotion': PromotionSerializer(promotion).data if promotion.is_valid else None,
                'message': _("Valid promotion code") if promotion.is_valid else _("Promotion code is not currently valid")
            })
        except Promotion.DoesNotExist:
            return Response({
                'valid': False,
                'message': _("Invalid promotion code")
            })
