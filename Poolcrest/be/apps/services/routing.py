from django.urls import path
from .consumers import ServiceUpdatesConsumer

websocket_urlpatterns = [
    path("ws/services/", ServiceUpdatesConsumer.as_asgi()),
]
