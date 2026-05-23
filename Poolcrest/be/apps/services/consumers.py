from channels.generic.websocket import AsyncJsonWebsocketConsumer


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
