from django.contrib import admin
from .models import Property, PropertyPhoto, PropertyNote, ServiceArea


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """Admin interface for Property model"""
    
    list_display = [
        'property_code', 'display_name', 'customer', 'pool_type',
        'pool_size', 'is_active', 'is_primary', 'created_at'
    ]
    list_filter = [
        'is_active', 'is_primary', 'pool_type', 'pool_size',
        'state', 'created_at'
    ]
    search_fields = [
        'property_code', 'property_name', 'address_line1',
        'city', 'customer__full_name', 'customer__user__email'
    ]
    readonly_fields = [
        'property_code', 'created_at', 'updated_at',
        'created_by', 'updated_by'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'property_code', 'customer', 'property_name',
                'is_primary', 'is_active'
            )
        }),
        ('Address', {
            'fields': (
                'address_line1', 'address_line2', 'city',
                'state', 'zip_code', 'country'
            )
        }),
        ('Pool Information', {
            'fields': (
                'pool_type', 'pool_size', 'pool_volume_gallons',
                'pool_length_feet', 'pool_width_feet',
                'pool_depth_shallow_feet', 'pool_depth_deep_feet',
                'pool_features'
            )
        }),
        ('Access Information', {
            'fields': (
                'gate_code', 'access_instructions', 'key_location',
                'parking_instructions'
            )
        }),
        ('Service Information', {
            'fields': (
                'preferred_service_day', 'preferred_service_time',
                'service_frequency', 'last_service_date',
                'next_service_date', 'total_services'
            )
        }),
        ('Notes', {
            'fields': ('notes', 'internal_notes')
        }),
        ('Metadata', {
            'fields': (
                'created_at', 'created_by', 'updated_at', 'updated_by'
            ),
            'classes': ('collapse',)
        })
    )
    
    def display_name(self, obj):
        return obj.display_name
    display_name.short_description = 'Display Name'


@admin.register(PropertyPhoto)
class PropertyPhotoAdmin(admin.ModelAdmin):
    """Admin interface for PropertyPhoto model"""
    
    list_display = [
        'property_ref', 'photo_type', 'caption', 'is_primary',
        'taken_date', 'created_at'
    ]
    list_filter = ['photo_type', 'is_primary', 'created_at']
    search_fields = ['property__property_name', 'caption']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PropertyNote)
class PropertyNoteAdmin(admin.ModelAdmin):
    """Admin interface for PropertyNote model"""
    
    list_display = [
        'subject', 'property_ref', 'note_type', 'is_pinned',
        'is_alert', 'created_by', 'created_at'
    ]
    list_filter = [
        'note_type', 'is_pinned', 'is_alert', 'created_at'
    ]
    search_fields = ['subject', 'content', 'property__property_name']
    readonly_fields = ['created_at', 'updated_at', 'created_by']


@admin.register(ServiceArea)
class ServiceAreaAdmin(admin.ModelAdmin):
    """Admin interface for ServiceArea model"""
    
    list_display = [
        'name', 'is_active', 'travel_fee', 'price_modifier',
        'current_properties', 'max_properties'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description', 'zip_codes']
    filter_horizontal = ['assigned_technicians']
    readonly_fields = ['current_properties', 'created_at', 'updated_at']
