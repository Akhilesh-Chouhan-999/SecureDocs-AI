import { io } from "socket.io-client";

import { ENV } from "../config/env";

const WS_URL = ENV.WS_URL;

export const socket = io(WS_URL, {
  autoConnect: false, // Connect manually after login
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") });
  },
});

socket.on("connect", () => console.log("WebSocket Connected"));
socket.on("disconnect", () => console.log("WebSocket Disconnected"));

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
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
