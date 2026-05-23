"""
Appointment models for service scheduling and tracking.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from apps.core.models import BaseModel, NotesModel, MetadataModel
from apps.core.enums import AppointmentStatus, PriorityLevel
from apps.users.models import UserProfile
from apps.properties.models import Property
from apps.services.models import Service
import uuid


class Appointment(BaseModel, NotesModel, MetadataModel):
    """
    Service appointments for pool maintenance and repairs.
    Core model for scheduling and service delivery.
    """
    
    # Relationships
    customer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='customer_appointments',
        limit_choices_to={'role': 'customer'},
        help_text=_("Customer who requested the appointment")
    )
    
    technician = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='technician_appointments',
        limit_choices_to={'role': 'technician'},
        help_text=_("Assigned technician")
    )
    
    property_ref = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text=_("Property to be serviced")
    )
    
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        related_name='appointments',
        help_text=_("Primary service to be performed")
    )
    
    # Additional services (for multiple services in one appointment)
    additional_services = models.ManyToManyField(
        Service,
        blank=True,
        related_name='additional_appointments',
        help_text=_("Additional services to be performed")
    )
    
    # Scheduling
    scheduled_date = models.DateTimeField(
        help_text=_("Scheduled appointment start time")
    )
    
    scheduled_end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Scheduled appointment end time")
    )
    
    estimated_duration_minutes = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(15), MaxValueValidator(480)],
        help_text=_("Estimated duration in minutes")
    )
    
    actual_start_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Actual start time of service")
    )
    
    actual_end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Actual end time of service")
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.PENDING,
        help_text=_("Current appointment status")
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PriorityLevel.choices,
        default=PriorityLevel.MEDIUM,
        help_text=_("Appointment priority")
    )
    
    # Confirmation
    confirmation_code = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text=_("Unique confirmation code")
    )
    
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When appointment was confirmed")
    )
    
    confirmed_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_appointments',
        help_text=_("Who confirmed the appointment")
    )
    
    # Cancellation
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When appointment was cancelled")
    )
    
    cancelled_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_appointments',
        help_text=_("Who cancelled the appointment")
    )
    
    cancellation_reason = models.TextField(
        blank=True,
        null=True,
        help_text=_("Reason for cancellation")
    )
    
    # Rescheduling
    rescheduled_from = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rescheduled_to',
        help_text=_("Original appointment if this is a reschedule")
    )
    
    reschedule_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of times this appointment has been rescheduled")
    )
    
    # Service completion
    completion_notes = models.TextField(
        blank=True,
        null=True,
        help_text=_("Notes from service completion")
    )
    
    issues_found = models.JSONField(
        default=list,
        blank=True,
        help_text=_("Issues discovered during service")
    )
    
    recommendations = models.JSONField(
        default=list,
        blank=True,
        help_text=_("Technician recommendations")
    )
    
    # Photos
    before_photos = models.JSONField(
        default=list,
        blank=True,
        help_text=_("URLs of before service photos")
    )
    
    after_photos = models.JSONField(
        default=list,
        blank=True,
        help_text=_("URLs of after service photos")
    )
    
    # Customer interaction
    customer_signature = models.TextField(
        blank=True,
        null=True,
        help_text=_("Customer signature (base64 encoded)")
    )
    
    customer_feedback = models.TextField(
        blank=True,
        null=True,
        help_text=_("Customer feedback after service")
    )
    
    customer_rating = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Customer rating (1-5 stars)")
    )
    
    # Financial
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Base service price")
    )
    
    additional_charges = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Additional charges (parts, extra services, etc.)")
    )
    
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Discount amount applied")
    )
    
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Tax amount")
    )
    
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Total amount charged")
    )
    
    # Tracking
    is_recurring = models.BooleanField(
        default=False,
        help_text=_("Is this part of a recurring schedule?")
    )
    
    recurring_appointment = models.ForeignKey(
        'RecurringAppointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        help_text=_("Associated recurring appointment schedule")
    )
    
    requires_follow_up = models.BooleanField(
        default=False,
        help_text=_("Does this appointment require follow-up?")
    )
    
    follow_up_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Recommended follow-up date")
    )
    
    # Weather
    weather_conditions = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Weather conditions during service")
    )
    
    # Notifications
    reminder_sent = models.BooleanField(
        default=False,
        help_text=_("Has reminder been sent?")
    )
    
    reminder_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When reminder was sent")
    )
    
    class Meta:
        verbose_name = _("Appointment")
        verbose_name_plural = _("Appointments")
        db_table = 'appointments'
        ordering = ['scheduled_date', 'priority']
        indexes = [
            models.Index(fields=['scheduled_date', 'status']),
            models.Index(fields=['customer', 'scheduled_date']),
            models.Index(fields=['technician', 'scheduled_date']),
            models.Index(fields=['property_ref', 'scheduled_date']),
            models.Index(fields=['confirmation_code']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.confirmation_code} - {self.property_ref.display_name} on {self.scheduled_date}"
    
    def save(self, *args, **kwargs):
        # Generate confirmation code if not set
        if not self.confirmation_code:
            self.confirmation_code = self.generate_confirmation_code()
        
        # Calculate scheduled end time if not set
        if not self.scheduled_end_time:
            self.scheduled_end_time = self.scheduled_date + timedelta(
                minutes=self.estimated_duration_minutes
            )
        
        # Calculate total amount
        self.calculate_total()
        
        super().save(*args, **kwargs)
    
    def generate_confirmation_code(self):
        """Generate unique confirmation code"""
        import random
        import string
        
        while True:
            code = 'APT-' + ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=8)
            )
            if not Appointment.objects.filter(confirmation_code=code).exists():
                return code
    
    def calculate_total(self):
        """Calculate total amount for appointment"""
        subtotal = self.base_price + self.additional_charges - self.discount_amount
        self.total_amount = subtotal + self.tax_amount
        return self.total_amount
    
    @property
    def actual_duration_minutes(self):
        """Calculate actual duration if service completed"""
        if self.actual_start_time and self.actual_end_time:
            duration = self.actual_end_time - self.actual_start_time
            return int(duration.total_seconds() / 60)
        return None
    
    @property
    def is_past_due(self):
        """Check if appointment is past due"""
        if self.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            return False
        return self.scheduled_date < timezone.now()
    
    @property
    def is_today(self):
        """Check if appointment is today"""
        today = timezone.now().date()
        return self.scheduled_date.date() == today
    
    @property
    def is_upcoming(self):
        """Check if appointment is upcoming"""
        return self.scheduled_date > timezone.now()
    
    def confirm(self, user=None):
        """Confirm the appointment"""
        self.status = AppointmentStatus.CONFIRMED
        self.confirmed_at = timezone.now()
        self.confirmed_by = user.profile if user and hasattr(user, 'profile') else None
        self.save(update_fields=['status', 'confirmed_at', 'confirmed_by'])
    
    def cancel(self, user=None, reason=''):
        """Cancel the appointment"""
        self.status = AppointmentStatus.CANCELLED
        self.cancelled_at = timezone.now()
        self.cancelled_by = user.profile if user and hasattr(user, 'profile') else None
        self.cancellation_reason = reason
        self.save(update_fields=['status', 'cancelled_at', 'cancelled_by', 'cancellation_reason'])
    
    def start_service(self):
        """Mark service as started"""
        self.status = AppointmentStatus.IN_PROGRESS
        self.actual_start_time = timezone.now()
        self.save(update_fields=['status', 'actual_start_time'])
    
    def complete_service(self, notes=''):
        """Mark service as completed"""
        self.status = AppointmentStatus.COMPLETED
        self.actual_end_time = timezone.now()
        self.completion_notes = notes
        self.save(update_fields=['status', 'actual_end_time', 'completion_notes'])
        
        # Update property last service date
        self.property_ref.last_service_date = self.actual_end_time
        self.property_ref.total_services += 1
        self.property_ref.save(update_fields=['last_service_date', 'total_services'])
    
    def reschedule(self, new_date, user=None):
        """Reschedule the appointment"""
        # Create new appointment with rescheduled date
        new_appointment = Appointment.objects.create(
            customer=self.customer,
            technician=self.technician,
            property_ref=self.property_ref,
            service=self.service,
            scheduled_date=new_date,
            estimated_duration_minutes=self.estimated_duration_minutes,
            status=AppointmentStatus.CONFIRMED,
            priority=self.priority,
            base_price=self.base_price,
            notes=self.notes,
            internal_notes=self.internal_notes,
            rescheduled_from=self,
            reschedule_count=self.reschedule_count + 1,
            created_by=user
        )
        
        # Copy additional services
        new_appointment.additional_services.set(self.additional_services.all())
        
        # Update current appointment
        self.status = AppointmentStatus.RESCHEDULED
        self.save(update_fields=['status'])
        
        return new_appointment
    
    def send_reminder(self):
        """Send appointment reminder"""
        # This would integrate with notification system
        self.reminder_sent = True
        self.reminder_sent_at = timezone.now()
        self.save(update_fields=['reminder_sent', 'reminder_sent_at'])


class RecurringAppointment(BaseModel):
    """
    Recurring appointment schedules for regular maintenance.
    """
    
    customer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='recurring_appointments',
        limit_choices_to={'role': 'customer'},
        help_text=_("Customer for recurring service")
    )
    
    property_ref = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='recurring_appointments',
        help_text=_("Property for recurring service")
    )
    
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recurring_appointments',
        help_text=_("Service to be performed")
    )
    
    # Schedule
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('weekly', _('Weekly')),
            ('biweekly', _('Bi-Weekly')),
            ('monthly', _('Monthly')),
            ('quarterly', _('Quarterly')),
        ],
        default='weekly',
        help_text=_("Frequency of service")
    )
    
    day_of_week = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(6)],
        help_text=_("Day of week (0=Monday, 6=Sunday)")
    )
    
    day_of_month = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text=_("Day of month for monthly service")
    )
    
    preferred_time = models.TimeField(
        help_text=_("Preferred time for service")
    )
    
    duration_minutes = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(15), MaxValueValidator(480)],
        help_text=_("Duration in minutes")
    )
    
    # Active period
    start_date = models.DateField(
        help_text=_("When recurring schedule starts")
    )
    
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("When recurring schedule ends (null = ongoing)")
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text=_("Is this recurring schedule active?")
    )
    
    # Tracking
    last_generated_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Last date appointments were generated up to")
    )
    
    total_appointments_created = models.PositiveIntegerField(
        default=0,
        help_text=_("Total appointments created from this schedule")
    )
    
    # Preferences
    assigned_technician = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_recurring_appointments',
        limit_choices_to={'role': 'technician'},
        help_text=_("Preferred technician for service")
    )
    
    auto_confirm = models.BooleanField(
        default=True,
        help_text=_("Automatically confirm generated appointments")
    )
    
    skip_holidays = models.BooleanField(
        default=True,
        help_text=_("Skip appointments on holidays")
    )
    
    class Meta:
        verbose_name = _("Recurring Appointment")
        verbose_name_plural = _("Recurring Appointments")
        db_table = 'recurring_appointments'
        ordering = ['property_ref', 'start_date']
    
    def __str__(self):
        return f"{self.get_frequency_display()} service for {self.property_ref.display_name}"
    
    def generate_appointments(self, until_date=None):
        """Generate appointments based on schedule"""
        from datetime import datetime, date
        
        if not until_date:
            # Generate appointments for next 3 months by default
            until_date = date.today() + timedelta(days=90)
        
        # Start from last generated date or start date
        current_date = self.last_generated_date or self.start_date
        appointments_created = []
        
        while current_date <= until_date:
            # Skip if end date reached
            if self.end_date and current_date > self.end_date:
                break
            
            # Calculate next appointment date based on frequency
            if self.frequency == 'weekly':
                # Find next occurrence of day_of_week
                days_ahead = self.day_of_week - current_date.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                next_date = current_date + timedelta(days=days_ahead)
            
            elif self.frequency == 'biweekly':
                # Similar to weekly but add 14 days
                days_ahead = self.day_of_week - current_date.weekday()
                if days_ahead <= 0:
                    days_ahead += 14
                next_date = current_date + timedelta(days=days_ahead)
            
            elif self.frequency == 'monthly':
                # Next occurrence of day_of_month
                if current_date.day <= self.day_of_month:
                    next_date = current_date.replace(day=self.day_of_month)
                else:
                    # Move to next month
                    if current_date.month == 12:
                        next_date = current_date.replace(year=current_date.year + 1, month=1, day=self.day_of_month)
                    else:
                        next_date = current_date.replace(month=current_date.month + 1, day=self.day_of_month)
            
            elif self.frequency == 'quarterly':
                # Every 3 months
                next_date = current_date + timedelta(days=90)
            
            else:
                break
            
            # Create appointment if date is valid
            if next_date <= until_date:
                scheduled_datetime = datetime.combine(next_date, self.preferred_time)
                scheduled_datetime = timezone.make_aware(scheduled_datetime)
                
                appointment = Appointment.objects.create(
                    customer=self.customer,
                    technician=self.assigned_technician,
                    property_ref=self.property_ref,
                    service=self.service,
                    scheduled_date=scheduled_datetime,
                    estimated_duration_minutes=self.duration_minutes,
                    status=AppointmentStatus.CONFIRMED if self.auto_confirm else AppointmentStatus.PENDING,
                    is_recurring=True,
                    recurring_appointment=self,
                    created_by=self.created_by
                )
                appointments_created.append(appointment)
                self.total_appointments_created += 1
            
            current_date = next_date
        
        # Update last generated date
        self.last_generated_date = until_date
        self.save(update_fields=['last_generated_date', 'total_appointments_created'])
        
        return appointments_created


class AppointmentCheckIn(BaseModel):
    """
    Track technician check-ins and check-outs for appointments.
    """
    
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='check_ins',
        help_text=_("Associated appointment")
    )
    
    technician = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='check_ins',
        help_text=_("Technician checking in")
    )
    
    check_in_time = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Check-in timestamp")
    )
    
    check_in_location = models.JSONField(
        default=dict,
        help_text=_("GPS coordinates of check-in")
    )
    
    check_out_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Check-out timestamp")
    )
    
    check_out_location = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("GPS coordinates of check-out")
    )
    
    mileage = models.DecimalField(
        max_digits=6,
        decimal_places=1,
        null=True,
        blank=True,
        help_text=_("Travel mileage for this appointment")
    )
    
    class Meta:
        verbose_name = _("Appointment Check-In")
        verbose_name_plural = _("Appointment Check-Ins")
        db_table = 'appointment_check_ins'
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"Check-in for {self.appointment.confirmation_code} by {self.technician.full_name}"
    
    @property
    def duration(self):
        """Get duration of service"""
        if self.check_in_time and self.check_out_time:
            return self.check_out_time - self.check_in_time
        return None
    
    def check_out(self, location=None, mileage=None):
        """Record check-out"""
        self.check_out_time = timezone.now()
        if location:
            self.check_out_location = location
        if mileage:
            self.mileage = mileage
        self.save(update_fields=['check_out_time', 'check_out_location', 'mileage'])
