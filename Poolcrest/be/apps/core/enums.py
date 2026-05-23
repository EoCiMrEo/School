"""
Enum definitions for Poolcrest business logic.
Centralized location for all status choices and business constants.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class AppointmentStatus(models.TextChoices):
    """Status choices for appointments"""
    PENDING = 'pending', _('Pending')
    CONFIRMED = 'confirmed', _('Confirmed')
    IN_PROGRESS = 'in_progress', _('In Progress')
    COMPLETED = 'completed', _('Completed')
    CANCELLED = 'cancelled', _('Cancelled')
    NO_SHOW = 'no_show', _('No Show')
    RESCHEDULED = 'rescheduled', _('Rescheduled')


class ServiceCategory(models.TextChoices):
    """Categories for pool services"""
    CLEANING = 'cleaning', _('Pool Cleaning')
    MAINTENANCE = 'maintenance', _('Regular Maintenance')
    REPAIR = 'repair', _('Equipment Repair')
    INSPECTION = 'inspection', _('Pool Inspection')
    CHEMICAL = 'chemical', _('Chemical Balance')
    EMERGENCY = 'emergency', _('Emergency Service')
    INSTALLATION = 'installation', _('Equipment Installation')
    OPENING = 'opening', _('Pool Opening')
    CLOSING = 'closing', _('Pool Closing')
    RENOVATION = 'renovation', _('Pool Renovation')


class ServiceStatus(models.TextChoices):
    """Status for services offered"""
    ACTIVE = 'active', _('Active')
    INACTIVE = 'inactive', _('Inactive')
    SEASONAL = 'seasonal', _('Seasonal')
    DISCONTINUED = 'discontinued', _('Discontinued')


class PaymentStatus(models.TextChoices):
    """Payment transaction status"""
    PENDING = 'pending', _('Pending')
    PROCESSING = 'processing', _('Processing')
    COMPLETED = 'completed', _('Completed')
    FAILED = 'failed', _('Failed')
    REFUNDED = 'refunded', _('Refunded')
    PARTIALLY_REFUNDED = 'partially_refunded', _('Partially Refunded')
    CANCELLED = 'cancelled', _('Cancelled')


class PaymentMethod(models.TextChoices):
    """Available payment methods"""
    CREDIT_CARD = 'credit_card', _('Credit Card')
    DEBIT_CARD = 'debit_card', _('Debit Card')
    ACH = 'ach', _('ACH Transfer')
    CASH = 'cash', _('Cash')
    CHECK = 'check', _('Check')
    VENMO = 'venmo', _('Venmo')
    ZELLE = 'zelle', _('Zelle')
    PAYPAL = 'paypal', _('PayPal')
    INVOICE = 'invoice', _('Invoice')


class QuoteStatus(models.TextChoices):
    """Quote lifecycle status"""
    DRAFT = 'draft', _('Draft')
    PENDING = 'pending', _('Pending Review')
    SENT = 'sent', _('Sent to Customer')
    VIEWED = 'viewed', _('Viewed by Customer')
    ACCEPTED = 'accepted', _('Accepted')
    REJECTED = 'rejected', _('Rejected')
    EXPIRED = 'expired', _('Expired')
    CONVERTED = 'converted', _('Converted to Job')


class PriorityLevel(models.TextChoices):
    """Priority levels for requests and tasks"""
    LOW = 'low', _('Low Priority')
    MEDIUM = 'medium', _('Medium Priority')
    HIGH = 'high', _('High Priority')
    URGENT = 'urgent', _('Urgent')
    CRITICAL = 'critical', _('Critical')


class NotificationType(models.TextChoices):
    """Types of notifications"""
    APPOINTMENT_REMINDER = 'appointment_reminder', _('Appointment Reminder')
    APPOINTMENT_CONFIRMED = 'appointment_confirmed', _('Appointment Confirmed')
    APPOINTMENT_CANCELLED = 'appointment_cancelled', _('Appointment Cancelled')
    APPOINTMENT_RESCHEDULED = 'appointment_rescheduled', _('Appointment Rescheduled')
    QUOTE_SENT = 'quote_sent', _('Quote Sent')
    QUOTE_UPDATE = 'quote_update', _('Quote Updated')
    QUOTE_ACCEPTED = 'quote_accepted', _('Quote Accepted')
    PAYMENT_RECEIVED = 'payment_received', _('Payment Received')
    PAYMENT_FAILED = 'payment_failed', _('Payment Failed')
    SERVICE_COMPLETED = 'service_completed', _('Service Completed')
    SERVICE_REPORT = 'service_report', _('Service Report Available')
    EMERGENCY_ALERT = 'emergency_alert', _('Emergency Alert')
    MAINTENANCE_DUE = 'maintenance_due', _('Maintenance Due')
    SUBSCRIPTION_RENEWAL = 'subscription_renewal', _('Subscription Renewal')
    SYSTEM_MESSAGE = 'system_message', _('System Message')
    PROMOTION = 'promotion', _('Promotional Offer')


class PoolType(models.TextChoices):
    """Types of pools"""
    INGROUND = 'inground', _('In-Ground Pool')
    ABOVE_GROUND = 'above_ground', _('Above Ground Pool')
    INFINITY = 'infinity', _('Infinity Pool')
    LAP = 'lap', _('Lap Pool')
    PLUNGE = 'plunge', _('Plunge Pool')
    SPA = 'spa', _('Spa/Hot Tub')
    COMBO = 'combo', _('Pool & Spa Combo')
    NATURAL = 'natural', _('Natural Pool')
    SALTWATER = 'saltwater', _('Saltwater Pool')
    CHLORINE = 'chlorine', _('Chlorine Pool')


class PoolSize(models.TextChoices):
    """Pool size categories"""
    SMALL = 'small', _('Small (< 15,000 gallons)')
    MEDIUM = 'medium', _('Medium (15,000 - 30,000 gallons)')
    LARGE = 'large', _('Large (30,000 - 50,000 gallons)')
    EXTRA_LARGE = 'extra_large', _('Extra Large (> 50,000 gallons)')
    COMMERCIAL = 'commercial', _('Commercial Size')


class MaintenancePlanType(models.TextChoices):
    """Types of maintenance plans"""
    BASIC = 'basic', _('Basic Plan')
    STANDARD = 'standard', _('Standard Plan')
    PREMIUM = 'premium', _('Premium Plan')
    CUSTOM = 'custom', _('Custom Plan')
    SEASONAL = 'seasonal', _('Seasonal Plan')


class BillingCycle(models.TextChoices):
    """Billing cycle options"""
    WEEKLY = 'weekly', _('Weekly')
    BIWEEKLY = 'biweekly', _('Bi-Weekly')
    MONTHLY = 'monthly', _('Monthly')
    QUARTERLY = 'quarterly', _('Quarterly')
    SEMI_ANNUAL = 'semi_annual', _('Semi-Annual')
    ANNUAL = 'annual', _('Annual')
    ONE_TIME = 'one_time', _('One-Time')


class EquipmentCategory(models.TextChoices):
    """Equipment categories"""
    PUMP = 'pump', _('Pump')
    FILTER = 'filter', _('Filter')
    HEATER = 'heater', _('Heater')
    CLEANER = 'cleaner', _('Cleaner')
    CHEMICAL = 'chemical', _('Chemical')
    SAFETY = 'safety', _('Safety Equipment')
    LIGHTING = 'lighting', _('Lighting')
    COVER = 'cover', _('Cover')
    ACCESSORY = 'accessory', _('Accessory')
    PART = 'part', _('Replacement Part')
    TOOL = 'tool', _('Service Tool')


class ChemicalType(models.TextChoices):
    """Types of pool chemicals"""
    CHLORINE = 'chlorine', _('Chlorine')
    PH_UP = 'ph_up', _('pH Increaser')
    PH_DOWN = 'ph_down', _('pH Decreaser')
    ALKALINITY = 'alkalinity', _('Alkalinity Increaser')
    CALCIUM = 'calcium', _('Calcium Hardness')
    STABILIZER = 'stabilizer', _('Stabilizer/Conditioner')
    SHOCK = 'shock', _('Shock Treatment')
    ALGAECIDE = 'algaecide', _('Algaecide')
    CLARIFIER = 'clarifier', _('Clarifier')
    SALT = 'salt', _('Pool Salt')


class WeekDay(models.TextChoices):
    """Days of the week"""
    MONDAY = 'monday', _('Monday')
    TUESDAY = 'tuesday', _('Tuesday')
    WEDNESDAY = 'wednesday', _('Wednesday')
    THURSDAY = 'thursday', _('Thursday')
    FRIDAY = 'friday', _('Friday')
    SATURDAY = 'saturday', _('Saturday')
    SUNDAY = 'sunday', _('Sunday')


class Season(models.TextChoices):
    """Seasons for seasonal services"""
    SPRING = 'spring', _('Spring')
    SUMMER = 'summer', _('Summer')
    FALL = 'fall', _('Fall')
    WINTER = 'winter', _('Winter')
    YEAR_ROUND = 'year_round', _('Year Round')


# Business Constants
class BusinessConstants:
    """Business-specific constants"""
    
    # Time slots
    APPOINTMENT_DURATION_CHOICES = [
        (30, '30 minutes'),
        (60, '1 hour'),
        (90, '1.5 hours'),
        (120, '2 hours'),
        (180, '3 hours'),
        (240, '4 hours'),
        (480, '8 hours (Full day)'),
    ]
    
    # Business hours
    DEFAULT_BUSINESS_HOURS = {
        'monday': {'open': '08:00', 'close': '18:00'},
        'tuesday': {'open': '08:00', 'close': '18:00'},
        'wednesday': {'open': '08:00', 'close': '18:00'},
        'thursday': {'open': '08:00', 'close': '18:00'},
        'friday': {'open': '08:00', 'close': '18:00'},
        'saturday': {'open': '09:00', 'close': '16:00'},
        'sunday': {'closed': True},
    }
    
    # Chemical reading ranges (for validation)
    CHEMICAL_RANGES = {
        'ph': {'min': 7.2, 'max': 7.8, 'ideal': 7.5},
        'chlorine': {'min': 1.0, 'max': 3.0, 'ideal': 2.0},  # ppm
        'alkalinity': {'min': 80, 'max': 120, 'ideal': 100},  # ppm
        'calcium_hardness': {'min': 200, 'max': 400, 'ideal': 300},  # ppm
        'cyanuric_acid': {'min': 30, 'max': 50, 'ideal': 40},  # ppm
        'salt': {'min': 2700, 'max': 3400, 'ideal': 3200},  # ppm
        'temperature': {'min': 60, 'max': 104, 'ideal': 82},  # Fahrenheit
    }
    
    # Service radius (miles)
    DEFAULT_SERVICE_RADIUS = 25
    EMERGENCY_SERVICE_RADIUS = 50
    
    # Pricing
    EMERGENCY_SURCHARGE_PERCENT = 50  # 50% surcharge for emergency services
    WEEKEND_SURCHARGE_PERCENT = 20    # 20% surcharge for weekend services
    TRAVEL_FEE_PER_MILE = 2.50       # After service radius
    
    # Notifications
    APPOINTMENT_REMINDER_HOURS = [24, 2]  # Send reminders 24 hours and 2 hours before
    QUOTE_EXPIRY_DAYS = 30
    
    # Limits
    MAX_PROPERTIES_PER_CUSTOMER = 10
    MAX_APPOINTMENTS_PER_DAY = 20
    MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
    
    # Default messages
    DEFAULT_APPOINTMENT_CONFIRMATION = (
        "Your pool service appointment is confirmed for {date} at {time}. "
        "Our technician will arrive within a 30-minute window."
    )
    
    DEFAULT_SERVICE_COMPLETE = (
        "Your pool service has been completed. "
        "Please check your service report for details."
    )
