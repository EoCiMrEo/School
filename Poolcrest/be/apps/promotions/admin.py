from django.contrib import admin
from django.utils.html import format_html
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    """Admin interface for Promotion model"""
    
    list_display = [
        'code', 'name', 'discount_display', 'valid_period',
        'usage_display', 'is_active_badge', 'created_at'
    ]
    
    list_filter = [
        'is_active', 'discount_type', 'for_new_customers_only',
        'for_existing_customers_only', 'valid_from', 'valid_until'
    ]
    
    search_fields = ['code', 'name', 'description']
    
    readonly_fields = [
        'usage_count', 'created_at', 'updated_at',
        'created_by', 'updated_by'
    ]
    
    filter_horizontal = ['applicable_services']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description', 'is_active')
        }),
        ('Discount Details', {
            'fields': (
                'discount_type', 'discount_value',
                'minimum_amount'
            )
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Usage Limits', {
            'fields': (
                'usage_limit', 'usage_count',
                'usage_limit_per_customer'
            )
        }),
        ('Restrictions', {
            'fields': (
                'for_new_customers_only',
                'for_existing_customers_only',
                'applicable_services'
            )
        }),
        ('Metadata', {
            'fields': (
                'created_at', 'created_by',
                'updated_at', 'updated_by'
            ),
            'classes': ('collapse',)
        })
    )
    
    def discount_display(self, obj):
        """Display discount value with type"""
        if obj.discount_type == 'percentage':
            return f"{obj.discount_value}%"
        return f"${obj.discount_value}"
    discount_display.short_description = 'Discount'
    
    def valid_period(self, obj):
        """Display validity period"""
        return f"{obj.valid_from.date()} to {obj.valid_until.date()}"
    valid_period.short_description = 'Valid Period'
    
    def usage_display(self, obj):
        """Display usage count vs limit"""
        if obj.usage_limit:
            return f"{obj.usage_count}/{obj.usage_limit}"
        return f"{obj.usage_count}/∞"
    usage_display.short_description = 'Usage'
    
    def is_active_badge(self, obj):
        """Display active status as badge"""
        if obj.is_valid:
            color = 'green'
            text = 'Active'
        elif obj.is_active:
            color = 'orange'
            text = 'Scheduled'
        else:
            color = 'red'
            text = 'Inactive'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color, text
        )
    is_active_badge.short_description = 'Status'
    
    actions = ['activate_promotions', 'deactivate_promotions']
    
    def activate_promotions(self, request, queryset):
        """Activate selected promotions"""
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} promotions activated")
    activate_promotions.short_description = "Activate selected promotions"
    
    def deactivate_promotions(self, request, queryset):
        """Deactivate selected promotions"""
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} promotions deactivated")
    deactivate_promotions.short_description = "Deactivate selected promotions"
