/**
 * Simulates a WebSocket connection for real-time document analysis updates
 */
export class SocketClient {
  private url: string;
  private connected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    console.log(`[Socket] Connecting to ${this.url}...`);
    this.connected = true;
  }

  disconnect() {
    console.log(`[Socket] Disconnected from ${this.url}.`);
    this.connected = false;
  }
  
  isConnected() {
    return this.connected;
  }
}

export const socket = new SocketClient('ws://localhost:5000');
