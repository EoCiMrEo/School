from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction

from .models import Service
from .serializers import ServiceListSerializer


def _broadcast(event_type: str, instance: Service):
    """Broadcast after transaction commit to avoid stale reads on refetch."""
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        def send_event():
            data = {
                "type": event_type,
                "id": str(instance.id),
                "service": ServiceListSerializer(instance, context={"request": None}).data,
            }
            async_to_sync(channel_layer.group_send)(
                "services",
                {"type": "service_event", "data": data},
            )

        # Ensure event is sent after DB commit
        transaction.on_commit(send_event)
    except Exception:
        # Fail silently in dev if channels layer is not configured
        pass


@receiver(post_save, sender=Service)
def on_service_saved(sender, instance: Service, created, **kwargs):
    _broadcast("service.created" if created else "service.updated", instance)


@receiver(post_delete, sender=Service)
def on_service_deleted(sender, instance: Service, **kwargs):
    _broadcast("service.deleted", instance)
