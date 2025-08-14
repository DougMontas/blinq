// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// // Safely extract API URL from expo config
// const expoApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
// // const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

// if (!expoApiUrl) {
//   console.error(
//     "❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env"
//   );
//   throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
// }

// // Replace localhost with emulator-safe address for Android
// const host =
//   Platform.OS === "android" && expoApiUrl.includes("localhost")
//     ? expoApiUrl.replace("localhost", "10.0.2.2")
//     : expoApiUrl;

// console.log("🌐 Using API Host:", host);

// const api = axios.create({
//   baseURL: `${host}/api`,
//   timeout: 60000,
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // Request Interceptor
// api.interceptors.request.use(async (config) => {
//   const noAuthNeeded = ["/auth/login", "/auth/register", "/reset-password"];
//   const shouldSkip = noAuthNeeded.some((url) => config.url?.includes(url));

//   if (shouldSkip) {
//     console.log("⚠️ Skipping token for unauth route:", config.url);
//     return config;
//   }

//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//     console.log("🔐 Attached Bearer token");
//   } else {
//     console.warn("⚠️ No token found in AsyncStorage");
//   }

//   console.log("➡️ API Request:", config.method?.toUpperCase(), config.url);
//   return config;
// });

// // Response Interceptor for token refresh
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalRequest = err.config;
//     const skipRefreshFor = ["/auth/login", "/auth/register", "/reset-password"];

//     const isTokenExpired =
//       err.response?.status === 401 &&
//       err.response?.data?.msg?.toLowerCase().includes("jwt expired");

//     if (
//       (isTokenExpired || err.response?.status === 401) &&
//       !originalRequest._retry &&
//       !skipRefreshFor.some((url) => originalRequest.url?.includes(url))
//     ) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then((token) => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         });
//       }

//       isRefreshing = true;

//       try {
//         const refreshToken = await AsyncStorage.getItem("refreshToken");

//         if (!refreshToken) {
//           console.warn("❌ No refresh token available");
//           throw new Error("Missing refresh token");
//         }

//         console.log("🔁 Refreshing token...");

//         const { data } = await axios.post(
//           `${host}/api/auth/refresh-token`,
//           { refreshToken },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         await AsyncStorage.setItem("token", data.token);
//         if (data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", data.refreshToken);
//         }

//         console.log("✅ Token refresh succeeded");

//         originalRequest.headers.Authorization = `Bearer ${data.token}`;
//         processQueue(null, data.token);

//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error(
//           "❌ Token refresh failed:",
//           refreshError?.response?.data || refreshError.message
//         );
//         processQueue(refreshError, null);
//         await AsyncStorage.multiRemove(["token", "refreshToken"]);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(err);
//   }
// );

// export default api;

// api/client.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Safely extract API URL from expo config
const expoApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

if (!expoApiUrl) {
  console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env");
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
}

// Replace localhost with emulator-safe address for Android
const host =
  Platform.OS === "android" && expoApiUrl.includes("localhost")
    ? expoApiUrl.replace("localhost", "10.0.2.2")
    : expoApiUrl;

console.log("🌐 Using API Host:", host);

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
      SKIP_REFRESH_ROUTES.some((u) => INCLUDES(url, u)) || originalRequest._retry;

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


// api/client.js
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import * as Updates from "expo-updates";
// import { Platform } from "react-native";

// // ---- Resolve EXPO_PUBLIC_API_URL across dev/production/EAS ----
// function getExtra() {
//   // SDK 49+: expoConfig in dev, manifest in classic builds, updates.manifest in EAS prod
//   return (
//     Constants.expoConfig?.extra ??
//     Constants.manifest?.extra ??
//     Updates.manifest?.extra ??
//     {}
//   );
// }

// const extra = getExtra();
// const expoApiUrl =
//   extra?.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;

// if (!expoApiUrl || typeof expoApiUrl !== "string") {
//   console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js / env");
//   throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
// }

// // ---- Android emulator/IPv6 localhost handling ----
// let host = expoApiUrl.trim();
// if (Platform.OS === "android") {
//   host = host
//     .replace("http://localhost", "http://10.0.2.2")
//     .replace("https://localhost", "http://10.0.2.2") // avoid TLS to localhost on emulator
//     .replace("http://127.0.0.1", "http://10.0.2.2")
//     .replace("https://127.0.0.1", "http://10.0.2.2")
//     .replace("http://[::1]", "http://10.0.2.2")
//     .replace("https://[::1]", "http://10.0.2.2");
// }
// const base = host.replace(/\/+$/, "");
// console.log("🌐 Using API Host:", base);

// // Main API instance
// const api = axios.create({
//   baseURL: `${base}/api`,
//   timeout: 60000,
// });

// // A raw instance without interceptors (for refresh calls)
// const raw = axios.create({ baseURL: base, timeout: 60000 });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) reject(error);
//     else resolve(token);
//   });
//   failedQueue = [];
// };

// // ---- Request Interceptor ----
// api.interceptors.request.use(async (config) => {
//   const noAuthNeeded = [
//     "/auth/login",
//     "/auth/register",
//     "/auth/request-password-reset",
//     "/auth/reset-password",
//   ];
//   const url = config.url || "";
//   const shouldSkip = noAuthNeeded.some((u) => url.includes(u));
//   if (shouldSkip) return config;

//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ---- Response Interceptor (handles 401 + refresh) ----
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalRequest = err.config || {};
//     const status = err.response?.status;
//     const url = originalRequest?.url || "";

//     const skipRefreshFor = [
//       "/auth/login",
//       "/auth/register",
//       "/auth/request-password-reset",
//       "/auth/reset-password",
//     ];

//     const shouldAttemptRefresh =
//       status === 401 &&
//       !originalRequest._retry &&
//       !skipRefreshFor.some((u) => url.includes(u));

//     if (!shouldAttemptRefresh) {
//       return Promise.reject(err);
//     }

//     originalRequest._retry = true;

//     if (isRefreshing) {
//       // Queue until the in-flight refresh finishes
//       return new Promise((resolve, reject) => {
//         failedQueue.push({ resolve, reject });
//       }).then((newToken) => {
//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       });
//     }

//     isRefreshing = true;

//     try {
//       const refreshToken = await AsyncStorage.getItem("refreshToken");
//       if (!refreshToken) throw new Error("Missing refresh token");

//       const { data } = await raw.post(
//         "/api/auth/refresh-token",
//         { refreshToken },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (!data?.token) throw new Error("Refresh response missing token");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) await AsyncStorage.setItem("refreshToken", data.refreshToken);

//       processQueue(null, data.token);

//       originalRequest.headers = originalRequest.headers || {};
//       originalRequest.headers.Authorization = `Bearer ${data.token}`;

//       return api(originalRequest);
//     } catch (refreshError) {
//       processQueue(refreshError, null);
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);
//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );

// export default api;





// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// // Safely extract API URL from expo config
// const expoApiUrl =
//   Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
//   Constants.expoConfig?.extra?.apiUrl;

// if (!expoApiUrl) {
//   console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env");
//   throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
// }

// // Replace localhost with emulator-safe address for Android
// const host =
//   Platform.OS === "android" && expoApiUrl.includes("localhost")
//     ? expoApiUrl.replace("localhost", "10.0.2.2")
//     : expoApiUrl;

// // Normalize to avoid double slashes when building baseURL
// const normalizedHost = host.replace(/\/+$/, "");

// console.log("🌐 Using API Host:", normalizedHost);

// const api = axios.create({
//   baseURL: `${normalizedHost}/api`,
//   timeout: 60000,
//   timeoutErrorMessage: "Request timed out",
// });

// // --- refresh queue ---
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// // Heuristic to detect RN FormData (so we don't force a bad Content-Type)
// const isReactNativeFormData = (data) =>
//   data &&
//   typeof data === "object" &&
//   typeof data._parts !== "undefined" &&
//   typeof data.append === "function";

// // Request Interceptor
// api.interceptors.request.use(async (config) => {
//   const noAuthNeeded = [
//     "/auth/login",
//     "/auth/register",
//     "/reset-password",
//     "/auth/refresh-token", // safety: never try to auth-refresh itself
//   ];
//   const shouldSkip = noAuthNeeded.some((url) => config.url?.includes(url));

//   // Helpful defaults
//   config.headers = config.headers || {};
//   config.headers.Accept = config.headers.Accept || "application/json";
//   config.headers["X-Device-Platform"] = Platform.OS;
//   if (Constants.expoConfig?.version) {
//     config.headers["X-App-Version"] = Constants.expoConfig.version;
//   }

//   // Let RN/axios set the multipart boundary by not forcing Content-Type
//   if (isReactNativeFormData(config.data)) {
//     delete config.headers["Content-Type"];
//   }

//   if (shouldSkip) {
//     console.log("⚠️ Skipping token for unauth route:", config.url);
//     return config;
//   }

//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//     // quiet noisy log: comment out if desired
//     console.log("🔐 Attached Bearer token");
//   } else {
//     console.warn("⚠️ No token found in AsyncStorage");
//   }

//   console.log("➡️ API Request:", config.method?.toUpperCase(), config.url);
//   return config;
// });

// // Response Interceptor for token refresh
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalRequest = err.config;

//     // Some backends use 498; also handle generic 401 with "expired"
//     const status = err.response?.status;
//     const msg = (err.response?.data?.msg || err.response?.data?.message || "").toString().toLowerCase();

//     const isTokenExpired =
//       status === 401 ||
//       status === 498 ||
//       msg.includes("jwt expired") ||
//       msg.includes("token expired") ||
//       msg.includes("expired token");

//     const skipRefreshFor = ["/auth/login", "/auth/register", "/reset-password", "/auth/refresh-token"];
//     const shouldSkip = skipRefreshFor.some((url) => originalRequest?.url?.includes(url));

//     if (isTokenExpired && !originalRequest?._retry && !shouldSkip) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         // queue the request until refresh completes
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then((token) => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         });
//       }

//       isRefreshing = true;

//       try {
//         const refreshToken = await AsyncStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           console.warn("❌ No refresh token available");
//           throw new Error("Missing refresh token");
//         }

//         console.log("🔁 Refreshing token...");

//         // Use raw axios here to avoid interceptor recursion
//         const { data } = await axios.post(
//           `${normalizedHost}/api/auth/refresh-token`,
//           { refreshToken },
//           { headers: { "Content-Type": "application/json" }, timeout: 30000 }
//         );

//         // Persist new tokens
//         await AsyncStorage.setItem("token", data.token);
//         if (data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", data.refreshToken);
//         }

//         // Update default Authorization for subsequent calls
//         api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//         console.log("✅ Token refresh succeeded");

//         // Replay queued requests
//         processQueue(null, data.token);

//         // Retry the original request with the new token
//         originalRequest.headers.Authorization = `Bearer ${data.token}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("❌ Token refresh failed:", refreshError?.response?.data || refreshError.message);
//         processQueue(refreshError, null);
//         await AsyncStorage.multiRemove(["token", "refreshToken"]);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(err);
//   }
// );

// export default api;


// // api/client.js
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// /* -----------------------------
//  * Resolve API base URL safely
//  * ----------------------------- */
// const extra =
//   Constants?.expoConfig?.extra ??
//   // older SDK fallback:
//   Constants?.manifest?.extra ??
//   {};

// const expoApiUrl =
//   extra.EXPO_PUBLIC_API_URL ||
//   extra.API_URL ||
//   extra.apiUrl;

// if (!expoApiUrl) {
//   console.error("❌ EXPO_PUBLIC_API_URL/API_URL is not defined in app config/env");
//   throw new Error("Missing EXPO_PUBLIC_API_URL/API_URL in environment configuration");
// }

// // For Android emulator, "localhost" or "127.0.0.1" must be 10.0.2.2
// const fixLocalhostForAndroid = (url) => {
//   if (Platform.OS !== "android") return url;
//   return url
//     .replace("://localhost", "://10.0.2.2")
//     .replace("://127.0.0.1", "://10.0.2.2");
// };

// const host = fixLocalhostForAndroid(expoApiUrl);
// // Remove trailing slashes to avoid baseURL "//"
// const normalizedHost = host.replace(/\/+$/, "");

// console.log("🌐 API Host:", normalizedHost);

// const api = axios.create({
//   baseURL: `${normalizedHost}/api`,
//   timeout: 60000,
//   timeoutErrorMessage: "Request timed out",
// });

// /* -----------------------------
//  * Light utilities
//  * ----------------------------- */
// const now = () => Date.now();
// const newReqId = () => `${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// const isReactNativeFormData = (data) =>
//   data &&
//   typeof data === "object" &&
//   typeof data._parts !== "undefined" &&
//   typeof data.append === "function";

// // Queue for refresh logic
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((p) => {
//     if (error) p.reject(error);
//     else p.resolve(token);
//   });
//   failedQueue = [];
// };

// const pathOf = (url = "") => {
//   try {
//     if (url.startsWith("http")) return new URL(url).pathname;
//     // baseURL + relative URL: just ensure we only return the relative part
//     return url;
//   } catch {
//     return url;
//   }
// };

// /* -----------------------------
//  * REQUEST INTERCEPTOR
//  * ----------------------------- */
// api.interceptors.request.use(async (config) => {
//   try {
//     config.headers = config.headers || {};
//     config.meta = { start: now(), requestId: newReqId() };

//     // Useful debug headers
//     config.headers.Accept = config.headers.Accept || "application/json";
//     config.headers["X-Device-Platform"] = Platform.OS;
//     if (Constants?.expoConfig?.version) {
//       config.headers["X-App-Version"] = Constants.expoConfig.version;
//     }
//     config.headers["X-Request-Id"] = config.meta.requestId;

//     // Allow RN/XHR to set multipart boundary automatically
//     if (isReactNativeFormData(config.data)) {
//       delete config.headers["Content-Type"];
//     }

//     // Routes that never need an auth header
//     const noAuthNeeded = [
//       "/auth/login",
//       "/auth/register",
//       "/reset-password",
//       "/auth/refresh-token",
//     ];
//     const urlPath = pathOf(config.url || "");
//     const skipAuth = noAuthNeeded.some((u) => urlPath.includes(u));

//     if (!skipAuth) {
//       // Attach bearer token from storage
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       } else {
//         console.warn("⚠️ [API] No token found for", urlPath);
//       }
//     } else {
//       console.log("⚠️ [API] Skipping token for unauth route:", urlPath);
//     }

//     // Ask server for SLIM /users/me (no blobs) when it's a simple GET
//     if (
//       config.method?.toLowerCase() === "get" &&
//       /\/users\/me$/.test(urlPath)
//     ) {
//       // Backend should honor this by omitting large inline base64 fields
//       config.headers["X-Users-Me-Mode"] = "slim";
//     }

//     console.log(
//       `➡️  [API ${config.meta.requestId}] ${config.method?.toUpperCase()} ${urlPath}`
//     );

//     return config;
//   } catch (e) {
//     console.log("❌ [API] request interceptor error:", e?.message);
//     return config;
//   }
// });

// /* -----------------------------
//  * RESPONSE INTERCEPTOR
//  * ----------------------------- */
// api.interceptors.response.use(
//   (res) => {
//     try {
//       const { config } = res;
//       const dur = config?.meta?.start ? now() - config.meta.start : null;
//       const urlPath = pathOf(config?.url || "");
//       const method = config?.method?.toUpperCase();
//       // Avoid logging huge bodies; show size hint instead
//       let sizeHint = "";
//       try {
//         const body = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
//         sizeHint = `~${Math.max(0, body?.length || 0).toLocaleString()}B`;
//       } catch {
//         sizeHint = "~n/a";
//       }
//       console.log(
//         `⬅️  [API ${config?.meta?.requestId}] ${method} ${urlPath} → ${res.status} ${dur != null ? dur + "ms" : ""} ${sizeHint}`
//       );
//     } catch (e) {
//       // logging should never crash app
//       console.log("⚠️ [API] response log error:", e?.message);
//     }
//     return res;
//   },
//   async (err) => {
//     const originalRequest = err.config || {};
//     const urlPath = pathOf(originalRequest?.url || "");
//     const method = originalRequest?.method?.toUpperCase();
//     const status = err.response?.status;
//     const serverMsg = err.response?.data?.msg || err.response?.data?.message;
//     const msgLower = String(serverMsg || err.message || "").toLowerCase();

//     try {
//       const dur = originalRequest?.meta?.start ? now() - originalRequest.meta.start : null;
//       console.log(
//         `❌ [API ${originalRequest?.meta?.requestId}] ${method} ${urlPath} → ${status || "ERR"} ${dur != null ? dur + "ms" : ""} ::`,
//         serverMsg || err.message
//       );
//     } catch {}

//     // Token refresh gate
//     const isTokenExpired =
//       status === 401 ||
//       status === 498 ||
//       msgLower.includes("jwt expired") ||
//       msgLower.includes("token expired") ||
//       msgLower.includes("expired token");

//     const skipRefreshFor = [
//       "/auth/login",
//       "/auth/register",
//       "/reset-password",
//       "/auth/refresh-token",
//     ];
//     const shouldSkip = skipRefreshFor.some((u) => urlPath.includes(u));

//     if (isTokenExpired && !originalRequest._retry && !shouldSkip) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         // Queue this request until refresh finishes
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then((token) => {
//           originalRequest.headers = originalRequest.headers || {};
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         });
//       }

//       isRefreshing = true;

//       try {
//         const refreshToken = await AsyncStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           console.warn("❌ [API] No refresh token available");
//           throw new Error("Missing refresh token");
//         }

//         console.log("🔁 [API] Refreshing token…");

//         // Use raw axios here to avoid recursion into this interceptor
//         const { data } = await axios.post(
//           `${normalizedHost}/api/auth/refresh-token`,
//           { refreshToken },
//           {
//             headers: { "Content-Type": "application/json" },
//             timeout: 30000,
//           }
//         );

//         // Persist new tokens
//         await AsyncStorage.setItem("token", data.token);
//         if (data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", data.refreshToken);
//         }

//         // Update default Authorization for subsequent requests
//         api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//         console.log("✅ [API] Token refresh succeeded");

//         // Replay queued requests
//         processQueue(null, data.token);

//         // Retry the original request
//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${data.token}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error(
//           "❌ [API] Token refresh failed:",
//           refreshError?.response?.data || refreshError.message
//         );
//         processQueue(refreshError, null);
//         await AsyncStorage.multiRemove(["token", "refreshToken"]);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // If server returns 413 (payload too large), give a specific hint
//     if (status === 413) {
//       console.warn("⚠️ [API] Payload too large. Consider slimming file or endpoint.");
//     }

//     return Promise.reject(err);
//   }
// );

