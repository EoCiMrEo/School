from flask import request, session
from flask_socketio import emit, join_room, leave_room, disconnect
import logging
import redis
import time
import os
from config import Config
from auth import validate_token
import json
import requests

logger = logging.getLogger(__name__)

# Initialize Redis client for tracking online users
redis_client = redis.from_url(Config.REDIS_URL)

# Presence TTL (seconds) - extend to tolerate quick navigations/reloads
PRESENCE_TTL = int(os.getenv('PRESENCE_TTL', 20))

def broadcast_online_count(socketio):
    try:
        count = redis_client.scard('online_users')
        socketio.emit('online_users_update', {'count': count})
    except Exception as e:
        logger.error(f"Failed to broadcast online count: {e}")

def register_events(socketio):
    def refresh_presence(user_id):
        try:
            if not user_id:
                return
            key = f"user_presence:{user_id}"
            redis_client.set(key, 1)
            redis_client.expire(key, PRESENCE_TTL)
        except Exception as e:
            logger.error(f"Failed to refresh presence for {user_id}: {e}")

    @socketio.on('connect')
    def on_connect():
        token = request.args.get('token')
        if not token:
            logger.warning("Connection attempt without token")
            disconnect()
            return

        payload = validate_token(token)
        if not payload:
            logger.warning("Connection attempt with invalid token")
            disconnect()
            return
            
        user_id = payload.get('sub') # Assuming 'sub' holds the user UUID
        if not user_id:
            logger.warning("Token payload missing 'sub' (user_id)")
            disconnect()
            return
        # Store user_id in session for compatibility
        session['user_id'] = user_id

        # Record mapping sid -> user and user -> sid set in Redis so we can
        # accurately track multi-tab connections and avoid racey counts on refresh.
        sid = request.sid
        try:
            # Map sid to user
            redis_client.set(f"sid_user:{sid}", user_id)
            redis_client.expire(f"sid_user:{sid}", 3600)

            # Add this sid to user's sid set
            user_sids_key = f"user_sids:{user_id}"
            redis_client.sadd(user_sids_key, sid)

            # If this is the first sid for user, add to online_users set
            if redis_client.scard(user_sids_key) == 1:
                redis_client.sadd('online_users', user_id)

            # Mark presence key (used to detect quick navigation reloads)
            refresh_presence(user_id)

            # Join a room specific to this user for targeted messages
            join_room(user_id)

            broadcast_online_count(socketio)
        except Exception as e:
            logger.error(f"Redis error on connect: {e}")

        logger.info(f"User connected: {user_id} (sid={sid})")
        emit('connection_response', {'status': 'success', 'user_id': user_id, 'sid': sid})

    @socketio.on('disconnect')
    def on_disconnect():
        sid = request.sid
        # Lookup user by sid in Redis (more reliable than session alone)
        try:
            user_id = redis_client.get(f"sid_user:{sid}")
            if user_id:
                # redis-py may return bytes; ensure string
                if isinstance(user_id, bytes):
                    user_id = user_id.decode('utf-8')

                user_sids_key = f"user_sids:{user_id}"

                # Remove this sid from the user's sid set
                redis_client.srem(user_sids_key, sid)
                # Remove the sid->user mapping
                redis_client.delete(f"sid_user:{sid}")

                # Schedule a small delayed finalize to avoid flicker on quick refresh
                def finalize_disconnect(u_id, s_id):
                    try:
                        time.sleep(3)
                        remaining = redis_client.scard(f"user_sids:{u_id}")
                        # If there are still active sids, keep user online
                        if remaining == 0:
                            # Check presence key - clients visiting another page should refresh this key
                            presence_key = f"user_presence:{u_id}"
                            exists = redis_client.exists(presence_key)
                            if not exists:
                                redis_client.srem('online_users', u_id)
                                redis_client.delete(f"user_sids:{u_id}")
                                # Notify matchmaking service (via shared event bus Redis) to
                                # remove the user from any active matchmaking queue. This keeps
                                # queue state consistent when users close the browser or go offline.
                                # Notify matchmaking service directly via HTTP API.
                                try:
                                    matchmaking_url = os.getenv('MATCHMAKING_URL') or Config.FRONTEND_URL
                                    # Prefer Config.MATCHMAKING_URL if available
                                    try:
                                        matchmaking_url = Config.MATCHMAKING_URL
                                    except Exception:
                                        pass

                                    leave_endpoint = f"{matchmaking_url.rstrip('/')}/queue/leave"
                                    resp = requests.post(leave_endpoint, json={"user_id": u_id}, timeout=2)
                                    if resp.status_code in (200, 404):
                                        logger.info(f"Requested matchmaking leave for {u_id} (status={resp.status_code})")
                                    else:
                                        logger.warning(f"Matchmaking leave request for {u_id} returned {resp.status_code}: {resp.text}")
                                except Exception as e:
                                    logger.error(f"Failed to request matchmaking leave for {u_id}: {e}")
                                logger.info(f"User removed from online set after disconnect finalize: {u_id}")
                            else:
                                logger.info(f"User presence key exists; keeping user online: {u_id}")
                        else:
                            logger.info(f"User still has active sids after disconnect finalize: {u_id} (remaining={remaining})")
                    except Exception as e:
                        logger.error(f"Error during finalize_disconnect: {e}")

                # Use socketio background task to avoid blocking event loop
                try:
                    socketio.start_background_task(finalize_disconnect, user_id, sid)
                except Exception:
                    # Fallback: run in-thread if start_background_task not available
                    finalize_disconnect(user_id, sid)

                broadcast_online_count(socketio)
                logger.info(f"User disconnected: {user_id} (sid={sid})")
            else:
                logger.info(f"Client disconnected (unknown sid): {sid}")
        except Exception as e:
            logger.error(f"Redis error on disconnect: {e}")

    @socketio.on('get_online_users')
    def on_get_online_users(data=None):
        # Accept optional `data` arg (some client calls send an empty payload)
        try:
            count = redis_client.scard('online_users')
            # If caller is authenticated, refresh their presence so navigation doesn't remove them
            try:
                sid = request.sid
                uid = redis_client.get(f"sid_user:{sid}")
                if uid:
                    if isinstance(uid, bytes):
                        uid = uid.decode('utf-8')
                    refresh_presence(uid)
            except Exception:
                pass
            emit('online_users_update', {'count': count})
        except Exception as e:
            logger.error(f"Failed to get online users: {e}")

    @socketio.on('presence_ping')
    def on_presence_ping(data=None):
        """Client should call this periodically (every ~10s) while a page/tab is open.
        This keeps the `user_presence` TTL refreshed so quick reloads don't mark user offline.
        """
        try:
            sid = request.sid
            uid = redis_client.get(f"sid_user:{sid}")
            if uid:
                if isinstance(uid, bytes):
                    uid = uid.decode('utf-8')
                refresh_presence(uid)
        except Exception as e:
            logger.error(f"Error handling presence_ping: {e}")

    @socketio.on('join_game')
    def on_join_game(data):
        """
        Client requests to join a specific game room to receive updates.
        """
        game_id = data.get('game_id')
        if game_id:
            join_room(f"game_{game_id}")
            logger.info(f"Client joined game room: game_{game_id}")
            emit('joined_game', {'game_id': game_id})

    @socketio.on('leave_game')
    def on_leave_game(data):
        game_id = data.get('game_id')
        if game_id:
            leave_room(f"game_{game_id}")
            logger.info(f"Client left game room: game_{game_id}")
            emit('left_game', {'game_id': game_id})

    @socketio.on('player_ready')
    def on_player_ready(data):
        """
        Handle player ready status.
        data: { 'game_id': str, 'ready': bool }
        """
        user_id = session.get('user_id')
        if not user_id:
            return

        game_id = data.get('game_id')
        ready_status = data.get('ready', False)

        if not game_id:
            return

        room_name = f"game_{game_id}"
        
        # 1. Broadcast ready status to room (so opponent sees it)
        # Note: 'include_self=False' if we want strictly opponent, but 'broadcast=True' in room hits everyone.
        # It's better to let everyone know so UI stays in sync.
        emit('player_ready_update', {
            'user_id': user_id,
            'ready': ready_status
        }, room=room_name)

        logger.info(f"Player {user_id} is ready: {ready_status} in game {game_id}")

        # 2. Track readiness in Redis to sync start
        redis_key = f"game:{game_id}:ready_players"
        
        if ready_status:
            redis_client.sadd(redis_key, user_id)
            # Set expiry for safety (e.g., 1 hour)
            redis_client.expire(redis_key, 3600)
        else:
            redis_client.srem(redis_key, user_id)

        # 3. Check if both players are ready
        ready_count = redis_client.scard(redis_key)
        
        # Assuming 2 players for TikTacToe
        if ready_count >= 2:
            logger.info(f"Both players ready for game {game_id}. Starting countdown.")
            emit('game_start_countdown', {
                'start_in': 5, # 5 seconds countdown
                'game_id': game_id
            }, room=room_name)
            
            # Optionally clear the ready key or keep it
            redis_client.delete(redis_key)
