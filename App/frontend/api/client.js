// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// // Pull your API URL from expo.extra (via app.config.js)
// const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

// // On Android emulators, “localhost” should become 10.0.2.2
// const host =
//   expoApiUrl?.includes("localhost") && Platform.OS === "android"
//     ? expoApiUrl.replace("localhost", "10.0.2.2")
//     : expoApiUrl;


//     // if (!expoApiUrl) {
//     //   console.warn("⚠️ API URL is not defined in app.config.js");
//     // }

// // Create an Axios instance pointing at "<host>/api"
// const api = axios.create({
//   baseURL: `${host}/api`,
//   timeout: 15000,
// });

// // Attach the stored JWT to every request if present
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401s gracefully
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       // just log it, but still reject so your login screen can handle it
//       console.warn("Got 401 – not logged in or token expired.");
//     }
//     return Promise.reject(err);
//   }
//   // (err) => {
//   //   if (err.response?.status === 401) {
//   //     console.warn("Got 401 – not logged in or token expired.");
//   //     // Return a resolved promise so callers see `data: null`
//   //     return Promise.resolve({ data: null });
//   //   }
//   //   return Promise.reject(err);
//   // }
// );

// export default api;
//previous
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// // Pull your API URL from expo.extra (via app.config.js)
// const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

// if (!expoApiUrl) {
//   console.warn("⚠️ API URL is not defined in app.config.js");
// }

// const host =
//   expoApiUrl?.includes("localhost") && Platform.OS === "android"
//     ? expoApiUrl.replace("localhost", "10.0.2.2")
//     : expoApiUrl;

// // Create an Axios instance pointing at "<host>/api"
// const api = axios.create({
//   baseURL: `${host}/api`,
//   timeout: 30000, // increased from 15000 to 30000 (30s)
// });

// // console.log("🌐 API baseURL:", `${host}/api`);


// // Attach the stored JWT to every request if present
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");
//   // console.log("🔑 Token being sent:", token); // helpful for debugging
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401s gracefully
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       console.warn("Got 401 – not logged in or token expired.");
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;


// utils/api.js

// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { Platform } from "react-native";

// const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;
// if (!expoApiUrl) {
//   console.warn("⚠️ API URL is not defined in app.config.js");
// }

// const host =
//   expoApiUrl?.includes("localhost") && Platform.OS === "android"
//     ? expoApiUrl.replace("localhost", "10.0.2.2")
//     : expoApiUrl;

// const api = axios.create({
//   baseURL: `${host}/api`,
//   timeout: 30000,
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalRequest = err.config;

//     if (err.response?.status === 401 && !originalRequest._retry) {
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
//         const { data } = await axios.post(`${host}/api/auth/refresh-token`, { refreshToken });

//         await AsyncStorage.setItem("token", data.token);
//         originalRequest.headers.Authorization = `Bearer ${data.token}`;
//         processQueue(null, data.token);

//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         await AsyncStorage.multiRemove(["token", "refreshToken"]);
//         console.warn("❌ Refresh token expired or invalid.");
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

const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;
if (!expoApiUrl) {
  console.warn("⚠️ API URL is not defined in app.config.js");
}

const host =
  expoApiUrl?.includes("localhost") && Platform.OS === "android"
    ? expoApiUrl.replace("localhost", "10.0.2.2")
    : expoApiUrl;

const api = axios.create({
  baseURL: `${host}/api`,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
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
        const { data } = await axios.post(`${host}/api/auth/refresh-token`, { refreshToken });

        await AsyncStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(["token", "refreshToken"]);
        console.warn("❌ Refresh token expired or invalid.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
