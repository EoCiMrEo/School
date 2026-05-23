"""
Views for Quotes app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Quote, QuoteItem, QuoteStatus
from apps.payments.models import PaymentHistory, PaymentStatus
from .serializers import (
    QuoteListSerializer,
    QuoteDetailSerializer,
    QuoteCreateSerializer,
    QuoteProcessSerializer,
    QuoteSendSerializer,
    QuoteResponseSerializer,
    ApplyPromotionSerializer,
    QuoteItemSerializer,
    QuoteBulkActionSerializer,
    QuoteStatisticsSerializer
)
from apps.users.permissions import (
    IsOwnerOrStaff,
    IsStaffMember,
    IsAdminOrManager,
    IsAdminOnly,
    IsCustomer
)
from django.conf import settings

try:
    import stripe
except Exception:
    stripe = None


class QuoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quotes.
    Handles quote creation, processing, and customer responses.
    """
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'property_ref', 'status']
    search_fields = ['quote_number', 'title', 'description', 'customer__full_name']
    ordering_fields = ['created_at', 'total_amount', 'valid_until', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get quotes based on user role.
        
        Customers only see their own quotes.
        Any staff-capable user (admin, manager, or staff_member) can see all quotes.
        This ensures drafted quotes are visible to staff, managers, and admins in management screens.
        """
        queryset = Quote.objects.filter(is_deleted=False)
        user = self.request.user

        # Ensure we have a profile object before checking role flags
        profile = getattr(user, 'profile', None)

        if profile is None:
            return Quote.objects.none()

        # Customers see their own quotes; also include guest quotes that match their email
        if getattr(profile, 'is_customer', False):
            email = getattr(getattr(user, 'email', None), 'strip', lambda: None)()
            if email:
                queryset = queryset.filter(
                    Q(customer=profile) | Q(customer__isnull=True, contact_email__iexact=email)
                )
            else:
                queryset = queryset.filter(customer=profile)
        # Staff-capable roles can see all quotes EXCEPT drafts
        elif (
            getattr(profile, 'is_staff_member', False)
            or getattr(profile, 'is_admin', False)
            or getattr(profile, 'is_manager', False)
        ):
            queryset = queryset.exclude(status=QuoteStatus.DRAFT)
        else:
            # Invalid role - no quotes
            queryset = Quote.objects.none()
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter by status group
        status_group = self.request.query_params.get('status_group')
        if status_group == 'pending':
            queryset = queryset.filter(
                status__in=[QuoteStatus.INITIALIZED, QuoteStatus.PROCESSED]
            )
        elif status_group == 'active':
            queryset = queryset.filter(status=QuoteStatus.AWAITING_PAYMENT)
        elif status_group == 'completed':
            queryset = queryset.filter(
                status__in=[QuoteStatus.CONFIRMED, QuoteStatus.PAID, QuoteStatus.REJECTED]
            )
        
        # Prefetch related data
        queryset = queryset.select_related(
            'customer', 'property_ref', 'processed_by', 'promotion'
        ).prefetch_related('items', 'items__service')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return QuoteListSerializer
        elif self.action == 'create':
            # Always use the create serializer for POST /api/quotes/ so incoming
            # fields like `customer_id` and `property_id` are handled correctly.
            return QuoteCreateSerializer
        elif self.action == 'process':
            return QuoteProcessSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return QuoteDetailSerializer
        return QuoteListSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            # Allow guests to request quotes
            permission_classes = [AllowAny]
        elif self.action == 'my_quotes':
            # Customers fetching their quotes
            permission_classes = [IsAuthenticated]
        elif self.action in ['list', 'retrieve']:
            # Customers see their own, staff sees all
            permission_classes = [IsAuthenticated, IsOwnerOrStaff]
        elif self.action in ['update_draft', 'submit', 'delete_draft']:
            # Customers manage their own drafts
            permission_classes = [IsAuthenticated, IsOwnerOrStaff]
        elif self.action in ['process', 'send_to_customer']:
            # Only admin/manager can process and send quotes
            permission_classes = [IsAuthenticated, IsAdminOrManager]
        elif self.action in ['admin_confirm', 'admin_reject', 'admin_complete']:
            permission_classes = [IsAuthenticated, IsAdminOrManager]
        elif self.action in ['confirm', 'reject']:
            # Only the customer can confirm/reject their quotes
            permission_classes = [IsAuthenticated, IsOwnerOrStaff]
        elif self.action in ['create_checkout_session', 'verify_payment']:
            # Customer (owner) can start a checkout session; staff also allowed
            permission_classes = [IsAuthenticated, IsOwnerOrStaff]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only admin can edit/delete
            permission_classes = [IsAuthenticated, IsAdminOnly]
        else:
            permission_classes = [IsAuthenticated, IsStaffMember]
        
        return [permission() for permission in permission_classes]

    @staticmethod
    def _format_note_entry(existing_note, new_text, user):
        """Append a timestamped note entry."""
        text = (new_text or '').strip()
        if not text:
            return existing_note

        timestamp = timezone.localtime().strftime('%Y-%m-%d %H:%M')
        user_label = ''
        if hasattr(user, 'get_full_name'):
            full_name = user.get_full_name()
            if full_name:
                user_label = full_name
        if not user_label and hasattr(user, 'username'):
            user_label = user.username

        prefix = f"[{timestamp}]"
        if user_label:
            prefix = f"{prefix} {user_label}:"

        entry = f"{prefix} {text}" if prefix else text

        if existing_note:
            return f"{existing_note.rstrip()}\n{entry}"
        return entry
    
    def perform_create(self, serializer):
        """Set created_by when creating quote"""
        user = self.request.user if getattr(self.request.user, 'is_authenticated', False) else None
        serializer.save(created_by=user)
    
    def perform_update(self, serializer):
        """Set updated_by when updating quote"""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_quotes(self, request):
        """Get quotes for current customer"""
        if not hasattr(request.user, 'profile'):
            return Response(
                {'error': _('User profile not found')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # if not request.user.profile.is_customer:
        #     return Response(
        #         {'error': _('This endpoint is for customers only')},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        quotes = self.get_queryset().filter(customer=request.user.profile)

        status_param = request.query_params.get('status')
        status_group = request.query_params.get('status_group')

        if status_param:
            normalized_status = status_param.lower()
            grouped_statuses = {
                'pending': [
                    QuoteStatus.INITIALIZED,
                    QuoteStatus.PROCESSED,
                    QuoteStatus.AWAITING_PAYMENT
                ],
                'active': [QuoteStatus.AWAITING_PAYMENT],
                'completed': [QuoteStatus.CONFIRMED, QuoteStatus.PAID, QuoteStatus.REJECTED],
            }

            if normalized_status in grouped_statuses:
                quotes = quotes.filter(status__in=grouped_statuses[normalized_status])
            elif normalized_status in QuoteStatus.values:
                quotes = quotes.filter(status=normalized_status)

        if status_group:
            normalized_group = status_group.lower()
            if normalized_group == 'pending':
                quotes = quotes.filter(
                    status__in=[
                        QuoteStatus.INITIALIZED,
                        QuoteStatus.PROCESSED,
                        QuoteStatus.AWAITING_PAYMENT
                    ]
                )
            elif normalized_group == 'active':
                quotes = quotes.filter(status=QuoteStatus.AWAITING_PAYMENT)
            elif normalized_group == 'completed':
                quotes = quotes.filter(
                    status__in=[QuoteStatus.CONFIRMED, QuoteStatus.PAID, QuoteStatus.REJECTED]
                )

        serializer = QuoteListSerializer(quotes, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending quotes for staff to process"""
        if not hasattr(request.user, 'profile') or not request.user.profile.is_staff_member:
            return Response(
                {'error': _('Staff access required')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quotes = self.get_queryset().filter(
            status__in=[QuoteStatus.INITIALIZED, QuoteStatus.PROCESSED]
        )
        serializer = QuoteListSerializer(quotes, many=True, context={'request': request})
        return Response({
            'count': quotes.count(),
            'quotes': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def process(self, request, pk=None):
        """Process a quote (staff only)"""
        quote = self.get_object()
        
        if quote.status not in [QuoteStatus.INITIALIZED, QuoteStatus.PROCESSED]:
            return Response(
                {'error': _('Quote cannot be processed in current status')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = QuoteProcessSerializer(
            quote,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                QuoteDetailSerializer(quote, context={'request': request}).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def send_to_customer(self, request, pk=None):
        """Send quote to customer for confirmation"""
        quote = self.get_object()
        
        serializer = QuoteSendSerializer(
            data=request.data,
            context={'request': request, 'quote': quote}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Send quote to customer
        quote.send_to_customer()
        
        # TODO: Trigger notification to customer
        # This would integrate with your notification system
        
        return Response({
            'message': _('Quote sent to customer successfully'),
            'quote': QuoteDetailSerializer(quote, context={'request': request}).data
        })

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsAuthenticated, IsOwnerOrStaff]
    )
    def update_draft(self, request, pk=None):
        """Allow customers to update their draft quote before submission."""
        quote = self.get_object()

        # Ownership check: only the quote's customer can modify their draft
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the quote owner can modify this draft')},
                status=status.HTTP_403_FORBIDDEN
            )

        if quote.status != QuoteStatus.DRAFT:
            return Response(
                {'error': _('Only draft quotes can be updated')},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = QuoteCreateSerializer(
            quote,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(
                QuoteDetailSerializer(quote, context={'request': request}).data
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnerOrStaff])
    def submit(self, request, pk=None):
        """Submit a draft quote so staff can begin processing."""
        quote = self.get_object()

        # Ownership check: only the quote's customer can submit their draft
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the quote owner can submit this draft')},
                status=status.HTTP_403_FORBIDDEN
            )

        if quote.status != QuoteStatus.DRAFT:
            return Response(
                {'error': _('Only draft quotes can be submitted')},
                status=status.HTTP_400_BAD_REQUEST
            )

        quote.status = QuoteStatus.INITIALIZED
        quote.updated_by = request.user
        update_fields = ['status', 'updated_by', 'updated_at']

        if not quote.valid_until:
            update_fields.append('valid_until')

        quote.save(update_fields=update_fields)

        return Response({
            'message': _('Quote submitted successfully'),
            'quote': QuoteDetailSerializer(quote, context={'request': request}).data
        })

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwnerOrStaff])
    def delete_draft(self, request, pk=None):
        """Soft delete a draft quote."""
        quote = self.get_object()

        # Ownership check: only the quote's customer can delete their draft
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the quote owner can delete this draft')},
                status=status.HTTP_403_FORBIDDEN
            )

        if quote.status != QuoteStatus.DRAFT:
            return Response(
                {'error': _('Only draft quotes can be deleted')},
                status=status.HTTP_400_BAD_REQUEST
            )

        quote.soft_delete(request.user)

        return Response({'message': _('Quote deleted successfully')})

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsAdminOrManager],
        url_path='admin-confirm'
    )
    def admin_confirm(self, request, pk=None):
        """Allow staff to confirm a quote on behalf of the customer."""
        quote = self.get_object()

        internal_notes = request.data.get('internal_notes', '').strip()
        if not internal_notes:
            return Response(
                {'error': _('Internal notes are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        customer_notes = request.data.get('customer_notes', '').strip()

        quote.status = QuoteStatus.CONFIRMED
        quote.customer_response_at = timezone.now()
        quote.rejection_reason = ''
        quote.updated_by = request.user
        quote.internal_notes = self._format_note_entry(
            quote.internal_notes, internal_notes, request.user
        )
        if customer_notes:
            quote.notes = self._format_note_entry(
                quote.notes, customer_notes, request.user
            )
        quote.save(update_fields=[
            'status',
            'customer_response_at',
            'rejection_reason',
            'internal_notes',
            'notes',
            'updated_by',
            'updated_at'
        ])

        serializer = QuoteListSerializer(quote, context={'request': request})
        return Response({
            'message': _('Quote marked as confirmed'),
            'quote': serializer.data
        })

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsAdminOrManager],
        url_path='admin-reject'
    )
    def admin_reject(self, request, pk=None):
        """Allow staff to reject a quote with an optional reason."""
        quote = self.get_object()
        reason = request.data.get('reason', '').strip()
        internal_notes = request.data.get('internal_notes', '').strip()
        if not internal_notes:
            return Response(
                {'error': _('Internal notes are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not reason:
            return Response(
                {'error': _('Rejection reason is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        customer_notes = request.data.get('customer_notes', '').strip()

        quote.status = QuoteStatus.REJECTED
        quote.customer_response_at = timezone.now()
        quote.rejection_reason = reason
        quote.updated_by = request.user
        quote.internal_notes = self._format_note_entry(
            quote.internal_notes, internal_notes, request.user
        )
        if customer_notes:
            quote.notes = self._format_note_entry(
                quote.notes, customer_notes, request.user
            )
        quote.save(update_fields=[
            'status',
            'customer_response_at',
            'rejection_reason',
            'internal_notes',
            'notes',
            'updated_by',
            'updated_at'
        ])

        serializer = QuoteListSerializer(quote, context={'request': request})
        return Response({
            'message': _('Quote marked as rejected'),
            'quote': serializer.data
        })

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsAdminOrManager],
        url_path='admin-complete'
    )
    def admin_complete(self, request, pk=None):
        """Mark a quote as processed/complete."""
        quote = self.get_object()
        profile = getattr(request.user, 'profile', None)
        internal_notes = request.data.get('internal_notes', '').strip()
        if not internal_notes:
            return Response(
                {'error': _('Internal notes are required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        customer_notes = request.data.get('customer_notes', '').strip()
        quote.status = QuoteStatus.PROCESSED
        quote.processed_at = timezone.now()
        quote.processed_by = profile
        quote.updated_by = request.user
        quote.internal_notes = self._format_note_entry(
            quote.internal_notes, internal_notes, request.user
        )
        if customer_notes:
            quote.notes = self._format_note_entry(
                quote.notes, customer_notes, request.user
            )
        quote.save(update_fields=[
            'status',
            'processed_at',
            'processed_by',
            'internal_notes',
            'notes',
            'updated_by',
            'updated_at'
        ])

        serializer = QuoteListSerializer(quote, context={'request': request})
        return Response({
            'message': _('Quote marked as processed'),
            'quote': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Customer confirms the quote"""
        quote = self.get_object()
        
        # Check if user is the customer
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the customer can confirm this quote')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not quote.can_be_confirmed:
            return Response(
                {'error': _('Quote cannot be confirmed in current state')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quote.confirm()
        
        # Apply promotion usage if applicable
        if quote.promotion:
            quote.promotion.use()
        
        return Response({
            'message': _('Quote confirmed successfully'),
            'quote': QuoteDetailSerializer(quote, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Customer rejects the quote"""
        quote = self.get_object()
        
        # Check if user is the customer
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the customer can reject this quote')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = QuoteResponseSerializer(
            data={'action': 'reject', 'reason': request.data.get('reason', '')},
            context={'request': request, 'quote': quote}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        quote.reject(reason=serializer.validated_data.get('reason', ''))
        
        return Response({
            'message': _('Quote rejected'),
            'quote': QuoteDetailSerializer(quote, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def apply_promotion(self, request, pk=None):
        """Apply a promotion code to the quote"""
        quote = self.get_object()
        
        # Check if user is the customer or staff
        if hasattr(request.user, 'profile'):
            if quote.customer != request.user.profile and not request.user.profile.is_staff_member:
                return Response(
                    {'error': _('Permission denied')},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ApplyPromotionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        success, message = quote.apply_promotion(serializer.validated_data['promotion_code'])
        
        if success:
            return Response({
                'message': message,
                'quote': QuoteDetailSerializer(quote, context={'request': request}).data
            })
        else:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, pk=None):
        """Mark quote as viewed by customer"""
        quote = self.get_object()
        
        # Check if user is the customer
        if not hasattr(request.user, 'profile') or quote.customer != request.user.profile:
            return Response(
                {'error': _('Only the customer can mark this quote as viewed')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quote.mark_as_viewed()
        
        return Response({
            'message': _('Quote marked as viewed'),
            'viewed_at': quote.viewed_at
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def add_item(self, request, pk=None):
        """Add an item to the quote"""
        quote = self.get_object()
        
        serializer = QuoteItemSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                quote=quote,
                created_by=request.user
            )
            # Recalculate quote totals
            quote.calculate_totals()
            quote.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def remove_item(self, request, pk=None):
        """Remove an item from the quote"""
        quote = self.get_object()
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response(
                {'error': _('Item ID is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = quote.items.get(id=item_id)
            item.delete()
            
            # Recalculate quote totals
            quote.calculate_totals()
            quote.save()
            
            return Response({'message': _('Item removed successfully')})
        except QuoteItem.DoesNotExist:
            return Response(
                {'error': _('Item not found')},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def duplicate(self, request, pk=None):
        """Create a duplicate of the quote"""
        original_quote = self.get_object()
        
        # Check permissions
        if hasattr(request.user, 'profile'):
            if not request.user.profile.is_staff_member:
                return Response(
                    {'error': _('Staff access required')},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Create duplicate quote
        new_quote = Quote.objects.create(
            customer=original_quote.customer,
            property_ref=original_quote.property_ref,
            title=f"{original_quote.title} (Copy)",
            description=original_quote.description,
            status=QuoteStatus.INITIALIZED,
            tax_rate=original_quote.tax_rate,
            terms_conditions=original_quote.terms_conditions,
            created_by=request.user
        )
        
        # Duplicate items
        for item in original_quote.items.all():
            QuoteItem.objects.create(
                quote=new_quote,
                service=item.service,
                item_type=item.item_type,
                description=item.description,
                detailed_description=item.detailed_description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                is_optional=item.is_optional,
                is_included=item.is_included,
                sort_order=item.sort_order,
                created_by=request.user
            )
        
        # Recalculate totals
        new_quote.calculate_totals()
        new_quote.save()
        
        return Response(
            QuoteDetailSerializer(new_quote, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def bulk_action(self, request):
        """Perform bulk actions on quotes"""
        serializer = QuoteBulkActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        quote_ids = data['quote_ids']
        action = data['action']
        
        quotes = Quote.objects.filter(id__in=quote_ids, is_deleted=False)
        
        if action == 'send':
            count = 0
            for quote in quotes.filter(status=QuoteStatus.PROCESSED):
                quote.send_to_customer()
                count += 1
            message = f"Sent {count} quotes to customers"
        
        elif action == 'expire':
            count = quotes.filter(
                status__in=[QuoteStatus.INITIALIZED, QuoteStatus.PROCESSED, QuoteStatus.AWAITING_PAYMENT]
            ).update(status=QuoteStatus.EXPIRED)
            message = f"Marked {count} quotes as expired"
        
        elif action == 'cancel':
            count = quotes.exclude(
                status__in=[QuoteStatus.CONFIRMED, QuoteStatus.REJECTED]
            ).update(status=QuoteStatus.CANCELLED)
            message = f"Cancelled {count} quotes"
        
        elif action == 'extend':
            days = data['days_to_extend']
            count = 0
            for quote in quotes:
                if quote.valid_until:
                    quote.valid_until += timedelta(days=days)
                    quote.save(update_fields=['valid_until'])
                    count += 1
            message = f"Extended validity for {count} quotes by {days} days"
        
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def statistics(self, request):
        """Get quote statistics"""
        quotes = self.get_queryset()
        now = timezone.now()
        
        # Calculate statistics
        total_quotes = quotes.count()
        
        # Quotes by status
        quotes_by_status = {}
        for status in QuoteStatus:
            count = quotes.filter(status=status.value).count()
            if count > 0:
                quotes_by_status[status.label] = count
        
        # Conversion rate
        confirmed = quotes.filter(status__in=[QuoteStatus.CONFIRMED, QuoteStatus.PAID]).count()
        sent = quotes.filter(
            status__in=[QuoteStatus.AWAITING_PAYMENT, QuoteStatus.CONFIRMED, QuoteStatus.PAID, QuoteStatus.REJECTED]
        ).count()
        conversion_rate = (confirmed / sent * 100) if sent > 0 else 0
        
        # Average quote value
        avg_value = quotes.filter(
            status__in=[QuoteStatus.AWAITING_PAYMENT, QuoteStatus.CONFIRMED, QuoteStatus.PAID]
        ).aggregate(avg=Avg('total_amount'))['avg'] or 0
        
        # Monthly counts
        this_month = quotes.filter(
            created_at__month=now.month,
            created_at__year=now.year
        ).count()
        
        last_month_date = now.replace(day=1) - timedelta(days=1)
        last_month = quotes.filter(
            created_at__month=last_month_date.month,
            created_at__year=last_month_date.year
        ).count()
        
        # Pending and expired
        pending = quotes.filter(
            status__in=[QuoteStatus.INITIALIZED, QuoteStatus.PROCESSED]
        ).count()
        
        expired = quotes.filter(status=QuoteStatus.EXPIRED).count()
        
        # Revenue potential
        revenue_potential = quotes.filter(
            status=QuoteStatus.AWAITING_PAYMENT
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        stats = {
            'total_quotes': total_quotes,
            'quotes_by_status': quotes_by_status,
            'conversion_rate': round(conversion_rate, 2),
            'average_quote_value': avg_value,
            'quotes_this_month': this_month,
            'quotes_last_month': last_month,
            'pending_quotes': pending,
            'expired_quotes': expired,
            'total_revenue_potential': revenue_potential
        }
        
        return Response(stats)

    # --------------------------
    # Payments (Stripe Checkout)
    # --------------------------
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsOwnerOrStaff],
        url_path='create_checkout_session'
    )
    def create_checkout_session(self, request, pk=None):
        """Create a Stripe Checkout Session for the given quote.

        Returns a URL that the frontend should redirect the customer to.
        """
        if stripe is None or not settings.STRIPE_SECRET_KEY:
            return Response(
                { 'error': _('Payments are not configured') },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        quote = self.get_object()

        # Ensure quote is payable
        if quote.status not in [QuoteStatus.AWAITING_PAYMENT, QuoteStatus.CONFIRMED]:
            return Response(
                { 'error': _('Quote is not payable in its current state') },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Configure Stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY

        amount_cents = int(Decimal(str(quote.total_amount)) * 100)
        currency = 'usd'

        # Include the Checkout Session id in the success URL so the frontend can verify
        # the payment without relying solely on webhooks during local development.
        success_url = f"{settings.FRONTEND_ORIGIN}/quotes/{quote.id}?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.FRONTEND_ORIGIN}/quotes/{quote.id}?payment=cancelled"

        try:
            session = stripe.checkout.Session.create(
                mode='payment',
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'unit_amount': amount_cents,
                        'product_data': {
                            'name': f"Quote {quote.quote_number}",
                            'description': (quote.title or '')[:250]
                        },
                    },
                    'quantity': 1,
                }],
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'quote_id': str(quote.id),
                    'quote_number': quote.quote_number,
                }
            )

            # Persist session metadata on the quote (no migration needed)
            meta = quote.metadata or {}
            meta.setdefault('stripe', {})
            meta['stripe'].update({
                'checkout_session_id': session.get('id'),
                'created_at': timezone.now().isoformat(),
                'amount': amount_cents,
                'currency': currency,
                'paid': False,
            })
            quote.metadata = meta
            quote.save(update_fields=['metadata', 'updated_at'])

            # Create or update a pending payment record
            try:
                PaymentHistory.objects.update_or_create(
                    checkout_session_id=session.get('id'),
                    defaults={
                        'quote': quote,
                        'customer': quote.customer,
                        'amount': Decimal(amount_cents) / 100,
                        'currency': currency,
                        'status': PaymentStatus.INITIATED,
                        'provider': 'stripe',
                        'metadata': meta,
                    }
                )
            except Exception as e:
                logging.getLogger(__name__).exception(
                    "Failed to persist PaymentHistory (initiated) for quote %s: %s",
                    quote.id, e,
                )

            return Response({'url': session.get('url')})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsOwnerOrStaff],
        url_path='verify_payment'
    )
    def verify_payment(self, request, pk=None):
        """Verify a Stripe Checkout Session and mark quote as paid if applicable.

        This is helpful right after returning from Checkout where the frontend
        has access to the session_id, ensuring status updates even if webhooks
        are not configured locally. Idempotent: safe to call multiple times.
        """
        if stripe is None or not settings.STRIPE_SECRET_KEY:
            return Response({'error': _('Payments are not configured')}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        quote = self.get_object()

        session_id = request.data.get('session_id') or request.query_params.get('session_id')
        if not session_id:
            # Fallback to stored metadata
            session_id = (quote.metadata or {}).get('stripe', {}).get('checkout_session_id')
        if not session_id:
            return Response({'error': _('Missing session id')}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Determine paid state from session
        is_paid = False
        paid_time = timezone.now()
        try:
            # For newer API versions
            if getattr(session, 'payment_status', None):
                is_paid = session.payment_status == 'paid'
            else:
                # Fallback heuristics
                is_paid = (getattr(session, 'status', None) == 'complete')
        except Exception:
            is_paid = False

        meta = quote.metadata or {}
        meta.setdefault('stripe', {})
        # Always sync last seen session id
        meta['stripe']['checkout_session_id'] = session_id

        if is_paid:
            meta['stripe'].update({
                'paid': True,
                'paid_at': paid_time.isoformat(),
                'last_event': 'manual.verify',
            })
            if quote.status not in [QuoteStatus.REJECTED, QuoteStatus.CANCELLED, QuoteStatus.PROCESSED]:
                quote.status = QuoteStatus.PAID
            quote.metadata = meta
            quote.save(update_fields=['status', 'metadata', 'updated_at'])

            # Upsert payment record
            try:
                PaymentHistory.objects.update_or_create(
                    checkout_session_id=session_id,
                    defaults={
                        'quote': quote,
                        'customer': quote.customer,
                        'amount': Decimal(str(quote.total_amount or 0)),
                        'currency': meta.get('stripe', {}).get('currency', 'usd'),
                        'status': PaymentStatus.PAID,
                        'provider': 'stripe',
                        'payment_intent_id': getattr(session, 'payment_intent', None) or meta.get('stripe', {}).get('payment_intent'),
                        'paid_at': paid_time,
                        'metadata': meta,
                    }
                )
            except Exception as e:
                logging.getLogger(__name__).exception(
                    "Failed to persist PaymentHistory (paid) for quote %s session %s: %s",
                    quote.id, session_id, e,
                )
        else:
            # Persist last verification attempt for audit
            meta['stripe']['last_event'] = 'manual.verify:not_paid'
            quote.metadata = meta
            quote.save(update_fields=['metadata', 'updated_at'])

        return Response(QuoteDetailSerializer(quote, context={'request': request}).data)


@csrf_exempt
def stripe_webhook(request):
    """Stripe webhook to handle Checkout/Payment events.

    On successful payment, mark the related quote as paid (metadata) and, if
    appropriate, move status to confirmed.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    if stripe is None or not settings.STRIPE_WEBHOOK_SECRET or not settings.STRIPE_SECRET_KEY:
        return HttpResponse(status=503)

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        return HttpResponse(status=400)

    try:
        data = event.get('data', {}).get('object', {})
        event_type = event.get('type')

        # Extract quote id from metadata if present
        metadata = data.get('metadata', {}) or {}
        quote_id = metadata.get('quote_id')

        if not quote_id:
            # Some events nest the metadata under payment_intent/checkout.session
            if event_type == 'checkout.session.completed':
                quote_id = data.get('metadata', {}).get('quote_id')

        if quote_id:
            try:
                quote = Quote.objects.get(id=quote_id)
            except Quote.DoesNotExist:
                quote = None

            if quote is not None:
                meta = quote.metadata or {}
                meta.setdefault('stripe', {})

                # Mark paid on either of the success events
                if event_type in ['checkout.session.completed', 'payment_intent.succeeded']:
                    meta['stripe'].update({
                        'paid': True,
                        'paid_at': timezone.now().isoformat(),
                        'last_event': event_type,
                        'payment_intent': data.get('payment_intent') or data.get('id'),
                        'checkout_session_id': data.get('id') if event_type == 'checkout.session.completed' else meta['stripe'].get('checkout_session_id')
                    })

                    # Mark quote as PAID unless already in a terminal state
                    if quote.status not in [QuoteStatus.REJECTED, QuoteStatus.CANCELLED, QuoteStatus.PROCESSED]:
                        quote.status = QuoteStatus.PAID

                    quote.metadata = meta
                    quote.save(update_fields=['status', 'metadata', 'updated_at'])

                    # Upsert payment history
                    try:
                        amount = Decimal(str(quote.total_amount or 0))
                        PaymentHistory.objects.update_or_create(
                            checkout_session_id=meta['stripe'].get('checkout_session_id'),
                            defaults={
                                'quote': quote,
                                'customer': quote.customer,
                                'amount': amount,
                                'currency': meta['stripe'].get('currency', 'usd'),
                                'status': PaymentStatus.PAID,
                                'provider': 'stripe',
                                'payment_intent_id': meta['stripe'].get('payment_intent') or None,
                                'paid_at': timezone.now(),
                                'metadata': meta,
                            }
                        )
                    except Exception as e:
                        logging.getLogger(__name__).exception(
                            "Failed to persist PaymentHistory from webhook for quote %s: %s",
                            quote.id, e,
                        )
                else:
                    # Record event for audit
                    meta['stripe']['last_event'] = event_type
                    quote.metadata = meta
                    quote.save(update_fields=['metadata', 'updated_at'])
    except Exception:
        # Always return 200 so Stripe won't retry forever if we had a transient issue
        return HttpResponse(status=200)

    return HttpResponse(status=200)


# Promotions and Payments endpoints moved to dedicated apps
