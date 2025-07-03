// utils/socket.js
import io from "socket.io-client";
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
  if (location.hostname === "localhost") {
    return io(BASE_URL); // works for local
  } else {
    return io(BASE_URL, { path: "/api/socket.io", transports: ['websocket'], withCredentials: true });
  }
};
