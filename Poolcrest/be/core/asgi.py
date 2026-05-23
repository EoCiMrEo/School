"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from channels.auth import AuthMiddlewareStack
from channels.generic.websocket import AsyncJsonWebsocketConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

# Lazy import to avoid app registry issues
try:
    from apps.services.consumers import ServiceUpdatesConsumer
    from apps.quotes.consumers import PromotionUpdatesConsumer
    websocket_urlpatterns = [
        path("ws/services/", ServiceUpdatesConsumer.as_asgi()),
        path("ws/promotions/", PromotionUpdatesConsumer.as_asgi()),
    ]
except Exception:
	websocket_urlpatterns = []

class ServiceUpdatesConsumer(AsyncJsonWebsocketConsumer):
    group_name = "services"

    async def connect(self):
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def service_event(self, event):
        # Relay event to client
        await self.send_json(event.get("data", {}))

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
})
