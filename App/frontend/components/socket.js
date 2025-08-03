// src/socket.js
import { io } from "socket.io-client";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig.extra.apiUrl?.replace(/\/api(?:\/.*)?$/, "") || "";

export const socket = io(API_URL, {
  transports: ["websocket"],
});

export default socket;
