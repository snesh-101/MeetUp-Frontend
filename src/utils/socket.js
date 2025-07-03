// utils/socket.js
import io from "socket.io-client";
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
  if (location.hostname === "localhost") {
    return io(BASE_URL); // Local dev, full support
  } else {
    return io(BASE_URL, {
      path: "/api/socket.io",
      transports: ['polling'], // ✅ Use polling for Render
      withCredentials: true
    });
  }
};
