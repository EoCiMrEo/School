from rest_framework import serializers
from apps.promotions.models import Promotion
from django.utils.translation import gettext_lazy as _
from apps.services.serializers import ServiceSerializer


class PromotionSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    remaining_uses = serializers.IntegerField(read_only=True)
    applicable_services_list = ServiceSerializer(
        source='applicable_services',
        many=True,
        read_only=True
    )

    class Meta:
        model = Promotion
        fields = '__all__'
        read_only_fields = [
            'id', 'usage_count', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]

    def validate_code(self, value):
        return value.upper().strip()

    def validate(self, data):
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')
        if valid_from and valid_until and valid_from >= valid_until:
            raise serializers.ValidationError(
                _("Valid until date must be after valid from date")
            )
        discount_type = data.get('discount_type', 'percentage')
        discount_value = data.get('discount_value', 0)
        if discount_type == 'percentage' and discount_value > 100:
            raise serializers.ValidationError(
                _("Percentage discount cannot exceed 100%")
            )
        return data
