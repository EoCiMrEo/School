from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentHistoryViewSet

router = DefaultRouter()
router.register(r'payments', PaymentHistoryViewSet, basename='payment')

app_name = 'payments'

urlpatterns = [
    path('', include(router.urls)),
]
