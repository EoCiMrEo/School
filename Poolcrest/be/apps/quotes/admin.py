from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import Quote, QuoteItem

class QuoteItemInline(admin.TabularInline):
    """Inline admin for quote items"""
    model = QuoteItem
    extra = 1
    fields = [
        'item_type', 'service', 'description', 'quantity',
        'unit_price', 'total_price', 'is_optional', 'is_included', 'sort_order'
    ]
    readonly_fields = ['total_price']
    ordering = ['sort_order']


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    """Admin interface for Quote model"""
    
    list_display = [
        'quote_number', 'title', 'customer_link', 'property_link',
        'status_badge', 'total_amount_display', 'valid_until',
        'created_at'
    ]
    
    list_filter = [
        'status', 'created_at', 'valid_until',
        'viewed_by_customer', 'customer_notified'
    ]
    
    search_fields = [
        'quote_number', 'title', 'description',
        'customer__full_name', 'customer__user__email'
    ]
    
    readonly_fields = [
        'quote_number', 'subtotal', 'tax_amount', 'total_amount',
        'processed_at', 'processed_by', 'customer_response_at',
        'customer_notified_at', 'viewed_at', 'created_at',
        'updated_at', 'created_by', 'updated_by'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'quote_number', 'title', 'customer', 'property_ref',
                'description', 'status'
            )
        }),
        ('Financial', {
            'fields': (
                'subtotal', 'promotion_code', 'promotion',
                'discount_percentage', 'discount_amount',
                'tax_rate', 'tax_amount', 'total_amount'
            )
        }),
        ('Processing', {
            'fields': (
                'processed_by', 'processed_at', 'valid_until',
                'terms_conditions'
            )
        }),
        ('Customer Interaction', {
            'fields': (
                'customer_notified', 'customer_notified_at',
                'viewed_by_customer', 'viewed_at',
                'customer_response_at', 'rejection_reason'
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
    
    inlines = [QuoteItemInline]
    
    def customer_link(self, obj):
        """Link to customer profile"""
        if obj.customer:
            url = reverse('admin:users_userprofile_change', args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
        return '-'
    customer_link.short_description = 'Customer'
    
    def property_link(self, obj):
        """Link to property"""
        if obj.property_ref:
            url = reverse('admin:properties_property_change', args=[obj.property_ref.id])
            return format_html('<a href="{}">{}</a>', url, obj.property_ref.display_name)
        return '-'
    property_link.short_description = 'Property'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'initialized': 'gray',
            'processed': 'blue',
            'awaiting_payment': 'orange',
            'confirmed': 'green',
            'rejected': 'red',
            'expired': 'gray',
            'cancelled': 'black'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def total_amount_display(self, obj):
        """Display formatted total amount"""
        return f"${obj.total_amount:,.2f}"
    total_amount_display.short_description = 'Total'
    
    def get_queryset(self, request):
        """Optimize queryset with related data"""
        qs = super().get_queryset(request)
        return qs.select_related(
            'customer', 'property_ref', 'processed_by', 'promotion'
        ).prefetch_related('items')
    
    actions = ['mark_as_processed', 'send_to_customers', 'mark_as_expired']
    
    def mark_as_processed(self, request, queryset):
        """Mark selected quotes as processed"""
        count = 0
        for quote in queryset.filter(status='initialized'):
            quote.process(request.user)
            count += 1
        self.message_user(request, f"{count} quotes marked as processed")
    mark_as_processed.short_description = "Mark selected quotes as processed"
    
    def send_to_customers(self, request, queryset):
        """Send selected quotes to customers"""
        count = 0
        for quote in queryset.filter(status='processed'):
            quote.send_to_customer()
            count += 1
        self.message_user(request, f"{count} quotes sent to customers")
    send_to_customers.short_description = "Send selected quotes to customers"
    
    def mark_as_expired(self, request, queryset):
        """Mark selected quotes as expired"""
        count = queryset.filter(
            status__in=['initialized', 'processed', 'awaiting_payment']
        ).update(status='expired')
        self.message_user(request, f"{count} quotes marked as expired")
    mark_as_expired.short_description = "Mark selected quotes as expired"


@admin.register(QuoteItem)
class QuoteItemAdmin(admin.ModelAdmin):
    """Admin interface for QuoteItem model"""
    
    list_display = [
        'quote_link', 'item_type', 'description', 'quantity',
        'unit_price', 'total_price', 'is_optional', 'is_included'
    ]
    
    list_filter = ['item_type', 'is_optional', 'is_included', 'created_at']
    
    search_fields = [
        'description', 'detailed_description',
        'quote__quote_number', 'service__name'
    ]
    
    readonly_fields = ['total_price', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Quote Information', {
            'fields': ('quote', 'service', 'item_type')
        }),
        ('Item Details', {
            'fields': (
                'description', 'detailed_description',
                'quantity', 'unit_price', 'total_price'
            )
        }),
        ('Options', {
            'fields': ('is_optional', 'is_included', 'sort_order')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def quote_link(self, obj):
        """Link to parent quote"""
        url = reverse('admin:quotes_quote_change', args=[obj.quote.id])
        return format_html('<a href="{}">{}</a>', url, obj.quote.quote_number)
    quote_link.short_description = 'Quote'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        qs = super().get_queryset(request)
        return qs.select_related('quote', 'service')

