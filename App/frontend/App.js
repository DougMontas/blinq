import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
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
import { loadSession } from "./utils/sessionManager";
import MyAccountCustomer from "./screens/MyAccountCustomer";
import RequestPasswordResetScreen from "./components/RequestPasswordResetScreen";
import ResetPasswordLost from "./screens/ResetPasswordLost";
import Home from "./screens/Home";
import HomeCustomer from "./screens/HomeCustomer";
import HomeServicePro from "./screens/HomeServicePro";
import LandingPage from "./screens/LandingPage";
import TestMapScreen from "./screens/TestMapScreen";
import "./i18n";
// import { I18nextProvider } from 'react-i18next';

// ✅ shared AuthProvider + navigationRef
import AuthProvider, { useAuth, navigationRef } from "./context/AuthProvider";
// ✅ your configured Axios instance
import api from "./api/client";

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

// Map role -> dashboard route
function roleToDashboard(role) {
  const r = (role || "").toLowerCase();
  if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
  if (r === "admin") return "AdminDashboard";
  return "CustomerDashboard";
}

// Push decoded role into AuthContext once at boot
function RoleInitializer({ initialRole }) {
  const { setRole } = useAuth();
  useEffect(() => {
    if (initialRole) setRole(initialRole);
  }, [initialRole, setRole]);
  return null;
}

// 🔒 Globally catch "job not found" and send user to the right dashboard
function Job404Redirector() {
  const { role } = useAuth();

  useEffect(() => {
    // install interceptor
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        const method = err?.config?.method?.toLowerCase?.();
        const url = String(err?.config?.url || "");

        // Only for GET /jobs/:id style 404s (not for /jobs/provider/active, etc.)
        const isJobById404 =
          status === 404 &&
          method === "get" &&
          /\/jobs\/[a-f0-9]{24}([/?#]|$)/i.test(url);

        if (isJobById404 && navigationRef.isReady()) {
          const target = roleToDashboard(role);
          const current = navigationRef.getCurrentRoute();
          if (!current || current.name !== target) {
            navigationRef.reset({ index: 0, routes: [{ name: target }] });
          }
        }
        return Promise.reject(err);
      }
    );

    // cleanup interceptor on unmount or role change
    return () => api.interceptors.response.eject(id);
  }, [role]);

  return null;
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [bootRole, setBootRole] = useState(null);

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
          const decodedRole = decoded?.role || null;
          setBootRole(decodedRole);
          // console.log("🔓 JWT decoded:", {
          //   role: decodedRole,
          //   payloadKeys: Object.keys(decoded || {}),
          // });

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

  // Request notification permissions
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

  // Android channels (includes custom sound channel)
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            sound: "notification",
            vibrationPattern: [0, 300, 200, 300],
            enableVibrate: true,
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          });

          await Notifications.setNotificationChannelAsync("job-invites-v2", {
            name: "Job Invitations",
            importance: Notifications.AndroidImportance.MAX,
            sound: "notification", // maps to assets/notification.mp3 (no extension)
            vibrationPattern: [0, 300, 200, 300],
            enableVibrate: true,
            bypassDnd: true,
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

  /** ──────────────────────────────────────────────────────────────
   * Notification listeners (received + tap → ALWAYS ProviderInvitation)
   * ────────────────────────────────────────────────────────────── */
  const handledPushTapRef = useRef(false);

  useEffect(() => {
    // Log foreground deliveries
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📲 Push notification received:", {
          title: notification?.request?.content?.title,
          data: notification?.request?.content?.data,
        });
      }
    );

    const navToInvitation = (jobId, data) => {
      const params = {
        jobId: String(jobId),
        invitationExpiresAt: data?.expiresAt ?? null,
        clickable: true,
        from: "push",
      };

      const tryNav = () => {
        if (!navigationRef.isReady()) {
          // nav container not ready yet (e.g., cold start); retry shortly
          setTimeout(tryNav, 50);
          return;
        }
        console.log("🧭 Navigate → ProviderInvitation", params);
        navigationRef.current?.navigate("ProviderInvitation", params);
        // If you prefer a hard landing:
        // navigationRef.reset({ index: 0, routes: [{ name: "ProviderInvitation", params }] });
      };

      tryNav();
    };

    const handleTap = (response) => {
      try {
        const data = response?.notification?.request?.content?.data || {};
        const jobId =
          data?.jobId || data?.job_id || data?.id || data?.payload?.jobId;

        if (!jobId) {
          console.log("📬 Push tapped without jobId; ignoring.");
          return;
        }

        // Avoid duplicate fires on Android (initial + listener)
        if (handledPushTapRef.current) {
          console.log("🔁 Push tap already handled; skipping duplicate.");
          return;
        }
        handledPushTapRef.current = true;
        setTimeout(() => (handledPushTapRef.current = false), 1200);

        navToInvitation(jobId, data);
      } catch (e) {
        console.warn("⚠️ Notification tap handler error:", e);
      }
    };

    // Handle cold start (app launched by tapping a notification)
    (async () => {
      try {
        const initial = await Notifications.getLastNotificationResponseAsync();
        if (initial) {
          console.log("🚪 App opened from notification tap (cold start).");
          handleTap(initial);
        }
      } catch {}
    })();

    // Handle taps while app is in foreground/background
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(handleTap);

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

  console.log("🚀 Initial route:", initialRoute, "bootRole:", bootRole);

  return (
    // <I18nextProvider>
    <StripeProvider
      publishableKey={stripeKey}
      urlScheme="blinqfix"
      merchantIdentifier="merchant.com.blinqfix"
    >
      <SafeAreaProvider>
        <AuthProvider>
          {/* Push the decoded role into context once on boot */}
          <RoleInitializer initialRole={bootRole} />
          {/* Install global 404 -> dashboard redirect */}
          <Job404Redirector />

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

              <Stack.Screen name="Registration" component={RegistrationScreen} />
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
              <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
              <Stack.Screen name="RateProvider" component={RateProvider} />
              <Stack.Screen
                name="MyAccountCustomer"
                component={MyAccountCustomer}
              />
              <Stack.Screen name="TestMapScreen" component={TestMapScreen} />
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
              <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
              <Stack.Screen
                name="NotFound"
                component={NotFoundScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </StripeProvider>
    // </I18nextProvider>
  );
}
