from django.db import models
import uuid

# Create your models here.
class Service(models.Model):

    class PriceUnit(models.TextChoices):
        HOUR = 'hour', 'Per Hour'
        SERVICE = 'service', 'Per Service'
        WEEK = 'week', 'Per Week'
        PROJECT = 'project', 'Per Project'

    class ResponseLevel(models.TextChoices):
        EMERGENCY = 'emergency', 'Emergency'
        ROUTINE = 'routine', 'Routine'
        SEASONAL = 'seasonal', 'Seasonal'

    class Season(models.TextChoices):
        SPRING = 'spring', 'Spring'
        SUMMER = 'summer', 'Summer'
        FALL = 'fall', 'Fall'
        WINTER = 'winter', 'Winter'

    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="Id"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    # e.g. maintenance, cleaning, repair, renovation, seasonal
    category = models.CharField(max_length=50, blank=True, null=True)

    # Pricing & duration
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_unit = models.CharField(
        max_length=20,
        choices=PriceUnit.choices,
        default=PriceUnit.SERVICE,
        help_text="How the base price is shown on the site (e.g. /hour, /service)"
    )
    duration_minutes = models.PositiveIntegerField(default=0, help_text="Estimated onsite duration for scheduling")

    # Visibility & status
    status = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    available_24_7 = models.BooleanField(default=False)

    # Media
    # Increase max_length to accommodate longer filenames/paths set by storage backends
    image = models.ImageField(upload_to='services/', max_length=255, blank=True, null=True)

    # UX/meta
    # Formerly named 'urgency'; renamed for clarity
    response_level = models.CharField(max_length=20, choices=ResponseLevel.choices, blank=True, null=True)
    # Limit to the 4 seasons
    seasonal_availability = models.CharField(
        max_length=10,
        choices=Season.choices,
        blank=True,
        null=True,
        help_text="Season when this service is primarily offered"
    )

    # Ratings & features
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, help_text="Average rating 0.00 - 5.00")
    review_count = models.PositiveIntegerField(default=0)
    features = models.JSONField(default=list, blank=True, help_text="List of bullet features shown in card")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        db_table = 'services'
        
    def __str__(self):
        return self.name
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('service_detail', kwargs={'pk': self.pk})
    
    