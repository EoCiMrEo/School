from django.contrib import admin
from .models import Appointment, RecurringAppointment, AppointmentCheckIn


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin interface for Appointment model"""
    
    list_display = [
        'confirmation_code', 'customer', 'property_ref', 'technician',
        'scheduled_date', 'status', 'priority', 'total_amount', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'scheduled_date', 'is_recurring',
        'requires_follow_up', 'reminder_sent', 'created_at'
    ]
    search_fields = [
        'confirmation_code', 'customer__full_name', 'property__property_name',
        'property__address_line1', 'technician__full_name'
    ]
    readonly_fields = [
        'confirmation_code', 'created_at', 'updated_at', 'created_by',
        'updated_by', 'confirmed_at', 'confirmed_by', 'cancelled_at',
        'cancelled_by', 'actual_duration_minutes'
    ]
    date_hierarchy = 'scheduled_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'confirmation_code', 'customer', 'property_ref', 'service',
                'additional_services', 'technician'
            )
        }),
        ('Scheduling', {
            'fields': (
                'scheduled_date', 'scheduled_end_time', 'estimated_duration_minutes',
                'actual_start_time', 'actual_end_time', 'priority'
            )
        }),
        ('Status', {
            'fields': (
                'status', 'confirmed_at', 'confirmed_by', 'cancelled_at',
                'cancelled_by', 'cancellation_reason'
            )
        }),
        ('Service Details', {
            'fields': (
                'completion_notes', 'issues_found', 'recommendations',
                'before_photos', 'after_photos', 'weather_conditions'
            )
        }),
        ('Financial', {
            'fields': (
                'base_price', 'additional_charges', 'discount_amount',
                'tax_amount', 'total_amount'
            )
        }),
        ('Customer Interaction', {
            'fields': (
                'customer_signature', 'customer_feedback', 'customer_rating'
            )
        }),
        ('Notes', {
            'fields': ('notes', 'internal_notes')
        }),
        ('Recurring', {
            'fields': (
                'is_recurring', 'recurring_appointment', 'rescheduled_from',
                'reschedule_count'
            ),
            'classes': ('collapse',)
        }),
        ('Follow-up', {
            'fields': ('requires_follow_up', 'follow_up_date'),
            'classes': ('collapse',)
        }),
        ('Notifications', {
            'fields': ('reminder_sent', 'reminder_sent_at'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'created_at', 'created_by', 'updated_at', 'updated_by'
            ),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        """Optimize queryset with related data"""
        qs = super().get_queryset(request)
        return qs.select_related(
            'customer', 'technician', 'property_ref', 'service'
        ).prefetch_related('additional_services')
    
    def actual_duration_minutes(self, obj):
        """Display actual duration"""
        duration = obj.actual_duration_minutes
        if duration:
            hours = duration // 60
            minutes = duration % 60
            return f"{hours}h {minutes}m"
        return '-'
    actual_duration_minutes.short_description = 'Actual Duration'


@admin.register(RecurringAppointment)
class RecurringAppointmentAdmin(admin.ModelAdmin):
    """Admin interface for RecurringAppointment model"""
    
    list_display = [
        'customer', 'property_ref', 'service', 'frequency',
        'start_date', 'end_date', 'is_active', 'total_appointments_created'
    ]
    list_filter = [
        'frequency', 'is_active', 'auto_confirm', 'skip_holidays',
        'start_date', 'created_at'
    ]
    search_fields = [
        'customer__full_name', 'property__property_name',
        'property__address_line1'
    ]
    readonly_fields = [
        'last_generated_date', 'total_appointments_created',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Customer & Property', {
            'fields': ('customer', 'property_ref', 'service')
        }),
        ('Schedule', {
            'fields': (
                'frequency', 'day_of_week', 'day_of_month',
                'preferred_time', 'duration_minutes'
            )
        }),
        ('Active Period', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Preferences', {
            'fields': (
                'assigned_technician', 'auto_confirm', 'skip_holidays'
            )
        }),
        ('Tracking', {
            'fields': (
                'last_generated_date', 'total_appointments_created'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['generate_appointments_action']
    
    def generate_appointments_action(self, request, queryset):
        """Admin action to generate appointments"""
        from datetime import date, timedelta
        
        total_created = 0
        for recurring in queryset:
            # Generate for next 30 days
            until_date = date.today() + timedelta(days=30)
            appointments = recurring.generate_appointments(until_date)
            total_created += len(appointments)
        
        self.message_user(
            request,
            f"Generated {total_created} appointments from {queryset.count()} recurring schedules"
        )
    generate_appointments_action.short_description = "Generate appointments for next 30 days"


@admin.register(AppointmentCheckIn)
class AppointmentCheckInAdmin(admin.ModelAdmin):
    """Admin interface for AppointmentCheckIn model"""
    
    list_display = [
        'appointment', 'technician', 'check_in_time',
        'check_out_time', 'mileage', 'duration_display'
    ]
    list_filter = ['check_in_time', 'technician']
    search_fields = [
        'appointment__confirmation_code', 'technician__full_name'
    ]
    readonly_fields = [
        'check_in_time', 'created_at', 'updated_at', 'duration_display'
    ]
    
    def duration_display(self, obj):
        """Display formatted duration"""
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return '-'
    duration_display.short_description = 'Duration'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        qs = super().get_queryset(request)
        return qs.select_related('appointment', 'technician')
