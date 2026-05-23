import { io } from "socket.io-client";

// This should point to your WebSocket Gateway
const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:5005";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this._presenceInterval = null;
  }

  connect(token) {
    if (this.socket) {
      if (this.currentToken === token) {
        return this.socket;
      }
      // Token changed, disconnect old socket
      this.disconnect();
    }
    
    if (!token) {
        console.warn("Socket connect called without token");
        return null;
    }

    this.currentToken = token;

    // Pass token in query params as required by Gateway auth
    this.socket = io(SOCKET_URL, {
      query: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
      // Immediately ping presence and start periodic pings
      this._sendPresencePing();
      this._startPresenceInterval();
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
      this._stopPresenceInterval();
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      this.isConnected = false;
      this._stopPresenceInterval();
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (e) {
        console.warn('Error disconnecting socket', e);
      }
      this.socket = null;
      this.isConnected = false;
      this._stopPresenceInterval();
    }
  }

  joinGame(gameId) {
    if (this.socket) {
      this.socket.emit("join_game", { game_id: gameId });
    }
  }

  leaveGame(gameId) {
    if (this.socket) {
      this.socket.emit("leave_game", { game_id: gameId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn("Attempted to emit event without socket connection:", event);
    }
  }

  _sendPresencePing() {
    if (this.socket && this.isConnected) {
      try {
        this.socket.emit('presence_ping');
      } catch (e) {
        console.warn('Failed to send presence_ping', e);
      }
    }
  }

  _startPresenceInterval() {
    // Send presence ping every 10s to keep backend presence TTL refreshed
    this._stopPresenceInterval();
    this._presenceInterval = setInterval(() => {
      this._sendPresencePing();
    }, 10000);
  }

  _stopPresenceInterval() {
    if (this._presenceInterval) {
      clearInterval(this._presenceInterval);
      this._presenceInterval = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
