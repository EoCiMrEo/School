from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction

from apps.promotions.models import Promotion
from apps.promotions.serializers import PromotionSerializer


def _broadcast(event_type: str, instance: Promotion):
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        def send_event():
            data = {
                "type": event_type,
                "id": str(instance.id),
                "promotion": PromotionSerializer(instance, context={"request": None}).data,
            }
            async_to_sync(channel_layer.group_send)(
                "promotions",
                {"type": "promotion_event", "data": data},
            )

        transaction.on_commit(send_event)
    except Exception:
        pass


@receiver(post_save, sender=Promotion)
def on_promotion_saved(sender, instance: Promotion, created, **kwargs):
    _broadcast("promotion.created" if created else "promotion.updated", instance)


@receiver(post_delete, sender=Promotion)
def on_promotion_deleted(sender, instance: Promotion, **kwargs):
    _broadcast("promotion.deleted", instance)
