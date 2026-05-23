from rest_framework import serializers
from apps.payments.models import PaymentHistory


class PaymentHistorySerializer(serializers.ModelSerializer):
    quote_number = serializers.CharField(source='quote.quote_number', read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'quote', 'quote_number', 'customer', 'customer_name',
            'amount', 'currency', 'status', 'provider',
            'payment_intent_id', 'checkout_session_id', 'paid_at',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_customer_name(self, obj):
        if obj.customer and getattr(obj.customer, 'full_name', None):
            return obj.customer.full_name
        user = getattr(obj.customer, 'user', None) if obj.customer else None
        return getattr(user, 'email', None)
