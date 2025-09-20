// api/client.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Safely extract API URL from expo config
const expoApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

if (!expoApiUrl) {
  console.error(
    "❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env"
  );
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
}

// Replace localhost with emulator-safe address for Android
const host =
  Platform.OS === "android" && expoApiUrl.includes("localhost")
    ? expoApiUrl.replace("localhost", "10.0.2.2")
    : expoApiUrl;

// console.log("🌐 Using API Host:", host);

const api = axios.create({
  baseURL: `${host}/api`,
  timeout: 60000,
});

// Use a raw instance (no interceptors) for refreshing
const raw = axios.create({
  baseURL: host,
  timeout: 60000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --- helpers ----------------------------------------------------
const INCLUDES = (url, part) => (url || "").includes(part);

// Routes that never need Authorization header
const NO_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/request-password-reset",
  "/auth/reset-password",
  "/auth/refresh-token", // ⚠️ don't attach/require token here
];

// Routes that should never trigger a refresh attempt on 401
const SKIP_REFRESH_ROUTES = [
  ...NO_AUTH_ROUTES,
  "/users/push-token", // ⚠️ may be called before login; do not try refresh
];

// Request Interceptor
api.interceptors.request.use(async (config) => {
  const url = config.url || "";
  const shouldSkip = NO_AUTH_ROUTES.some((u) => INCLUDES(url, u));

  if (shouldSkip) {
    // console.log("⚠️ Skipping token for unauth route:", url);
    return config;
  }

  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    // console.log("🔐 Attached Bearer token");
  } else {
    // console.warn("⚠️ No token found in AsyncStorage");
  }

  // console.log("➡️ API Request:", config.method?.toUpperCase(), url);
  return config;
});

// Response Interceptor for token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config || {};
    const status = err.response?.status;
    const url = originalRequest?.url || "";

    const shouldSkipRefresh =
      SKIP_REFRESH_ROUTES.some((u) => INCLUDES(url, u)) ||
      originalRequest._retry;

    // Only consider refresh on a 401 when not skipping
    if (status !== 401 || shouldSkipRefresh) {
      return Promise.reject(err);
    }

    // mark so we don't loop
    originalRequest._retry = true;

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        // ❌ No refresh token available; do NOT attempt refresh
        // Just reject with the original error (don’t replace it with a custom one)
        // so callers can handle redirect-to-login gracefully.
        // console.warn("❌ No refresh token available; skipping refresh.");
        return Promise.reject(err);
      }

      // console.log("🔁 Refreshing token…");
      const { data } = await raw.post(
        `/api/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      // Expect { token, refreshToken? }
      if (!data?.token) {
        // console.warn("❌ Refresh response missing token");
        return Promise.reject(err);
      }

      await AsyncStorage.setItem("token", data.token);
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }

      // console.log("✅ Token refresh succeeded");
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.token}`;

      processQueue(null, data.token);
      return api(originalRequest);
    } catch (refreshError) {
      // console.error("❌ Token refresh failed:", refreshError?.response?.data || refreshError.message);
      processQueue(refreshError, null);
      await AsyncStorage.multiRemove(["token", "refreshToken"]);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
