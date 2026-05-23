"""
Serializers for Services app.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    
    image_url = serializers.SerializerMethodField()
    # Backward compatibility alias
    urgency = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'category',
            'base_price', 'price_unit', 'duration_minutes',
            'status', 'is_popular', 'available_24_7',
            'image', 'image_url',
            'response_level', 'seasonal_availability', 'urgency',
            'rating', 'review_count', 'features',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get image URL with cache-busting query based on updated_at"""
        if getattr(obj, 'image', None):
            request = self.context.get('request')
            base = request.build_absolute_uri(obj.image.url) if request else obj.image.url
            # Append version param to force refresh when image or record updates
            updated = getattr(obj, 'updated_at', None) or timezone.now()
            version = int(updated.timestamp())
            sep = '&' if '?' in base else '?'
            return f"{base}{sep}v={version}"
        return None

    def get_urgency(self, obj):
        # Alias: map response_level to urgency string expected by FE
        return getattr(obj, 'response_level', None)


class ServiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for service lists"""
    image_url = serializers.SerializerMethodField()
    urgency = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'category', 'base_price', 'price_unit',
            'duration_minutes', 'status', 'rating', 'review_count',
            'is_popular', 'image_url', 'urgency'
        ]
        read_only_fields = ['id']

    def get_image_url(self, obj):
        if getattr(obj, 'image', None):
            request = self.context.get('request')
            base = request.build_absolute_uri(obj.image.url) if request else obj.image.url
            updated = getattr(obj, 'updated_at', None) or timezone.now()
            version = int(updated.timestamp())
            sep = '&' if '?' in base else '?'
            return f"{base}{sep}v={version}"
        return None

    def get_urgency(self, obj):
        return getattr(obj, 'response_level', None)


class ServiceCategorySerializer(serializers.Serializer):
    """Serializer for service categories"""
    
    category = serializers.CharField()
    count = serializers.IntegerField()
    services = ServiceListSerializer(many=True, read_only=True)
