"""
URL configuration for Quotes app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteViewSet, stripe_webhook

# Create router
router = DefaultRouter()
router.register(r'quotes', QuoteViewSet, basename='quote')

app_name = 'quotes'

urlpatterns = [
    path('', include(router.urls)),
    # Stripe webhook endpoint
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
]
