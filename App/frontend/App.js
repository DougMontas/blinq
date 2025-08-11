// import React, { useEffect, useState, createContext, useContext } from "react";
// import {
//   NavigationContainer,
//   createNavigationContainerRef,
// } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import jwtDecode from "jwt-decode";
// import Constants from "expo-constants";
// import { StripeProvider } from "@stripe/stripe-react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import * as Notifications from "expo-notifications";
// import { ActivityIndicator, View } from "react-native";

// import LoadingScreen from "./screens/LoadingScreen";
// import LoginScreen from "./screens/LoginScreen";
// import RegistrationScreen from "./screens/RegistrationScreen";
// import ResetPasswordScreen from "./screens/ResetPasswordScreen";
// import CustomerDashboard from "./screens/CustomerDashboard";
// import EmergencyForm from "./screens/EmergencyForm";
// import PaymentScreen from "./screens/PaymentScreen";
// import CustomerJobStatus from "./screens/CustomerJobStatus";
// import ServiceProviderDashboard from "./screens/ServiceProviderDashboard";
// import ProviderInvitation from "./screens/ProviderInvitation";
// import ProviderJobStatus from "./screens/ProviderJobStatus";
// import AdminDashboard from "./screens/AdminDashboard";
// import RateProvider from "./screens/RateProvider";
// import ProviderProfile from "./screens/ProviderProfile";
// import TermsAndConditions from "./screens/TermsAndConditions";
// import NotFoundScreen from "./screens/NotFound";
// import ProviderTermsAndAgreement from "./screens/ProviderTermsAndAgreement";
// import HandymanCategoryScreen from "./screens/HandymanCategoryScreen";
// import WebViewScreen from "./screens/WebViewScreen";
// import PrivacyPolicy from "./screens/PrivacyPolicy";
// import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
// import CustomerFAQScreen from "./screens/CustomerFAQScreen";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import MyAccountScreen from "./screens/MyAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountCustomer from "./screens/MyAccountCustomer";
// import RequestPasswordResetScreen from "./components/RequestPasswordResetScreen";
// import ResetPasswordLost from "./screens/ResetPasswordLost"
// import Home from "./screens/Home";
// import HomeCustomer from "./screens/HomeCustomer";
// import HomeServicePro from "./screens/HomeServicePro";
// import LandingPage from "./screens/LandingPage";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: [
//     "blinqfix://",
//     "https://blinqfix.com",
//     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/",
//   ],
//   config: {
//     screens: {
//       Login: "login",
//       Home: "home",
//       RequestPasswordResetScreen: "request-password-reset",
//       // RequestPasswordReset: "request-password-reset",
//       ResetPasswordLost: {
//         path: "reset-password/:token",
//         parse: {
//           token: (token) => token,
//         },
//       },
//     },
//   },
// };

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("token");
//       const session = await loadSession();

//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);

//           if (session?.jobId) {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerJobStatus");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ProviderJobStatus");
//             } else {
//               setInitialRoute("LandingPage");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("LandingPage");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("LandingPage");
//         }
//       } else {
//         setInitialRoute("LandingPage");
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const requestNotificationPermission = async () => {
//       try {
//         const { status } = await Notifications.getPermissionsAsync();
//         if (status !== "granted") {
//           await Notifications.requestPermissionsAsync();
//         }
//       } catch (err) {
//         console.warn("Notification permission request failed:", err);
//       }
//     };
//     requestNotificationPermission();
//   }, []);

//   useEffect(() => {
//     const subscription = Notifications.addNotificationReceivedListener(
//       (notification) => {
//         console.log("📲 Push notification received", notification);
//       }
//     );

//     const responseSubscription =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         const data = response.notification.request.content.data;
//         if (data?.jobId && data?.type === "teaser") {
//           navigationRef.current?.navigate("ProviderInvitation", {
//             jobId: data.jobId,
//           });
//         } else if (data?.jobId) {
//           navigationRef.current?.navigate("ProviderJobStatus", {
//             jobId: data.jobId,
//           });
//         }
//       });

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const stripeKey =
//     Constants?.expoConfig?.extra?.stripeKey ||
//     Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <StripeProvider
//       publishableKey={stripeKey}
//       urlScheme="blinqfix"
//       merchantIdentifier="merchant.com.blinqfix"
//     >
//       <SafeAreaProvider>
//         <AuthContext.Provider value={{ role, setRole }}>
//           <NavigationContainer ref={navigationRef} linking={linking}>
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false, gestureEnabled: false }}
//             >
//               <Stack.Screen name="LandingPage" component={LandingPage} />
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Home" component={Home} />
//               <Stack.Screen name="HomeCustomer" component={HomeCustomer} />
//               <Stack.Screen name="HomeServicePro" component={HomeServicePro} />

//               <Stack.Screen
//                 name="Registration"
//                 component={RegistrationScreen}
//               />
//               <Stack.Screen
//                 name="ResetPasswordScreen"
//                 component={ResetPasswordScreen}
//               />
//               <Stack.Screen
//                 name="RequestPasswordResetScreen"
//                 component={RequestPasswordResetScreen}
//               />
//               <Stack.Screen
//                 name="ResetPasswordLost"
//                 component={ResetPasswordLost}
//               />
//               <Stack.Screen
//                 name="HandymanCategoryScreen"
//                 component={HandymanCategoryScreen}
//               />
//               <Stack.Screen
//                 name="CustomerDashboard"
//                 component={CustomerDashboard}
//               />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen
//                 name="CustomerJobStatus"
//                 component={CustomerJobStatus}
//                 options={{ unmountOnBlur: true }}
//               />
//               <Stack.Screen
//                 name="ServiceProviderDashboard"
//                 component={ServiceProviderDashboard}
//               />
//               <Stack.Screen
//                 name="ProviderInvitation"
//                 component={ProviderInvitation}
//               />
//               <Stack.Screen
//                 name="ProviderTermsAndAgreement"
//                 component={ProviderTermsAndAgreement}
//               />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen
//                 name="ServiceProFaqScreen"
//                 component={ServiceProFaqScreen}
//               />
//               <Stack.Screen
//                 name="ProviderJobStatus"
//                 component={ProviderJobStatus}
//               />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen
//                 name="ProviderProfile"
//                 component={ProviderProfile}
//               />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen
//                 name="MyAccountCustomer"
//                 component={MyAccountCustomer}
//               />
//               <Stack.Screen
//                 name="TermsAndConditions"
//                 component={TermsAndConditions}
//               />
//               <Stack.Screen
//                 name="CustomerFAQScreen"
//                 component={CustomerFAQScreen}
//               />
//               <Stack.Screen
//                 name="DeleteAccountScreen"
//                 component={DeleteAccountScreen}
//               />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen
//                 name="MyAccountScreen"
//                 component={MyAccountScreen}
//               />
//               <Stack.Screen
//                 name="NotFound"
//                 component={NotFoundScreen}
//                 options={{ headerShown: false }}
//               />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </AuthContext.Provider>
//       </SafeAreaProvider>
//     </StripeProvider>
//   );
// }

// import React, { useEffect, useState, createContext, useContext } from "react";
// import {
//   NavigationContainer,
//   createNavigationContainerRef,
// } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import jwtDecode from "jwt-decode";
// import Constants from "expo-constants";
// import { StripeProvider } from "@stripe/stripe-react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import * as Notifications from "expo-notifications";
// import { ActivityIndicator, View, Platform } from "react-native";

// import LoadingScreen from "./screens/LoadingScreen";
// import LoginScreen from "./screens/LoginScreen";
// import RegistrationScreen from "./screens/RegistrationScreen";
// import ResetPasswordScreen from "./screens/ResetPasswordScreen";
// import CustomerDashboard from "./screens/CustomerDashboard";
// import EmergencyForm from "./screens/EmergencyForm";
// import PaymentScreen from "./screens/PaymentScreen";
// import CustomerJobStatus from "./screens/CustomerJobStatus";
// import ServiceProviderDashboard from "./screens/ServiceProviderDashboard";
// import ProviderInvitation from "./screens/ProviderInvitation";
// import ProviderJobStatus from "./screens/ProviderJobStatus";
// import AdminDashboard from "./screens/AdminDashboard";
// import RateProvider from "./screens/RateProvider";
// import ProviderProfile from "./screens/ProviderProfile";
// import TermsAndConditions from "./screens/TermsAndConditions";
// import NotFoundScreen from "./screens/NotFound";
// import ProviderTermsAndAgreement from "./screens/ProviderTermsAndAgreement";
// import HandymanCategoryScreen from "./screens/HandymanCategoryScreen";
// import WebViewScreen from "./screens/WebViewScreen";
// import PrivacyPolicy from "./screens/PrivacyPolicy";
// import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
// import CustomerFAQScreen from "./screens/CustomerFAQScreen";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import MyAccountScreen from "./screens/MyAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountCustomer from "./screens/MyAccountCustomer";
// import RequestPasswordResetScreen from "./components/RequestPasswordResetScreen";
// import ResetPasswordLost from "./screens/ResetPasswordLost";
// import Home from "./screens/Home";
// import HomeCustomer from "./screens/HomeCustomer";
// import HomeServicePro from "./screens/HomeServicePro";
// import LandingPage from "./screens/LandingPage";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: [
//     "blinqfix://",
//     "https://blinqfix.com",
//     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/",
//   ],
//   config: {
//     screens: {
//       Login: "login",
//       Home: "home",
//       RequestPasswordResetScreen: "request-password-reset",
//       ResetPasswordLost: {
//         path: "reset-password/:token",
//         parse: {
//           token: (token) => token,
//         },
//       },
//     },
//   },
// };

// // Foreground handler — keep sound & alert when app is open
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   // Decide initial screen based on token + session
//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("token");
//       const session = await loadSession();

//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);

//           if (session?.jobId) {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerJobStatus");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ProviderJobStatus");
//             } else {
//               setInitialRoute("LandingPage");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("LandingPage");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("LandingPage");
//         }
//       } else {
//         setInitialRoute("LandingPage");
//       }
//     })();
//   }, []);

//   // Request notification permissions (kept from your code)
//   useEffect(() => {
//     const requestNotificationPermission = async () => {
//       try {
//         const { status } = await Notifications.getPermissionsAsync();
//         if (status !== "granted") {
//           await Notifications.requestPermissionsAsync();
//         }
//       } catch (err) {
//         console.warn("Notification permission request failed:", err);
//       }
//     };
//     requestNotificationPermission();
//   }, []);

//   // NEW: Ensure Android channels exist (so sound actually plays on Android 8+)
//   useEffect(() => {
//     (async () => {
//       try {
//         if (Platform.OS === "android") {
//           // Ensure the default channel is loud as well (some pushes may not set channelId)
//           await Notifications.setNotificationChannelAsync("default", {
//             name: "Default",
//             importance: Notifications.AndroidImportance.MAX,
//             sound: "default",
//             vibrationPattern: [0, 300, 200, 300],
//             enableVibrate: true,
//             lockscreenVisibility:
//               Notifications.AndroidNotificationVisibility.PUBLIC,
//           });

//           // Dedicated channel for job invites
//           await Notifications.setNotificationChannelAsync("job-invites", {
//             name: "Job Invitations",
//             importance: Notifications.AndroidImportance.MAX,
//             sound: "default",
//             vibrationPattern: [0, 300, 200, 300],
//             enableVibrate: true,
//             lockscreenVisibility:
//               Notifications.AndroidNotificationVisibility.PUBLIC,
//           });
//         }
//       } catch (e) {
//         console.warn("Failed to create Android channels:", e);
//       }
//     })();
//   }, []);

//   // Notification listeners (received + response)
//   useEffect(() => {
//     const subscription = Notifications.addNotificationReceivedListener(
//       (notification) => {
//         console.log("📲 Push notification received", notification);
//       }
//     );

//     const responseSubscription =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         const data =
//           response?.notification?.request?.content?.data || {};

//         const jobId = data?.jobId;
//         const type = (data?.type || "").toString().toLowerCase();

//         if (!jobId) return;

//         // Treat any "*invitation*" or "teaser" type as an invite
//         const isInvite =
//           type.includes("invitation") || type === "teaser";

//         if (isInvite) {
//           navigationRef.current?.navigate("ProviderInvitation", {
//             jobId,
//             invitationExpiresAt: data?.expiresAt ?? null,
//             clickable: true,
//           });
//         } else {
//           navigationRef.current?.navigate("ProviderJobStatus", { jobId });
//         }
//       });

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const stripeKey =
//     Constants?.expoConfig?.extra?.stripeKey ||
//     Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <StripeProvider
//       publishableKey={stripeKey}
//       urlScheme="blinqfix"
//       merchantIdentifier="merchant.com.blinqfix"
//     >
//       <SafeAreaProvider>
//         <AuthContext.Provider value={{ role, setRole }}>
//           <NavigationContainer ref={navigationRef} linking={linking}>
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false, gestureEnabled: false }}
//             >
//               <Stack.Screen name="LandingPage" component={LandingPage} />
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Home" component={Home} />
//               <Stack.Screen name="HomeCustomer" component={HomeCustomer} />
//               <Stack.Screen name="HomeServicePro" component={HomeServicePro} />

//               <Stack.Screen
//                 name="Registration"
//                 component={RegistrationScreen}
//               />
//               <Stack.Screen
//                 name="ResetPasswordScreen"
//                 component={ResetPasswordScreen}
//               />
//               <Stack.Screen
//                 name="RequestPasswordResetScreen"
//                 component={RequestPasswordResetScreen}
//               />
//               <Stack.Screen
//                 name="ResetPasswordLost"
//                 component={ResetPasswordLost}
//               />
//               <Stack.Screen
//                 name="HandymanCategoryScreen"
//                 component={HandymanCategoryScreen}
//               />
//               <Stack.Screen
//                 name="CustomerDashboard"
//                 component={CustomerDashboard}
//               />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen
//                 name="CustomerJobStatus"
//                 component={CustomerJobStatus}
//                 options={{ unmountOnBlur: true }}
//               />
//               <Stack.Screen
//                 name="ServiceProviderDashboard"
//                 component={ServiceProviderDashboard}
//               />
//               <Stack.Screen
//                 name="ProviderInvitation"
//                 component={ProviderInvitation}
//               />
//               <Stack.Screen
//                 name="ProviderTermsAndAgreement"
//                 component={ProviderTermsAndAgreement}
//               />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen
//                 name="ServiceProFaqScreen"
//                 component={ServiceProFaqScreen}
//               />
//               <Stack.Screen
//                 name="ProviderJobStatus"
//                 component={ProviderJobStatus}
//               />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen
//                 name="ProviderProfile"
//                 component={ProviderProfile}
//               />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen
//                 name="MyAccountCustomer"
//                 component={MyAccountCustomer}
//               />
//               <Stack.Screen
//                 name="TermsAndConditions"
//                 component={TermsAndConditions}
//               />
//               <Stack.Screen
//                 name="CustomerFAQScreen"
//                 component={CustomerFAQScreen}
//               />
//               <Stack.Screen
//                 name="DeleteAccountScreen"
//                 component={DeleteAccountScreen}
//               />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen
//                 name="MyAccountScreen"
//                 component={MyAccountScreen}
//               />
//               <Stack.Screen
//                 name="NotFound"
//                 component={NotFoundScreen}
//                 options={{ headerShown: false }}
//               />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </AuthContext.Provider>
//       </SafeAreaProvider>
//     </StripeProvider>
//   );
// }


import React, { useEffect, useState, createContext, useContext } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import Constants from "expo-constants";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, View, Platform } from "react-native";

import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import CustomerDashboard from "./screens/CustomerDashboard";
import EmergencyForm from "./screens/EmergencyForm";
import PaymentScreen from "./screens/PaymentScreen";
import CustomerJobStatus from "./screens/CustomerJobStatus";
import ServiceProviderDashboard from "./screens/ServiceProviderDashboard";
import ProviderInvitation from "./screens/ProviderInvitation";
import ProviderJobStatus from "./screens/ProviderJobStatus";
import AdminDashboard from "./screens/AdminDashboard";
import RateProvider from "./screens/RateProvider";
import ProviderProfile from "./screens/ProviderProfile";
import TermsAndConditions from "./screens/TermsAndConditions";
import NotFoundScreen from "./screens/NotFound";
import ProviderTermsAndAgreement from "./screens/ProviderTermsAndAgreement";
import HandymanCategoryScreen from "./screens/HandymanCategoryScreen";
import WebViewScreen from "./screens/WebViewScreen";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
import CustomerFAQScreen from "./screens/CustomerFAQScreen";
import DeleteAccountScreen from "./screens/DeleteAccountScreen";
import MyAccountScreen from "./screens/MyAccountScreen";
import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
import MyAccountCustomer from "./screens/MyAccountCustomer";
import RequestPasswordResetScreen from "./components/RequestPasswordResetScreen";
import ResetPasswordLost from "./screens/ResetPasswordLost";
import Home from "./screens/Home";
import HomeCustomer from "./screens/HomeCustomer";
import HomeServicePro from "./screens/HomeServicePro";
import LandingPage from "./screens/LandingPage";

export const navigationRef = createNavigationContainerRef();
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    "blinqfix://",
    "https://blinqfix.com",
    "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/",
  ],
  config: {
    screens: {
      Login: "login",
      Home: "home",
      RequestPasswordResetScreen: "request-password-reset",
      ResetPasswordLost: {
        path: "reset-password/:token",
        parse: { token: (token) => token },
      },
    },
  },
};

// Foreground handler — keep sound & alert when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [role, setRole] = useState(null);

  // Decide initial screen based on token + session
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const session = await loadSession();

      console.log("🟣 App bootstrap:", {
        hasToken: !!token,
        session,
      });

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const decodedRole = decoded?.role;
          setRole(decodedRole);
          console.log("🔓 JWT decoded:", {
            role: decodedRole,
            payloadKeys: Object.keys(decoded || {}),
          });

          if (session?.jobId) {
            if (decodedRole === "customer") {
              setInitialRoute("CustomerJobStatus");
            } else if (decodedRole === "serviceProvider") {
              setInitialRoute("ProviderJobStatus");
            } else {
              setInitialRoute("LandingPage");
            }
          } else {
            if (decodedRole === "customer") {
              setInitialRoute("CustomerDashboard");
            } else if (decodedRole === "serviceProvider") {
              setInitialRoute("ServiceProviderDashboard");
            } else {
              setInitialRoute("LandingPage");
            }
          }
        } catch (e) {
          console.log("❗ Failed to decode JWT, clearing token:", e?.message);
          await AsyncStorage.removeItem("token");
          setInitialRoute("LandingPage");
        }
      } else {
        setInitialRoute("LandingPage");
      }
    })();
  }, []);

  // Request notification permissions (kept from your code)
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        console.log("🔔 Notification permission status:", status);
        if (status !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          console.log("🔔 Notification permission requested ->", req?.status);
        }
      } catch (err) {
        console.warn("Notification permission request failed:", err);
      }
    };
    requestNotificationPermission();
  }, []);

  // Ensure Android channels exist
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
            vibrationPattern: [0, 300, 200, 300],
            enableVibrate: true,
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          await Notifications.setNotificationChannelAsync("job-invites", {
            name: "Job Invitations",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
            vibrationPattern: [0, 300, 200, 300],
            enableVibrate: true,
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          console.log("📣 Android notification channels created/verified.");
        }
      } catch (e) {
        console.warn("Failed to create Android channels:", e);
      }
    })();
  }, []);

  // Notification listeners (received + response)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📲 Push notification received:", {
          title: notification?.request?.content?.title,
          data: notification?.request?.content?.data,
        });
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data =
          response?.notification?.request?.content?.data || {};

        console.log("📬 Notification tapped:", data);

        const jobId = data?.jobId;
        const type = (data?.type || "").toString().toLowerCase();

        if (!jobId) return;

        const isInvite =
          type.includes("invitation") || type === "teaser";

        if (isInvite) {
          console.log("🧭 Navigate: ProviderInvitation", { jobId });
          navigationRef.current?.navigate("ProviderInvitation", {
            jobId,
            invitationExpiresAt: data?.expiresAt ?? null,
            clickable: true,
          });
        } else {
          console.log("🧭 Navigate: ProviderJobStatus", { jobId });
          navigationRef.current?.navigate("ProviderJobStatus", { jobId });
        }
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const stripeKey =
    Constants?.expoConfig?.extra?.stripeKey ||
    Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log("💳 Stripe publishable key present:", !!stripeKey);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  console.log("🚀 Initial route:", initialRoute, "role:", role);

  return (
    <StripeProvider
      publishableKey={stripeKey}
      urlScheme="blinqfix"
      merchantIdentifier="merchant.com.blinqfix"
    >
      <SafeAreaProvider>
        <AuthContext.Provider value={{ role, setRole }}>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false, gestureEnabled: false }}
            >
              <Stack.Screen name="LandingPage" component={LandingPage} />
              <Stack.Screen name="Loading" component={LoadingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="HomeCustomer" component={HomeCustomer} />
              <Stack.Screen name="HomeServicePro" component={HomeServicePro} />

              <Stack.Screen
                name="Registration"
                component={RegistrationScreen}
              />
              <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPasswordScreen}
              />
              <Stack.Screen
                name="RequestPasswordResetScreen"
                component={RequestPasswordResetScreen}
              />
              <Stack.Screen
                name="ResetPasswordLost"
                component={ResetPasswordLost}
              />
              <Stack.Screen
                name="HandymanCategoryScreen"
                component={HandymanCategoryScreen}
              />
              <Stack.Screen
                name="CustomerDashboard"
                component={CustomerDashboard}
              />
              <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
              <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
              <Stack.Screen
                name="CustomerJobStatus"
                component={CustomerJobStatus}
                options={{ unmountOnBlur: true }}
              />
              <Stack.Screen
                name="ServiceProviderDashboard"
                component={ServiceProviderDashboard}
              />
              <Stack.Screen
                name="ProviderInvitation"
                component={ProviderInvitation}
              />
              <Stack.Screen
                name="ProviderTermsAndAgreement"
                component={ProviderTermsAndAgreement}
              />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
              <Stack.Screen
                name="ServiceProFaqScreen"
                component={ServiceProFaqScreen}
              />
              <Stack.Screen
                name="ProviderJobStatus"
                component={ProviderJobStatus}
              />
              <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
              <Stack.Screen
                name="ProviderProfile"
                component={ProviderProfile}
              />
              <Stack.Screen name="RateProvider" component={RateProvider} />
              <Stack.Screen
                name="MyAccountCustomer"
                component={MyAccountCustomer}
              />
              <Stack.Screen
                name="TermsAndConditions"
                component={TermsAndConditions}
              />
              <Stack.Screen
                name="CustomerFAQScreen"
                component={CustomerFAQScreen}
              />
              <Stack.Screen
                name="DeleteAccountScreen"
                component={DeleteAccountScreen}
              />
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
              <Stack.Screen
                name="MyAccountScreen"
                component={MyAccountScreen}
              />
              <Stack.Screen
                name="NotFound"
                component={NotFoundScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}
