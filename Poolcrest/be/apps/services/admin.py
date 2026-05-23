from django.utils.html import format_html
from django.contrib import admin
from .models import Service
# Register your models here.
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'base_price', 'price_unit', 'duration_minutes',
    'status', 'is_popular', 'available_24_7', 'response_level',
        'rating', 'review_count', 'seasonal_availability'
    )

    search_fields = ('name', 'category', 'description')

    list_filter = ('category', 'status', 'seasonal_availability', 'response_level', 'is_popular', 'available_24_7')
    
    # list_editable = ('')

    fieldsets = (
    ('Basic Information', {'fields': ('name', 'description', 'category', 'response_level', 'seasonal_availability')}),
        ('Pricing & Duration', {'fields': ('base_price', 'price_unit', 'duration_minutes')}),
        ('Status & Flags', {'fields': ('status', 'is_popular', 'available_24_7')}),
        ('Ratings & Features', {'fields': ('rating', 'review_count', 'features')}),
        ('Image', {'fields': ('image',), 'classes': ('collapse',)}),
        # ('Metadata', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    readonly_fields = ('id',)

    # actions = ['make_active', 'make_inactive']

    # def make_active(self, request, queryset):
    #     queryset.update(status='active')
    # make_active.short_description = "Mark selected services as active"

    # def make_inactive(self, request, queryset):
    #     queryset.update(status='inactive')
    # make_inactive.short_description = "Mark selected services as inactive"

    # def image_tag(self, obj):
    #     if obj.image:
    #         return format_html('<img src="{}" style="max-height:50px;"/>', obj.image.url)
    #     return "-"
    # image_tag.short_description = 'Image'
    # list_display = ('name', 'image_tag', ...)  # add image_tag to list_display


admin.site.register(Service, ServiceAdmin)