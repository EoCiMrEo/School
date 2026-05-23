"""
URL configuration for Properties app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet,
    PropertyPhotoViewSet,
    PropertyNoteViewSet,
    ServiceAreaViewSet
)

# Create router
router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'property-photos', PropertyPhotoViewSet, basename='property-photo')
router.register(r'property-notes', PropertyNoteViewSet, basename='property-note')
router.register(r'service-areas', ServiceAreaViewSet, basename='service-area')

app_name = 'properties'

urlpatterns = [
    path('', include(router.urls)),
]
