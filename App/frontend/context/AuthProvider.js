// // AuthProvider.js
// import React, { createContext, useContext } from "react";
// import { createNavigationContainerRef } from "@react-navigation/native";

// // 1) a NavigationContainer ref you can import anywhere
// export const navigationRef = createNavigationContainerRef();

// // 2) an auth‐context you can import anywhere
// const AuthContext = createContext({
//   role: null,
//   setRole: () => {},
// });
// export const useAuth = () => useContext(AuthContext);

// export default AuthContext;


// // context/AuthProvider.js working auto logins
// import React, { createContext, useContext, useMemo, useState } from "react";
// import { createNavigationContainerRef } from "@react-navigation/native";

// // 1) a NavigationContainer ref you can import anywhere
// export const navigationRef = createNavigationContainerRef();

// // 2) Auth context + hook
// const AuthContext = createContext({
//   role: null,
//   setRole: () => {},
// });
// export const useAuth = () => useContext(AuthContext);

// // 3) Provider with real state
// export function AuthProvider({ children }) {
//   const [role, setRole] = useState(null);
//   const value = useMemo(() => ({ role, setRole }), [role]);
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// // Default export the Provider so App can wrap it easily
// export default AuthProvider;


// context/AuthProvider.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createNavigationContainerRef } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import { Buffer } from "buffer";

// 1) Navigation ref (keep using it in <NavigationContainer ref={navigationRef} />)
export const navigationRef = createNavigationContainerRef();

// 2) Helpers
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    const jsonPayload = decodeURIComponent(
      binary
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

async function clearSession() {
  await AsyncStorage.multiRemove(["token", "refreshToken", "me"]);
  delete api.defaults.headers.common.Authorization;
}

// 3) Auth context + hook
const AuthContext = createContext({
  role: null,
  setRole: (_r) => {},
  isAuthed: false,
  booting: true,
  logout: async () => {},
  refreshAuth: async () => {},
});
export const useAuth = () => useContext(AuthContext);

// 4) Provider with bootstrapping + logout
export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [isAuthed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);

  // Try to restore a valid session on app start
  const refreshAuth = useCallback(async () => {
    setBooting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setAuthed(false);
        setRole(null);
        return;
      }

      // basic local expiry check
      const payload = parseJwt(token);
      const expMs = payload?.exp ? payload.exp * 1000 : 0;
      if (!expMs || expMs < Date.now()) {
        await clearSession();
        setAuthed(false);
        setRole(null);
        return;
      }

      // set header and verify with backend
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // cheap verification endpoint; use /users/me if you prefer
      await api.get("/users/me/summary");

      // success → mark authed
      setAuthed(true);
      setRole(payload?.role || null);
    } catch {
      // token invalid on server, nuke it
      await clearSession();
      setAuthed(false);
      setRole(null);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Central logout you can call anywhere via useAuth().logout()
  const logout = useCallback(async () => {
    try {
      // Optional: tell backend to invalidate refresh token
      await api.post("/auth/logout").catch(() => {});
    } finally {
      await clearSession();
      setAuthed(false);
      setRole(null);
      if (navigationRef?.isReady?.()) {
        navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    }
  }, []);

  const value = useMemo(
    () => ({ role, setRole, isAuthed, booting, logout, refreshAuth }),
    [role, isAuthed, booting, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
