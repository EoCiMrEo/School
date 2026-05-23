"""
Utility functions for Poolcrest backend.
Common helper functions used across multiple apps.
"""

import random
import string
import hashlib
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re


def generate_unique_code(prefix='', length=8):
    """
    Generate a unique code with optional prefix.
    
    Args:
        prefix: String prefix for the code
        length: Length of the random part
    
    Returns:
        String like 'QTE-ABC12345' or 'ABC12345'
    """
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choice(chars) for _ in range(length))
    
    if prefix:
        return f"{prefix}-{code}"
    return code


def generate_invoice_number():
    """Generate a unique invoice number"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = ''.join(random.choice(string.digits) for _ in range(4))
    return f"INV-{timestamp}-{random_part}"


def generate_quote_number():
    """Generate a unique quote number"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = ''.join(random.choice(string.digits) for _ in range(4))
    return f"QTE-{timestamp}-{random_part}"


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates in miles.
    Uses Haversine formula.
    
    Args:
        lat1, lon1: First coordinate
        lat2, lon2: Second coordinate
    
    Returns:
        Distance in miles
    """
    from math import radians, sin, cos, sqrt, atan2
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    # Radius of Earth in miles
    r = 3956
    
    return r * c


def format_phone_number(phone):
    """
    Format phone number to a standard format.
    
    Args:
        phone: Phone number string
    
    Returns:
        Formatted phone number like '(555) 123-4567'
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Check if it's a valid US phone number
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    else:
        return phone  # Return original if can't format


def validate_phone_number(phone):
    """
    Validate phone number format.
    
    Args:
        phone: Phone number to validate
    
    Raises:
        ValidationError if invalid
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Check if it's a valid phone number (10 or 11 digits for US)
    if not (len(digits) == 10 or (len(digits) == 11 and digits[0] == '1')):
        raise ValidationError("Invalid phone number format")


def validate_zip_code(zip_code):
    """
    Validate US ZIP code format.
    
    Args:
        zip_code: ZIP code to validate
    
    Raises:
        ValidationError if invalid
    """
    # Match 5 digits or 5 digits + 4
    pattern = r'^\d{5}(-\d{4})?$'
    if not re.match(pattern, zip_code):
        raise ValidationError("Invalid ZIP code format")


def calculate_tax(amount, tax_rate):
    """
    Calculate tax amount.
    
    Args:
        amount: Base amount (Decimal or float)
        tax_rate: Tax rate as decimal (e.g., 0.075 for 7.5%)
    
    Returns:
        Tax amount as Decimal
    """
    amount = Decimal(str(amount))
    tax_rate = Decimal(str(tax_rate))
    return (amount * tax_rate).quantize(Decimal('0.01'))


def calculate_total_with_tax(amount, tax_rate):
    """
    Calculate total amount including tax.
    
    Args:
        amount: Base amount
        tax_rate: Tax rate as decimal
    
    Returns:
        Total amount as Decimal
    """
    amount = Decimal(str(amount))
    tax = calculate_tax(amount, tax_rate)
    return amount + tax


def round_to_nearest_interval(dt, interval_minutes=15):
    """
    Round datetime to nearest interval.
    
    Args:
        dt: Datetime object
        interval_minutes: Interval in minutes (default 15)
    
    Returns:
        Rounded datetime
    """
    # Convert to minutes since midnight
    minutes = dt.hour * 60 + dt.minute
    
    # Round to nearest interval
    rounded_minutes = round(minutes / interval_minutes) * interval_minutes
    
    # Convert back to hours and minutes
    hours = rounded_minutes // 60
    minutes = rounded_minutes % 60
    
    # Handle day overflow
    if hours >= 24:
        return dt.replace(hour=23, minute=45, second=0, microsecond=0)
    
    return dt.replace(hour=hours, minute=minutes, second=0, microsecond=0)


def get_next_business_day(date=None):
    """
    Get the next business day (Monday-Friday).
    
    Args:
        date: Starting date (default: today)
    
    Returns:
        Next business day as date object
    """
    if date is None:
        date = timezone.now().date()
    
    # If it's Friday, skip to Monday
    if date.weekday() == 4:  # Friday
        return date + timedelta(days=3)
    # If it's Saturday, skip to Monday
    elif date.weekday() == 5:  # Saturday
        return date + timedelta(days=2)
    # Otherwise, next day
    else:
        return date + timedelta(days=1)


def is_business_hours(dt=None):
    """
    Check if datetime is within business hours.
    Default: Monday-Friday 8am-6pm, Saturday 9am-4pm
    
    Args:
        dt: Datetime to check (default: now)
    
    Returns:
        Boolean
    """
    if dt is None:
        dt = timezone.now()
    
    weekday = dt.weekday()
    hour = dt.hour
    
    # Monday-Friday: 8am-6pm
    if weekday < 5:  # 0-4 are Monday-Friday
        return 8 <= hour < 18
    # Saturday: 9am-4pm
    elif weekday == 5:
        return 9 <= hour < 16
    # Sunday: Closed
    else:
        return False


def mask_sensitive_data(data, mask_char='*', visible_chars=4):
    """
    Mask sensitive data like credit card numbers.
    
    Args:
        data: String to mask
        mask_char: Character to use for masking
        visible_chars: Number of characters to leave visible at the end
    
    Returns:
        Masked string like '****1234'
    """
    if not data or len(data) <= visible_chars:
        return data
    
    masked_length = len(data) - visible_chars
    return mask_char * masked_length + data[-visible_chars:]


def calculate_age(birth_date):
    """
    Calculate age from birth date.
    
    Args:
        birth_date: Date of birth
    
    Returns:
        Age in years
    """
    today = timezone.now().date()
    age = today.year - birth_date.year
    
    # Check if birthday has occurred this year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    
    return age


def parse_time_string(time_str):
    """
    Parse time string in various formats.
    
    Args:
        time_str: Time string like '14:30', '2:30 PM', '1430'
    
    Returns:
        datetime.time object
    """
    # Try different formats
    formats = [
        '%H:%M',      # 24-hour format: 14:30
        '%I:%M %p',   # 12-hour with AM/PM: 2:30 PM
        '%H%M',       # 24-hour without colon: 1430
        '%I:%M%p',    # 12-hour with AM/PM no space: 2:30PM
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(time_str.upper(), fmt)
            return dt.time()
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse time string: {time_str}")


def get_season(date=None):
    """
    Get the season for a given date.
    
    Args:
        date: Date to check (default: today)
    
    Returns:
        Season string ('spring', 'summer', 'fall', 'winter')
    """
    if date is None:
        date = timezone.now().date()
    
    month = date.month
    
    if month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    elif month in [9, 10, 11]:
        return 'fall'
    else:
        return 'winter'


def sanitize_filename(filename):
    """
    Sanitize filename for safe storage.
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = filename.replace('/', '').replace('\\', '')
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Remove special characters except dots and underscores
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    # Limit length
    name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
    if len(name) > 100:
        name = name[:100]
    
    return f"{name}.{ext}" if ext else name


def generate_file_hash(file_content):
    """
    Generate SHA256 hash of file content.
    
    Args:
        file_content: File content as bytes
    
    Returns:
        SHA256 hash string
    """
    return hashlib.sha256(file_content).hexdigest()


def format_currency(amount, currency='USD'):
    """
    Format amount as currency string.
    
    Args:
        amount: Amount to format
        currency: Currency code (default: USD)
    
    Returns:
        Formatted string like '$123.45'
    """
    amount = Decimal(str(amount)).quantize(Decimal('0.01'))
    
    if currency == 'USD':
        return f"${amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def get_client_ip(request):
    """
    Get client IP address from request.
    
    Args:
        request: Django request object
    
    Returns:
        IP address string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def chunk_list(lst, chunk_size):
    """
    Split a list into chunks of specified size.
    
    Args:
        lst: List to chunk
        chunk_size: Size of each chunk
    
    Yields:
        Chunks of the list
    """
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


def get_week_range(date=None):
    """
    Get the start and end dates of the week containing the given date.
    
    Args:
        date: Date to check (default: today)
    
    Returns:
        Tuple of (start_date, end_date)
    """
    if date is None:
        date = timezone.now().date()
    
    # Get Monday of this week
    start = date - timedelta(days=date.weekday())
    # Get Sunday of this week
    end = start + timedelta(days=6)
    
    return start, end


def get_month_range(date=None):
    """
    Get the start and end dates of the month containing the given date.
    
    Args:
        date: Date to check (default: today)
    
    Returns:
        Tuple of (start_date, end_date)
    """
    if date is None:
        date = timezone.now().date()
    
    # First day of the month
    start = date.replace(day=1)
    
    # Last day of the month
    if date.month == 12:
        end = date.replace(year=date.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        end = date.replace(month=date.month + 1, day=1) - timedelta(days=1)
    
    return start, end


class TimeSlot:
    """Helper class for managing time slots"""
    
    def __init__(self, start_time, end_time):
        self.start_time = start_time
        self.end_time = end_time
    
    def overlaps_with(self, other):
        """Check if this time slot overlaps with another"""
        return (
            self.start_time < other.end_time and
            self.end_time > other.start_time
        )
    
    def contains(self, time):
        """Check if a time falls within this slot"""
        return self.start_time <= time <= self.end_time
    
    @property
    def duration(self):
        """Get duration of this time slot"""
        return self.end_time - self.start_time
    
    def __str__(self):
        return f"{self.start_time} - {self.end_time}"
