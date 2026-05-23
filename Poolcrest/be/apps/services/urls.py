"""
URL configuration for services app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')

app_name = 'services'

urlpatterns = [
    path('', include(router.urls)),
]
