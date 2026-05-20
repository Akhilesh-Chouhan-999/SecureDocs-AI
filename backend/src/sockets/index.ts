import { Server } from "socket.io";
import env from "../config/env.js";

let io: Server | undefined;

/**
 * Configure Socket.io server listeners and CORS policies
 * @param server HTTP/HTTPS server instance
 */
export const initializeSockets = (server: any): Server => {
  io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("system:ready", {
      message: "SecureDocs socket connection established",
      timestamp: new Date().toISOString(),
    });
  });

  return io;
};

/**
 * Broadcast real-time job status updates to all active socket clients
 * @param job Current job record metadata
 */
export const emitJobUpdate = (job: any): void => {
  if (io) {
    io.emit("jobs:update", job);
  }
};

export default {
  initializeSockets,
  emitJobUpdate,
};
