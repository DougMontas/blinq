// AuthProvider.js
import React, { createContext, useContext } from "react";
import { createNavigationContainerRef } from "@react-navigation/native";

// 1) a NavigationContainer ref you can import anywhere
export const navigationRef = createNavigationContainerRef();

// 2) an auth‐context you can import anywhere
const AuthContext = createContext({
  role: null,
  setRole: () => {},
});
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
