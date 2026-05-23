"""
Serializers for Property app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Property, PropertyPhoto, PropertyNote, ServiceArea
from apps.users.serializers import UserProfileSerializer


class PropertyPhotoSerializer(serializers.ModelSerializer):
    """Serializer for property photos"""
    
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyPhoto
        fields = [
            'id', 'photo', 'photo_url', 'photo_type', 'caption',
            'is_primary', 'taken_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'photo_url']
    
    def get_photo_url(self, obj):
        """Get full URL for photo"""
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
        return None


class PropertyNoteSerializer(serializers.ModelSerializer):
    """Serializer for property notes"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PropertyNote
        fields = [
            'id', 'note_type', 'subject', 'content', 'is_pinned',
            'is_alert', 'expires_at', 'is_expired', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property lists"""
    
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    display_name = serializers.CharField(read_only=True)
    short_address = serializers.CharField(read_only=True)
    requires_service = serializers.BooleanField(read_only=True)
    primary_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'property_code', 'property_name', 'display_name',
            'customer', 'customer_name', 'short_address', 'full_address',
            'pool_type', 'pool_size', 'is_primary', 'is_active',
            'requires_service', 'next_service_date', 'primary_photo'
        ]
        read_only_fields = ['id', 'property_code', 'display_name', 'short_address', 'full_address']
    
    def get_primary_photo(self, obj):
        """Get primary photo URL"""
        photo = obj.photos.filter(is_primary=True).first()
        if photo and photo.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(photo.photo.url)
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for property with all information"""
    
    customer = UserProfileSerializer(read_only=True)
    customer_id = serializers.UUIDField(write_only=True)
    photos = PropertyPhotoSerializer(many=True, read_only=True)
    recent_notes = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    full_address = serializers.CharField(read_only=True)
    requires_service = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'property_code', 'created_at', 'updated_at',
                           'created_by', 'updated_by', 'total_services']
    
    def get_recent_notes(self, obj):
        """Get recent notes for the property"""
        notes = obj.property_notes.filter(is_deleted=False)[:5]
        return PropertyNoteSerializer(notes, many=True).data
    
    def validate_customer_id(self, value):
        """Validate customer exists"""
        from apps.users.models import UserProfile
        try:
            UserProfile.objects.get(id=value, role='customer')
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError(_("Customer not found"))
        return value
    
    def create(self, validated_data):
        """Create property with customer relationship"""
        from apps.users.models import UserProfile
        customer_id = validated_data.pop('customer_id')
        customer = UserProfile.objects.get(id=customer_id)
        validated_data['customer'] = customer
        return super().create(validated_data)


class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating properties"""
    
    customer_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Property
        fields = [
            # ownership/basic
            'customer_id', 'property_name', 'is_primary', 'is_active',
            # address
            'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country',
            # pool info
            'pool_type', 'pool_size', 'pool_volume_gallons', 'pool_length_feet',
            'pool_width_feet', 'pool_depth_shallow_feet', 'pool_depth_deep_feet',
            'pool_features', 'equipment_info', 'chemical_preferences',
            # access
            'gate_code', 'access_instructions', 'key_location', 'parking_instructions',
            # service prefs
            'preferred_service_day', 'preferred_service_time', 'service_frequency',
            # notes
            'notes', 'internal_notes'
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
        """Validate customer exists"""
        from apps.users.models import UserProfile

        if not value:
            customer_id = self._get_request_customer()
            if customer_id:
                return customer_id
            raise serializers.ValidationError(_("Customer not found"))

        try:
            customer = UserProfile.objects.get(id=value, role='customer')
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError(_("Customer not found"))

        self._customer = customer
        return value
    
    def validate(self, data):
        """Additional validation"""
        # Check if customer has reached property limit
        from apps.users.models import UserProfile
        from apps.core.enums import BusinessConstants

        customer = getattr(self, '_customer', None)
        customer_id = data.get('customer_id')

        if not customer and not customer_id:
            customer_id = self._get_request_customer()
            if not customer_id:
                raise serializers.ValidationError({'customer_id': _("Customer not found")})
            data['customer_id'] = customer_id
            customer = self._customer

        if not customer:
            try:
                customer = UserProfile.objects.get(id=customer_id, role='customer')
                self._customer = customer
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({'customer_id': _("Customer not found")})
        property_count = Property.objects.filter(
            customer=customer,
            is_deleted=False
        ).count()
        
        if property_count >= BusinessConstants.MAX_PROPERTIES_PER_CUSTOMER:
            raise serializers.ValidationError(
                _(f"Customer has reached maximum property limit of {BusinessConstants.MAX_PROPERTIES_PER_CUSTOMER}")
            )
        
        return data
    
    def create(self, validated_data):
        """Create property"""
        from apps.users.models import UserProfile

        customer_id = validated_data.pop('customer_id', None)
        customer = getattr(self, '_customer', None)

        if not customer:
            if not customer_id:
                customer_id = self._get_request_customer()
            if not customer_id:
                raise serializers.ValidationError({'customer_id': _("Customer not found")})
            try:
                customer = UserProfile.objects.get(id=customer_id, role='customer')
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({'customer_id': _("Customer not found")})
            self._customer = customer

        validated_data['customer'] = customer
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ServiceAreaSerializer(serializers.ModelSerializer):
    """Serializer for service areas"""
    
    property_count = serializers.IntegerField(source='current_properties', read_only=True)
    has_capacity = serializers.BooleanField(read_only=True)
    assigned_technicians_detail = UserProfileSerializer(
        source='assigned_technicians',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = ServiceArea
        fields = [
            'id', 'name', 'description', 'zip_codes', 'travel_fee',
            'price_modifier', 'is_active', 'max_properties',
            'current_properties', 'property_count', 'has_capacity',
            'service_days', 'assigned_technicians', 'assigned_technicians_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_properties', 'created_at', 'updated_at']
    
    def validate_zip_codes(self, value):
        """Validate ZIP codes"""
        from apps.core.utils import validate_zip_code
        
        for zip_code in value:
            try:
                validate_zip_code(zip_code)
            except Exception as e:
                raise serializers.ValidationError(f"Invalid ZIP code {zip_code}: {str(e)}")
        
        return value
    
    def validate_service_days(self, value):
        """Validate service days"""
        valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        for day in value:
            if day not in valid_days:
                raise serializers.ValidationError(f"Invalid day: {day}")
        return value


class PropertyBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk property actions"""
    
    property_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    action = serializers.ChoiceField(
        choices=[
            ('activate', 'Activate'),
            ('deactivate', 'Deactivate'),
            ('delete', 'Delete'),
            ('assign_area', 'Assign Service Area'),
        ]
    )
    service_area_id = serializers.UUIDField(required=False)
    
    def validate(self, data):
        """Validate bulk action data"""
        if data['action'] == 'assign_area' and not data.get('service_area_id'):
            raise serializers.ValidationError(
                _("Service area ID is required for assign_area action")
            )
        return data
