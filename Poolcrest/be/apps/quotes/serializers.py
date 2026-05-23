"""
Serializers for Quotes app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from .models import Quote, QuoteItem, QuoteStatus
from apps.payments.models import PaymentHistory
from apps.users.serializers import UserProfileSerializer
from apps.properties.serializers import PropertyListSerializer
from apps.services.serializers import ServiceSerializer


class QuoteItemSerializer(serializers.ModelSerializer):
    """Serializer for quote line items"""
    
    service_detail = ServiceSerializer(source='service', read_only=True)
    
    class Meta:
        model = QuoteItem
        fields = [
            'id', 'service', 'service_detail', 'item_type', 'description',
            'detailed_description', 'quantity', 'unit_price', 'total_price',
            'is_optional', 'is_included', 'sort_order', 'created_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError(_("Quantity must be greater than zero"))
        return value
    
    def validate_unit_price(self, value):
        """Ensure price is not negative"""
        if value < 0:
            raise serializers.ValidationError(_("Unit price cannot be negative"))
        return value


class QuoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quote lists"""

    customer_name = serializers.SerializerMethodField()
    property_address = serializers.CharField(source='property_ref.short_address', read_only=True, allow_null=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    contact_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Quote
        fields = [
            'id', 'quote_number', 'title', 'customer', 'customer_name',
            'property_ref', 'property_address', 'status', 'total_amount',
            'valid_until', 'is_expired', 'days_until_expiry', 'items_count',
            'contact_email', 'contact_name', 'created_at'
        ]
        read_only_fields = ['id', 'quote_number', 'created_at']

    def get_customer_name(self, obj):
        if obj.customer:
            return getattr(obj.customer, 'full_name', None)
        if obj.contact_first_name or obj.contact_last_name:
            return obj.contact_name
        return obj.contact_email

    def get_contact_name(self, obj):
        return obj.contact_name


class QuoteDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for quotes with all information"""
    
    customer = UserProfileSerializer(read_only=True)
    property_ref = PropertyListSerializer(read_only=True)
    items = QuoteItemSerializer(many=True, read_only=True)
    processed_by = UserProfileSerializer(read_only=True)
    promotion_detail = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    can_be_confirmed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Quote
        fields = '__all__'
        read_only_fields = [
            'id', 'quote_number', 'subtotal', 'tax_amount', 'total_amount',
            'processed_by', 'processed_at', 'customer_response_at',
            'customer_notified_at', 'viewed_at', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]
    
    def get_promotion_detail(self, obj):
        """Get promotion details if applied"""
        if obj.promotion:
            return {
                'code': obj.promotion.code,
                'name': obj.promotion.name,
                'discount_type': obj.promotion.discount_type,
                'discount_value': str(obj.promotion.discount_value)
            }
        return None


class QuoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating quotes (customer-initiated or guest)"""

    customer_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    property_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    items = QuoteItemSerializer(many=True, write_only=True, required=False)
    requested_services = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        help_text=_("List of service IDs customer is interested in")
    )
    save_as_draft = serializers.BooleanField(write_only=True, required=False, default=False)
    contact_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    contact_first_name = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=100)
    contact_last_name = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=100)
    contact_phone = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=32)
    
    class Meta:
        model = Quote
        fields = [
            'customer_id', 'property_id', 'title', 'description',
            'items', 'requested_services', 'notes', 'save_as_draft',
            'contact_email', 'contact_first_name', 'contact_last_name', 'contact_phone'
        ]
    
    def _get_request_customer(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        profile = getattr(user, 'profile', None)

        if (
            profile and
            getattr(profile, 'role', None) == 'customer' and
            getattr(profile, 'status', None) == 'active'
        ):
            self._customer = profile
            return profile.id

        return None

    def validate_customer_id(self, value):
        """Validate customer exists and is active"""
        from apps.users.models import UserProfile

        if not value:
            customer_id = self._get_request_customer()
            if customer_id:
                return customer_id
            self._customer = None
            return None

        # Accept either a UserProfile id or a User id; try both.
        try:
            customer = UserProfile.objects.get(id=value, role='customer', status='active')
        except UserProfile.DoesNotExist:
            # Fallback: value might be a User id linked via profile.user
            try:
                customer = UserProfile.objects.get(user__id=value, role='customer', status='active')
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError(_("Invalid or inactive customer"))
        
        # Store the customer object for later use in create() to avoid duplicate query
        self._customer = customer
        return value

    def validate(self, attrs):
        """Ensure we have either an authenticated customer or guest contact details."""
        attrs = super().validate(attrs)

        customer_id = attrs.get('customer_id')
        contact_email = (attrs.get('contact_email') or '').strip()

        if not customer_id and not getattr(self, '_customer', None):
            # Try to derive from request context
            customer_id = self._get_request_customer()
            if customer_id:
                attrs['customer_id'] = customer_id

        if not customer_id and not getattr(self, '_customer', None) and not contact_email:
            raise serializers.ValidationError({
                'contact_email': _("Contact email is required when creating a quote without logging in")
            })

        return attrs

    def validate_contact_email(self, value):
        if value:
            normalized = value.strip().lower()
            return normalized
        return value

    def validate_contact_first_name(self, value):
        return value.strip() if value else value

    def validate_contact_last_name(self, value):
        return value.strip() if value else value

    def validate_contact_phone(self, value):
        return value.strip() if value else value
    
    def validate_property_id(self, value):
        """Validate property if provided"""
        if value:
            from apps.properties.models import Property
            try:
                property_ref = Property.objects.get(id=value, is_active=True)
                # Store the property object for later use in create() to avoid duplicate query
                self._property = property_ref
            except Property.DoesNotExist:
                raise serializers.ValidationError(_("Invalid or inactive property"))
        return value
    
    def create(self, validated_data, **kwargs):
        """Create quote with initial status.

        Handles created_by whether it's passed in kwargs (serializer.save(created_by=...))
        or included in validated_data. Also uses cached objects from validation
        (self._customer, self._property) when available to avoid duplicate queries.
        Optionally accepts initial 'items' for advanced clients; otherwise will
        auto-create simple items from 'requested_services'.
        """
        from apps.users.models import UserProfile
        from apps.properties.models import Property
        from apps.services.models import Service

        customer_id = validated_data.pop('customer_id', None)
        property_id = validated_data.pop('property_id', None)
        items_data = validated_data.pop('items', None)
        requested_services = validated_data.pop('requested_services', [])
        save_as_draft = validated_data.pop('save_as_draft', False)
        contact_email = (validated_data.pop('contact_email', None) or '').strip() or None
        contact_first_name = (validated_data.pop('contact_first_name', None) or '').strip() or None
        contact_last_name = (validated_data.pop('contact_last_name', None) or '').strip() or None
        contact_phone = (validated_data.pop('contact_phone', None) or '').strip() or None

        created_by = (
            kwargs.pop('created_by', None)
            or (
                validated_data.pop('created_by', None)
                if 'created_by' in validated_data
                else None
            )
        )

        customer = getattr(self, '_customer', None)
        if customer is None and customer_id:
            try:
                customer = UserProfile.objects.get(id=customer_id, role='customer', status='active')
            except UserProfile.DoesNotExist:
                try:
                    customer = UserProfile.objects.get(user__id=customer_id, role='customer', status='active')
                except UserProfile.DoesNotExist:
                    raise serializers.ValidationError({'customer_id': _('Invalid or inactive customer')})

        if hasattr(self, '_property'):
            property_ref = self._property
        elif property_id:
            try:
                property_ref = Property.objects.get(id=property_id, is_active=True)
            except Property.DoesNotExist:
                raise serializers.ValidationError({'property_id': _('Invalid or inactive property')})
        else:
            property_ref = None

        if not created_by:
            request = self.context.get('request') if self.context else None
            created_by = getattr(request, 'user', None)

        if created_by and not getattr(created_by, 'is_authenticated', False):
            created_by = None

        if customer:
            profile_user = getattr(customer, 'user', None)
            contact_email = contact_email or (profile_user.email if profile_user else None)
            if not contact_first_name and profile_user and profile_user.first_name:
                contact_first_name = profile_user.first_name
            if not contact_last_name and profile_user and profile_user.last_name:
                contact_last_name = profile_user.last_name
            if not contact_first_name and getattr(customer, 'full_name', None):
                contact_first_name = customer.full_name
            if not contact_phone and getattr(customer, 'phone', None):
                contact_phone = customer.phone

        if not customer and not contact_email:
            raise serializers.ValidationError({
                'contact_email': _('Contact email is required when no customer account is linked.')
            })

        initial_status = QuoteStatus.DRAFT if save_as_draft else QuoteStatus.INITIALIZED
        quote = Quote.objects.create(
            customer=customer,
            property_ref=property_ref,
            status=initial_status,
            created_by=created_by,
            contact_email=contact_email,
            contact_first_name=contact_first_name,
            contact_last_name=contact_last_name,
            contact_phone=contact_phone,
            **validated_data,
        )

        if items_data:
            for item in items_data:
                QuoteItem.objects.create(
                    quote=quote,
                    created_by=created_by,
                    **item
                )

        for service_id in requested_services:
            try:
                service = Service.objects.get(id=service_id, status=True)
                QuoteItem.objects.create(
                    quote=quote,
                    service=service,
                    item_type='service',
                    description=service.name,
                    quantity=1,
                    unit_price=service.base_price,
                    created_by=created_by,
                )
            except Service.DoesNotExist:
                pass

        quote.calculate_totals()
        quote.save()

        return quote

    def update(self, instance, validated_data, **kwargs):
        """Update an existing quote (primarily for drafts)."""
        from apps.properties.models import Property
        from apps.services.models import Service

        # Do not allow customer changes; ensure provided ID matches existing
        customer_id = validated_data.pop('customer_id', None)
        if customer_id and str(customer_id) != str(instance.customer_id):
            raise serializers.ValidationError({'customer_id': _('Customer cannot be changed for this quote')})

        # Handle property reassignment (allow clearing by sending null)
        property_id = validated_data.pop('property_id', None)
        if hasattr(self, '_property'):
            property_ref = self._property
        elif property_id is not None:
            if property_id:
                try:
                    property_ref = Property.objects.get(id=property_id, is_active=True)
                except Property.DoesNotExist:
                    raise serializers.ValidationError({'property_id': _('Invalid or inactive property')})
            else:
                property_ref = None
        else:
            property_ref = instance.property_ref

        items_data = validated_data.pop('items', None)
        requested_services = validated_data.pop('requested_services', None)
        validated_data.pop('save_as_draft', None)

        # Update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.property_ref = property_ref

        actor = kwargs.get('updated_by') or kwargs.get('created_by')

        # Rebuild items if caller provided an explicit list or requested services
        if items_data is not None or requested_services is not None:
            instance.items.all().delete()
            
            # Clear prefetch cache to ensure calculate_totals() sees the new items
            if hasattr(instance, '_prefetched_objects_cache'):
                instance._prefetched_objects_cache = {}

            if items_data:
                for item in items_data:
                    QuoteItem.objects.create(
                        quote=instance,
                        created_by=actor,
                        **item
                    )

            if requested_services:
                for service_id in requested_services:
                    try:
                        service = Service.objects.get(id=service_id, status=True)
                        QuoteItem.objects.create(
                            quote=instance,
                            service=service,
                            item_type='service',
                            description=service.name,
                            quantity=1,
                            unit_price=service.base_price,
                            created_by=actor,
                        )
                    except Service.DoesNotExist:
                        continue

        if actor:
            instance.updated_by = actor

        instance.calculate_totals()
        instance.save()

        return instance


class QuoteProcessSerializer(serializers.ModelSerializer):
    """Serializer for staff processing quotes"""
    
    items = QuoteItemSerializer(many=True, required=False)
    
    class Meta:
        model = Quote
        fields = [
            'description', 'items', 'tax_rate', 'discount_percentage',
            'discount_amount', 'terms_conditions', 'valid_until'
        ]
    
    def update(self, instance, validated_data):
        """Process the quote with staff input"""
        items_data = validated_data.pop('items', None)
        
        # Update quote fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle items if provided
        if items_data is not None:
            # Clear existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                QuoteItem.objects.create(
                    quote=instance,
                    created_by=self.context['request'].user,
                    **item_data
                )
        
        # Mark as processed
        instance.process(self.context['request'].user)
        
        # Recalculate totals
        instance.calculate_totals()
        instance.save()
        
        return instance


class QuoteSendSerializer(serializers.Serializer):
    """Serializer for sending quote to customer"""
    
    message = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_("Optional message to include with the quote")
    )
    
    def validate(self, data):
        """Ensure quote is ready to be sent"""
        quote = self.context.get('quote')
        if not quote:
            raise serializers.ValidationError(_("Quote not found in context"))
        
        if quote.status != QuoteStatus.PROCESSED:
            raise serializers.ValidationError(_("Quote must be processed before sending"))
        
        if not quote.items.exists():
            raise serializers.ValidationError(_("Quote must have at least one item"))
        
        return data


class QuoteResponseSerializer(serializers.Serializer):
    """Serializer for customer response to quote"""
    
    action = serializers.ChoiceField(
        choices=['confirm', 'reject'],
        help_text=_("Customer action on the quote")
    )
    
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_("Reason for rejection (if rejecting)")
    )
    
    def validate(self, data):
        """Validate customer response"""
        quote = self.context.get('quote')
        if not quote:
            raise serializers.ValidationError(_("Quote not found in context"))
        
        if not quote.can_be_confirmed:
            raise serializers.ValidationError(_("Quote cannot be confirmed in current state"))
        
        if data['action'] == 'reject' and not data.get('reason'):
            data['reason'] = _("Customer declined without providing a reason")
        
        return data


class ApplyPromotionSerializer(serializers.Serializer):
    """Serializer for applying promotion codes"""
    
    promotion_code = serializers.CharField(
        max_length=50,
        help_text=_("Promotion code to apply")
    )
    
    def validate_promotion_code(self, value):
        """Validate and standardize promotion code"""
        return value.upper().strip()


## Promotion serializers moved to apps.promotions.serializers


class QuoteBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk quote actions"""
    
    quote_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    
    action = serializers.ChoiceField(
        choices=[
            ('send', 'Send to Customers'),
            ('expire', 'Mark as Expired'),
            ('cancel', 'Cancel Quotes'),
            ('extend', 'Extend Validity'),
        ]
    )
    
    days_to_extend = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=90,
        help_text=_("Number of days to extend validity (for 'extend' action)")
    )
    
    def validate(self, data):
        """Validate bulk action data"""
        if data['action'] == 'extend' and not data.get('days_to_extend'):
            raise serializers.ValidationError(
                _("Days to extend is required for extend action")
            )
        return data


class QuoteStatisticsSerializer(serializers.Serializer):
    """Serializer for quote statistics"""
    
    total_quotes = serializers.IntegerField()
    quotes_by_status = serializers.DictField()
    conversion_rate = serializers.FloatField()
    average_quote_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    quotes_this_month = serializers.IntegerField()
    quotes_last_month = serializers.IntegerField()
    pending_quotes = serializers.IntegerField()
    expired_quotes = serializers.IntegerField()
    total_revenue_potential = serializers.DecimalField(max_digits=10, decimal_places=2)


## PaymentHistorySerializer moved to apps.payments.serializers
