import { io, Socket } from "socket.io-client";
import { ENV } from "../config/env";

class RealOrMockSocket {
  private socket: Socket | null = null;
  private listeners: { [event: string]: Function[] } = {};
  public connected = false;

  connect() {
    if (this.socket) return;

    const wsUrl = ENV.WS_URL || "http://localhost:5000";
    console.log(`[WebSocket] Initiating connection to ${wsUrl}...`);

    this.socket = io(wsUrl, {
      autoConnect: true,
      reconnectionAttempts: 3, // Cap retry limits to avoid console flooding when offline
      reconnectionDelay: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("[WebSocket] Connected successfully to server");
      this.trigger("connect");
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("[WebSocket] Disconnected from server:", reason);
      this.trigger("disconnect", reason);
    });

    this.socket.on("connect_error", (error) => {
      this.connected = false;
      console.warn("[WebSocket] Connection error (Backend offline fallback active):", error.message);
      this.trigger("connect_error", error);
    });

    // Register pre-existing event listeners on the socket
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("[WebSocket] Disconnected");
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      if (this.socket && this.listeners[event]) {
        this.listeners[event].forEach((cb) => this.socket?.off(event, cb as any));
      }
      delete this.listeners[event];
    } else if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.log(`[WebSocket Mock/Offline] Emitted event: ${event}`, args);
    }
  }

  private trigger(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }
}

export const socket = new RealOrMockSocket() as any;

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const subscribeToAnalysis = (
  jobId: string,
  callback: (data: any) => void,
) => {
  socket.on(`analysis:${jobId}`, callback);
};

export const unsubscribeFromAnalysis = (jobId: string) => {
  socket.off(`analysis:${jobId}`);
};
