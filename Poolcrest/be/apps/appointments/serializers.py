"""
Serializers for Appointments app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from .models import Appointment, RecurringAppointment, AppointmentCheckIn
from apps.users.serializers import UserProfileSerializer
from apps.properties.serializers import PropertyListSerializer
from apps.services.serializers import ServiceSerializer


class AppointmentCheckInSerializer(serializers.ModelSerializer):
    """Serializer for appointment check-ins"""
    
    technician_name = serializers.CharField(source='technician.full_name', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = AppointmentCheckIn
        fields = [
            'id', 'appointment', 'technician', 'technician_name',
            'check_in_time', 'check_in_location', 'check_out_time',
            'check_out_location', 'mileage', 'duration', 'created_at'
        ]
        read_only_fields = ['id', 'technician', 'check_in_time', 'created_at']
    
    def get_duration(self, obj):
        """Get formatted duration"""
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return None


class AppointmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for appointment lists"""
    
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    technician_name = serializers.CharField(source='technician.full_name', read_only=True, allow_null=True)
    property_address = serializers.CharField(source='property.short_address', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True, allow_null=True)
    is_past_due = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'confirmation_code', 'customer', 'customer_name',
            'technician', 'technician_name', 'property_ref', 'property_address',
            'service', 'service_name', 'scheduled_date', 'scheduled_end_time',
            'status', 'priority', 'total_amount', 'is_past_due',
            'is_today', 'is_upcoming', 'created_at'
        ]
        read_only_fields = ['id', 'confirmation_code', 'created_at']


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for appointments"""
    
    customer = UserProfileSerializer(read_only=True)
    technician = UserProfileSerializer(read_only=True)
    property = PropertyListSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    additional_services = ServiceSerializer(many=True, read_only=True)
    check_ins = AppointmentCheckInSerializer(many=True, read_only=True)
    actual_duration_minutes = serializers.IntegerField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = [
            'id', 'confirmation_code', 'created_at', 'updated_at',
            'created_by', 'updated_by', 'confirmed_at', 'confirmed_by',
            'cancelled_at', 'cancelled_by', 'total_amount'
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    
    customer_id = serializers.UUIDField(write_only=True)
    property_id = serializers.UUIDField(write_only=True)
    service_id = serializers.UUIDField(write_only=True, required=False)
    technician_id = serializers.UUIDField(write_only=True, required=False)
    additional_service_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Appointment
        fields = [
            'customer_id', 'property_id', 'service_id', 'technician_id',
            'additional_service_ids', 'scheduled_date', 'estimated_duration_minutes',
            'priority', 'notes', 'internal_notes', 'base_price'
        ]
    
    def validate_scheduled_date(self, value):
        """Validate scheduled date is in the future"""
        if value < timezone.now():
            raise serializers.ValidationError(_("Scheduled date must be in the future"))
        return value
    
    def validate(self, data):
        """Additional validation"""
        from apps.users.models import UserProfile
        from apps.properties.models import Property
        from apps.services.models import Service
        
        # Validate customer
        try:
            customer = UserProfile.objects.get(id=data['customer_id'], role='customer')
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError({'customer_id': _("Customer not found")})
        
        # Validate property belongs to customer
        try:
            property_obj = Property.objects.get(id=data['property_id'])
            if property_obj.customer != customer:
                raise serializers.ValidationError({
                    'property_id': _("Property does not belong to this customer")
                })
        except Property.DoesNotExist:
            raise serializers.ValidationError({'property_id': _("Property not found")})
        
        # Validate technician if provided
        if 'technician_id' in data:
            try:
                UserProfile.objects.get(id=data['technician_id'], role='technician')
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({'technician_id': _("Technician not found")})
        
        # Validate service if provided
        if 'service_id' in data:
            try:
                Service.objects.get(id=data['service_id'])
            except Service.DoesNotExist:
                raise serializers.ValidationError({'service_id': _("Service not found")})
        
        # Check for scheduling conflicts
        scheduled_date = data['scheduled_date']
        duration = data.get('estimated_duration_minutes', 60)
        scheduled_end = scheduled_date + timedelta(minutes=duration)
        
        # Check if technician has conflicts
        if 'technician_id' in data:
            conflicts = Appointment.objects.filter(
                technician_id=data['technician_id'],
                scheduled_date__lt=scheduled_end,
                scheduled_end_time__gt=scheduled_date,
                status__in=['confirmed', 'in_progress']
            )
            if conflicts.exists():
                raise serializers.ValidationError({
                    'scheduled_date': _("Technician has a scheduling conflict at this time")
                })
        
        return data
    
    def create(self, validated_data):
        """Create appointment"""
        from apps.users.models import UserProfile
        from apps.properties.models import Property
        from apps.services.models import Service
        
        # Extract IDs
        customer_id = validated_data.pop('customer_id')
        property_id = validated_data.pop('property_id')
        service_id = validated_data.pop('service_id', None)
        technician_id = validated_data.pop('technician_id', None)
        additional_service_ids = validated_data.pop('additional_service_ids', [])
        
        # Get objects
        customer = UserProfile.objects.get(id=customer_id)
        property_obj = Property.objects.get(id=property_id)
        service = Service.objects.get(id=service_id) if service_id else None
        technician = UserProfile.objects.get(id=technician_id) if technician_id else None
        
        # Create appointment
        appointment = Appointment.objects.create(
            customer=customer,
            property=property_obj,
            service=service,
            technician=technician,
            created_by=self.context['request'].user,
            **validated_data
        )
        
        # Add additional services
        if additional_service_ids:
            additional_services = Service.objects.filter(id__in=additional_service_ids)
            appointment.additional_services.set(additional_services)
        
        return appointment


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments"""
    
    technician_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Appointment
        fields = [
            'technician_id', 'scheduled_date', 'scheduled_end_time',
            'estimated_duration_minutes', 'status', 'priority',
            'notes', 'internal_notes', 'base_price', 'additional_charges',
            'discount_amount', 'tax_amount'
        ]
    
    def validate_technician_id(self, value):
        """Validate technician"""
        from apps.users.models import UserProfile
        try:
            UserProfile.objects.get(id=value, role='technician')
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError(_("Technician not found"))
        return value
    
    def update(self, instance, validated_data):
        """Update appointment"""
        from apps.users.models import UserProfile
        
        # Handle technician update
        if 'technician_id' in validated_data:
            technician_id = validated_data.pop('technician_id')
            instance.technician = UserProfile.objects.get(id=technician_id)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.updated_by = self.context['request'].user
        instance.save()
        
        return instance


class AppointmentRescheduleSerializer(serializers.Serializer):
    """Serializer for rescheduling appointments"""
    
    new_date = serializers.DateTimeField()
    reason = serializers.CharField(max_length=500, required=False)
    
    def validate_new_date(self, value):
        """Validate new date is in the future"""
        if value < timezone.now():
            raise serializers.ValidationError(_("New date must be in the future"))
        return value


class AppointmentBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk appointment actions"""
    
    appointment_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    action = serializers.ChoiceField(
        choices=[
            ('confirm', 'Confirm'),
            ('cancel', 'Cancel'),
            ('assign_technician', 'Assign Technician'),
            ('send_reminders', 'Send Reminders'),
        ]
    )
    technician_id = serializers.UUIDField(required=False)
    cancellation_reason = serializers.CharField(max_length=500, required=False)
    
    def validate(self, data):
        """Validate bulk action data"""
        if data['action'] == 'assign_technician' and not data.get('technician_id'):
            raise serializers.ValidationError(
                _("Technician ID is required for assign_technician action")
            )
        if data['action'] == 'cancel' and not data.get('cancellation_reason'):
            raise serializers.ValidationError(
                _("Cancellation reason is required for cancel action")
            )
        return data


class RecurringAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for recurring appointments"""
    
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    property_address = serializers.CharField(source='property.short_address', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True, allow_null=True)
    technician_name = serializers.CharField(
        source='assigned_technician.full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = RecurringAppointment
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'last_generated_date',
            'total_appointments_created'
        ]


class AppointmentCalendarSerializer(serializers.Serializer):
    """Serializer for calendar view data"""
    
    date = serializers.DateField()
    appointments = AppointmentListSerializer(many=True)
    total_appointments = serializers.IntegerField()
    total_confirmed = serializers.IntegerField()
    total_pending = serializers.IntegerField()
    total_completed = serializers.IntegerField()


class TechnicianScheduleSerializer(serializers.Serializer):
    """Serializer for technician schedule view"""
    
    technician = UserProfileSerializer()
    date = serializers.DateField()
    appointments = AppointmentListSerializer(many=True)
    total_appointments = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()
    available_slots = serializers.ListField(child=serializers.DictField())
