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


// context/AuthProvider.js
import React, { createContext, useContext, useMemo, useState } from "react";
import { createNavigationContainerRef } from "@react-navigation/native";

// 1) a NavigationContainer ref you can import anywhere
export const navigationRef = createNavigationContainerRef();

// 2) Auth context + hook
const AuthContext = createContext({
  role: null,
  setRole: () => {},
});
export const useAuth = () => useContext(AuthContext);

// 3) Provider with real state
export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const value = useMemo(() => ({ role, setRole }), [role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default export the Provider so App can wrap it easily
export default AuthProvider;
