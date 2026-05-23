"""
URL configuration for Appointments app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, RecurringAppointmentViewSet

# Create router
router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'recurring-appointments', RecurringAppointmentViewSet, basename='recurring-appointment')

app_name = 'appointments'

urlpatterns = [
    path('', include(router.urls)),
]
