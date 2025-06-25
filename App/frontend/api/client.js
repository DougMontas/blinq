// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// // Safely extract API URL from expo config
// const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

// if (!expoApiUrl) {
//   console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env");
//   throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
// }

// // Replace localhost with emulator-safe address for Android
// const host =
//   expoApiUrl.includes("localhost") && Platform.OS === "android"
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

// // Attach token to each request
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//     console.log("🔐 Attached Bearer token");
//   } else {
//     console.warn("⚠️ No token found in AsyncStorage");
//   }
//   return config;
// });

// // Intercept 401 errors and attempt refresh
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalRequest = err.config;
//     const skipRefreshFor = ["/auth/login", "/auth/register"];

//     if (
//       err.response?.status === 401 &&
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
const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

if (!expoApiUrl) {
  console.error("❌ EXPO_PUBLIC_API_URL is not defined in app.config.js or .env");
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment configuration");
}

// Replace localhost with emulator-safe address for Android
const host =
  expoApiUrl.includes("localhost") && Platform.OS === "android"
    ? expoApiUrl.replace("localhost", "10.0.2.2")
    : expoApiUrl;

console.log("🌐 Using API Host:", host);

const api = axios.create({
  baseURL: `${host}/api`,
  timeout: 60000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach token to each request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 Attached Bearer token");
  } else {
    console.warn("⚠️ No token found in AsyncStorage");
  }
  return config;
});

// Intercept 401 errors and attempt refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const skipRefreshFor = ["/auth/login", "/auth/register", "/auth/refresh-token"];

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefreshFor.some((url) => originalRequest.url?.includes(url))
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
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

        const { data } = await axios.post(
          `${host}/api/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔄 New token set:", data.token);

        await AsyncStorage.setItem("token", data.token);
        if (data.refreshToken) {
          await AsyncStorage.setItem("refreshToken", data.refreshToken);
        }

        console.log("✅ Token refresh succeeded");

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);

        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.response?.data?.msg?.includes("jwt expired")) {
          console.warn("🔑 Access token expired");
        }
        console.error(
          "❌ Token refresh failed:",
          refreshError?.response?.data || refreshError.message
        );
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
