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

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Safely extract API URL from expo config
const expoApiUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl;

if (!expoApiUrl) {
  console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env");
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
}

// Replace localhost with emulator-safe address for Android
const host =
  Platform.OS === "android" && expoApiUrl.includes("localhost")
    ? expoApiUrl.replace("localhost", "10.0.2.2")
    : expoApiUrl;

// Normalize to avoid double slashes when building baseURL
const normalizedHost = host.replace(/\/+$/, "");

console.log("🌐 Using API Host:", normalizedHost);

const api = axios.create({
  baseURL: `${normalizedHost}/api`,
  timeout: 60000,
  timeoutErrorMessage: "Request timed out",
});

// --- refresh queue ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Heuristic to detect RN FormData (so we don't force a bad Content-Type)
const isReactNativeFormData = (data) =>
  data &&
  typeof data === "object" &&
  typeof data._parts !== "undefined" &&
  typeof data.append === "function";

// Request Interceptor
api.interceptors.request.use(async (config) => {
  const noAuthNeeded = [
    "/auth/login",
    "/auth/register",
    "/reset-password",
    "/auth/refresh-token", // safety: never try to auth-refresh itself
  ];
  const shouldSkip = noAuthNeeded.some((url) => config.url?.includes(url));

  // Helpful defaults
  config.headers = config.headers || {};
  config.headers.Accept = config.headers.Accept || "application/json";
  config.headers["X-Device-Platform"] = Platform.OS;
  if (Constants.expoConfig?.version) {
    config.headers["X-App-Version"] = Constants.expoConfig.version;
  }

  // Let RN/axios set the multipart boundary by not forcing Content-Type
  if (isReactNativeFormData(config.data)) {
    delete config.headers["Content-Type"];
  }

  if (shouldSkip) {
    console.log("⚠️ Skipping token for unauth route:", config.url);
    return config;
  }

  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // quiet noisy log: comment out if desired
    console.log("🔐 Attached Bearer token");
  } else {
    console.warn("⚠️ No token found in AsyncStorage");
  }

  console.log("➡️ API Request:", config.method?.toUpperCase(), config.url);
  return config;
});

// Response Interceptor for token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Some backends use 498; also handle generic 401 with "expired"
    const status = err.response?.status;
    const msg = (err.response?.data?.msg || err.response?.data?.message || "").toString().toLowerCase();

    const isTokenExpired =
      status === 401 ||
      status === 498 ||
      msg.includes("jwt expired") ||
      msg.includes("token expired") ||
      msg.includes("expired token");

    const skipRefreshFor = ["/auth/login", "/auth/register", "/reset-password", "/auth/refresh-token"];
    const shouldSkip = skipRefreshFor.some((url) => originalRequest?.url?.includes(url));

    if (isTokenExpired && !originalRequest?._retry && !shouldSkip) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.warn("❌ No refresh token available");
          throw new Error("Missing refresh token");
        }

        console.log("🔁 Refreshing token...");

        // Use raw axios here to avoid interceptor recursion
        const { data } = await axios.post(
          `${normalizedHost}/api/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );

        // Persist new tokens
        await AsyncStorage.setItem("token", data.token);
        if (data.refreshToken) {
          await AsyncStorage.setItem("refreshToken", data.refreshToken);
        }

        // Update default Authorization for subsequent calls
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

        console.log("✅ Token refresh succeeded");

        // Replay queued requests
        processQueue(null, data.token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError?.response?.data || refreshError.message);
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(["token", "refreshToken"]);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
