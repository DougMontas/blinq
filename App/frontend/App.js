// // App.js
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
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// // Screens
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
// import ProviderMapDashboard from "./components/ProviderMapDashboard"

// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   // useEffect(() => {
//   //   const sendPushToken = async () => {
//   //     const token = await registerForPushNotificationsAsync();
//   //     if (token) {
//   //       await api.post("/users/push-token", { expoPushToken: token });
//   //     }
//   //   };

//   //   if (userIsAuthenticated) {
//   //     sendPushToken();
//   //   }
//   // }, [userIsAuthenticated]);

//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);
//           const session = await loadSession();
//           if (session?.jobId && decodedRole === "customer") {
//             setInitialRoute("CustomerJobStatus");
//           } else if (decodedRole === "serviceProvider") {
//             setInitialRoute("ServiceProviderDashboard");
//           } else {
//             setInitialRoute("Login");
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
//       }
//     })();
//   }, []);

//   const { stripeKey } = Constants.expoConfig.extra;
//   const returnURL = "blinqfix://stripe-redirect";

//   if (!initialRoute) return null;

//   return (
//     <SafeAreaProvider>
//     <AuthContext.Provider value={{ role, setRole }}>
//       <StripeProvider
//         publishableKey={stripeKey}
//         urlScheme="blinqfix"
//         merchantIdentifier="merchant.com.blinqfix"
//       >
//         <NavigationContainer ref={navigationRef}>
//           <Stack.Navigator
//             initialRouteName={initialRoute}
//             screenOptions={{ headerShown: false }}
//           >
//             <Stack.Screen name="Loading" component={LoadingScreen} />
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen
//               name="HandymanCategoryScreen"
//               component={HandymanCategoryScreen}
//             />
//             <Stack.Screen name="Registration" component={RegistrationScreen} />
//             <Stack.Screen
//               name="ResetPasswordScreen"
//               component={ResetPasswordScreen}
//             />
//             <Stack.Screen
//               name="CustomerDashboard"
//               component={CustomerDashboard}
//             />
//             <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//             <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//             <Stack.Screen
//               name="CustomerJobStatus"
//               component={CustomerJobStatus}
//             />
//             <Stack.Screen
//               name="ServiceProviderDashboard"
//               component={ServiceProviderDashboard}
//             />
//             <Stack.Screen
//               name="ProviderInvitation"
//               component={ProviderInvitation}
//             />
//             <Stack.Screen
//               name="ProviderTermsAndAgreement"
//               component={ProviderTermsAndAgreement}
//             />
//             <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//             <Stack.Screen
//               name="ServiceProFaqScreen"
//               component={ServiceProFaqScreen}
//             />
//             <Stack.Screen
//               name="ProviderJobStatus"
//               component={ProviderJobStatus}
//             />
//             <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//             <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//             <Stack.Screen name="RateProvider" component={RateProvider} />
//             <Stack.Screen
//               name="TermsAndConditions"
//               component={TermsAndConditions}
//             />
//             <Stack.Screen
//               name="CustomerFAQScreen"
//               component={CustomerFAQScreen}
//             />
//             <Stack.Screen
//               name="DeleteAccountScreen"
//               component={DeleteAccountScreen}
//             />
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen
//               name="NotFound"
//               component={NotFoundScreen}
//               options={{ headerShown: false }}
//             />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </StripeProvider>
//     </AuthContext.Provider>
//     </SafeAreaProvider>
//   );
// }

// // App.js
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
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// // Screens
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
// import ProviderMapDashboard from "./components/ProviderMapDashboard"

// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// // ✅ Deep Linking Config
// const linking = {
//   prefixes: [
//     "blinqfix://",
//     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
//   ],
//   config: {
//     screens: {
//       ResetPasswordScreen: "reset-password/:token",
//     },
//   },
// };

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);
//           const session = await loadSession();
//           if (session?.jobId && decodedRole === "customer") {
//             setInitialRoute("CustomerJobStatus");
//           } else if (decodedRole === "serviceProvider") {
//             setInitialRoute("ServiceProviderDashboard");
//           } else {
//             setInitialRoute("Login");
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
//       }
//     })();
//   }, []);

//   const { stripeKey } = Constants.expoConfig.extra;
//   const returnURL = "blinqfix://stripe-redirect";

//   if (!initialRoute) return null;

//   return (
//     <SafeAreaProvider>
//       <AuthContext.Provider value={{ role, setRole }}>
//         <StripeProvider
//           publishableKey={stripeKey}
//           urlScheme="blinqfix"
//           merchantIdentifier="merchant.com.blinqfix"
//         >
//           <NavigationContainer ref={navigationRef} linking={linking}>
//           {/* <NavigationContainer> */}
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false }}
//             >
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </StripeProvider>
//       </AuthContext.Provider>
//     </SafeAreaProvider>
//   );
// // }

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
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import * as Notifications from "expo-notifications";

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
// import ProviderMapDashboard from "./components/ProviderMapDashboard";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: [
//     "blinqfix://",
//     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
//   ],
//   config: {
//     screens: {
//       ResetPasswordScreen: "reset-password/:token",
//     },
//   },
// };

// // Set the global notification handler
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
//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);
//           const session = await loadSession();
//           if (session?.jobId && decodedRole === "customer") {
//             setInitialRoute("CustomerJobStatus");
//           } else if (decodedRole === "serviceProvider") {
//             setInitialRoute("ServiceProviderDashboard");
//           } else {
//             setInitialRoute("Login");
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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

//   const { stripeKey } = Constants.expoConfig.extra;
//   if (!initialRoute) return (null);

//   useEffect(() => {
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       console.log("📲 Push notification received in foreground/background", notification);
//     });

//     return () => subscription.remove();
//   }, []);

//   return (
//     <SafeAreaProvider>
//       <AuthContext.Provider value={{ role, setRole }}>
//         <StripeProvider
//           publishableKey={stripeKey}
//           urlScheme="blinqfix"
//           merchantIdentifier="merchant.com.blinqfix"
//         >
//           <NavigationContainer ref={navigationRef} linking={linking}>
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false, gestureEnabled: false, }}
//             >
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </StripeProvider>
//       </AuthContext.Provider>
//     </SafeAreaProvider>
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
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
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
// import ProviderMapDashboard from "./components/ProviderMapDashboard";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: [
//     "blinqfix://",
//     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
//   ],
//   config: {
//     screens: {
//       ResetPasswordScreen: "reset-password/:token",
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
//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);
//           const session = await loadSession();
//           if (session?.jobId && decodedRole === "customer") {
//             setInitialRoute("CustomerJobStatus");
//           } else if (decodedRole === "serviceProvider") {
//             setInitialRoute("ServiceProviderDashboard");
//           } else {
//             setInitialRoute("Login");
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       console.log("📲 Push notification received in foreground/background", notification);
//     });

//     const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
//       const data = response.notification.request.content.data;
//       if (data?.jobId) {
//         navigationRef.current?.navigate("ProviderInvitation", { jobId: data.jobId });
//       }
//     });

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const { stripeKey } = Constants.expoConfig.extra;
//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaProvider>
//       <AuthContext.Provider value={{ role, setRole }}>
//         <StripeProvider
//           publishableKey={stripeKey}
//           urlScheme="blinqfix"
//           merchantIdentifier="merchant.com.blinqfix"
//         >
//           <NavigationContainer ref={navigationRef} linking={linking}>
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false, gestureEnabled: false }}
//             >
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </StripeProvider>
//       </AuthContext.Provider>
//     </SafeAreaProvider>
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
// import * as Device from "expo-device";
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
// import ProviderMapDashboard from "./components/ProviderMapDashboard";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// // const linking = {
// //   prefixes: [
// //     "blinqfix://",
// //     "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
// //   ],
// //   config: {
// //     screens: {
// //       ResetPasswordScreen: "reset-password/:token",
// //     },
// //   },
// // };

// const linking = {
//   prefixes: ['blinqfix://', 'https://blinqfix.com'],
//   config: {
//     screens: {
//       OnboardingComplete: 'onboarding-complete',
//       PasswordResetComplete: 'password-reset-complete',
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
//               setInitialRoute("Login");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("Login");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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
//     const subscription = Notifications.addNotificationReceivedListener(notification => {
//       console.log("📲 Push notification received in foreground/background", notification);
//     });

//     const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
//       const data = response.notification.request.content.data;
//       if (data?.jobId) {
//         navigationRef.current?.navigate("ProviderInvitation", { jobId: data.jobId });
//       }
//     });

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const { stripeKey } = Constants.expoConfig.extra;
//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaProvider>
//       <AuthContext.Provider value={{ role, setRole }}>
//         <StripeProvider
//           publishableKey={stripeKey}
//           urlScheme="blinqfix"
//           merchantIdentifier="merchant.com.blinqfix"
//         >
//           <NavigationContainer ref={navigationRef} linking={linking}>
//             <Stack.Navigator
//               initialRouteName={initialRoute}
//               screenOptions={{ headerShown: false, gestureEnabled: false }}
//             >
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </StripeProvider>
//       </AuthContext.Provider>
//     </SafeAreaProvider>
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
// import * as Device from "expo-device";
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
// import ProviderMapDashboard from "./components/ProviderMapDashboard";
// import DeleteAccountScreen from "./screens/DeleteAccountScreen";
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: ["blinqfix://", "https://blinqfix.com", "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/"],
//   config: {
//     screens: {
//       Login: "onboarding-complete",
//       // PasswordResetComplete: "https://blinqfix.com/onboarding-refresh",
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
//               setInitialRoute("Login");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("Login");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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
//         console.log(
//           "📲 Push notification received in foreground/background",
//           notification
//         );
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

//   const { stripeKey } = Constants.expoConfig.extra;
//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//   <StripeProvider
//     publishableKey={Constants.expoConfig.extra.stripeKey}
//     urlScheme="blinqfix"
//     merchantIdentifier="merchant.com.blinqfix"
//   >
//     <SafeAreaProvider>
//       <AuthContext.Provider value={{ role, setRole }}>
//         <NavigationContainer ref={navigationRef} linking={linking}>
//           <Stack.Navigator
//             initialRouteName={initialRoute}
//             screenOptions={{ headerShown: false, gestureEnabled: false }}
//           >
//             <Stack.Screen name="Loading" component={LoadingScreen} />
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen
//               name="HandymanCategoryScreen"
//               component={HandymanCategoryScreen}
//             />
//             <Stack.Screen name="Registration" component={RegistrationScreen} />
//             <Stack.Screen
//               name="ResetPasswordScreen"
//               component={ResetPasswordScreen}
//             />
//             <Stack.Screen
//               name="CustomerDashboard"
//               component={CustomerDashboard}
//             />
//             <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//             <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//             <Stack.Screen
//               name="CustomerJobStatus"
//               component={CustomerJobStatus}
//             />
//             <Stack.Screen
//               name="ServiceProviderDashboard"
//               component={ServiceProviderDashboard}
//             />
//             <Stack.Screen
//               name="ProviderInvitation"
//               component={ProviderInvitation}
//             />
//             <Stack.Screen
//               name="ProviderTermsAndAgreement"
//               component={ProviderTermsAndAgreement}
//             />
//             <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//             <Stack.Screen
//               name="ServiceProFaqScreen"
//               component={ServiceProFaqScreen}
//             />
//             <Stack.Screen
//               name="ProviderJobStatus"
//               component={ProviderJobStatus}
//             />
//             <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//             <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//             <Stack.Screen name="RateProvider" component={RateProvider} />
//             <Stack.Screen
//               name="TermsAndConditions"
//               component={TermsAndConditions}
//             />
//             <Stack.Screen
//               name="CustomerFAQScreen"
//               component={CustomerFAQScreen}
//             />
//             <Stack.Screen
//               name="DeleteAccountScreen"
//               component={DeleteAccountScreen}
//             />
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//             <Stack.Screen
//               name="NotFound"
//               component={NotFoundScreen}
//               options={{ headerShown: false }}
//             />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </AuthContext.Provider>
//     </SafeAreaProvider>
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
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: ["blinqfix://", "https://blinqfix.com", "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/"],
//   config: {
//     screens: {
//       Login: "onboarding-complete",
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
//               setInitialRoute("Login");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("Login");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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

//     const responseSubscription = Notifications.addNotificationResponseReceivedListener(
//       (response) => {
//         const data = response.notification.request.content.data;
//         if (data?.jobId && data?.type === "teaser") {
//           navigationRef.current?.navigate("ProviderInvitation", { jobId: data.jobId });
//         } else if (data?.jobId) {
//           navigationRef.current?.navigate("ProviderJobStatus", { jobId: data.jobId });
//         }
//       }
//     );

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const stripeKey = Constants?.expoConfig?.extra?.stripeKey || Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
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
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: ["blinqfix://", "https://blinqfix.com", "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/"],
//   config: {
//     screens: {
//       Login: "onboarding-complete",
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
//               setInitialRoute("Login");
//             }
//           } else {
//             if (decodedRole === "customer") {
//               setInitialRoute("CustomerDashboard");
//             } else if (decodedRole === "serviceProvider") {
//               setInitialRoute("ServiceProviderDashboard");
//             } else {
//               setInitialRoute("Login");
//             }
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
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

//     const responseSubscription = Notifications.addNotificationResponseReceivedListener(
//       (response) => {
//         const data = response.notification.request.content.data;
//         if (data?.jobId && data?.type === "teaser") {
//           navigationRef.current?.navigate("ProviderInvitation", { jobId: data.jobId });
//         } else if (data?.jobId) {
//           navigationRef.current?.navigate("ProviderJobStatus", { jobId: data.jobId });
//         }
//       }
//     );

//     return () => {
//       subscription.remove();
//       responseSubscription.remove();
//     };
//   }, []);

//   const stripeKey = Constants?.expoConfig?.extra?.stripeKey || Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
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
import { ActivityIndicator, View } from "react-native";

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
      Login: "onboarding-success",
    },
  },
};

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

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const session = await loadSession();

      if (token) {
        try {
          const { role: decodedRole } = jwtDecode(token);
          setRole(decodedRole);

          if (session?.jobId) {
            if (decodedRole === "customer") {
              setInitialRoute("CustomerJobStatus");
            } else if (decodedRole === "serviceProvider") {
              setInitialRoute("ProviderJobStatus");
            } else {
              setInitialRoute("Login");
            }
          } else {
            if (decodedRole === "customer") {
              setInitialRoute("CustomerDashboard");
            } else if (decodedRole === "serviceProvider") {
              setInitialRoute("ServiceProviderDashboard");
            } else {
              setInitialRoute("Login");
            }
          }
        } catch {
          await AsyncStorage.removeItem("token");
          setInitialRoute("Login");
        }
      } else {
        setInitialRoute("Login");
      }
    })();
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      } catch (err) {
        console.warn("Notification permission request failed:", err);
      }
    };
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📲 Push notification received", notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.jobId && data?.type === "teaser") {
          navigationRef.current?.navigate("ProviderInvitation", {
            jobId: data.jobId,
          });
        } else if (data?.jobId) {
          navigationRef.current?.navigate("ProviderJobStatus", {
            jobId: data.jobId,
          });
        }
      }
    );

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const stripeKey =
    Constants?.expoConfig?.extra?.stripeKey ||
    Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

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
              <Stack.Screen name="Loading" component={LoadingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="HandymanCategoryScreen"
                component={HandymanCategoryScreen}
              />
              <Stack.Screen name="Registration" component={RegistrationScreen} />
              <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPasswordScreen}
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
        </AuthContext.Provider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}

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
// import * as Device from "expo-device";
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
// import { saveSession, loadSession, clearSession } from "./utils/sessionManager";
// import MyAccountScreen from "./screens/MyAccountScreen";
// import api from "./api/client";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// const linking = {
//   prefixes: ["blinqfix://", "https://blinqfix.com", "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/"],
//   config: {
//     screens: {
//       Login: "onboarding-complete",
//       ProviderTermsAndAgreement: "onboarding-success",
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

// async function registerForPushNotificationsAsync() {
//   let token;
//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       alert("Failed to get push token for push notification!");
//       return;
//     }
//     token = (await Notifications.getExpoPushTokenAsync({
//       projectId: Constants.expoConfig.extra.eas?.projectId,
//     })).data;
//     console.log("Expo Push Token:", token);
//     try {
//       await api.post("/users/save-push-token", { token });
//     } catch (error) {
//       console.warn("Failed to send push token to backend", error);
//     }
//   } else {
//     alert("Must use physical device for Push Notifications");
//   }
//   return token;
// }

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     (async () => {
//       await registerForPushNotificationsAsync();
//       const token = await AsyncStorage.getItem("token");
//       const session = await loadSession();

//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);

//           if (session?.jobId) {
//             setInitialRoute(decodedRole === "customer" ? "CustomerJobStatus" : decodedRole === "serviceProvider" ? "ProviderJobStatus" : "Login");
//           } else {
//             setInitialRoute(decodedRole === "customer" ? "CustomerDashboard" : decodedRole === "serviceProvider" ? "ServiceProviderDashboard" : "Login");
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
//       const data = response.notification.request.content.data;
//       if (data?.jobId && data?.type === "jobInvite") {
//         navigationRef.current?.navigate("ProviderInvitation", { jobId: data.jobId });
//       }
//     });
//     return () => responseSubscription.remove();
//   }, []);

//   const stripeKey = Constants?.expoConfig?.extra?.stripeKey || Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
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
// import * as Device from "expo-device";
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
// import api from "./api/client";
// import { saveSession, loadSession } from "./utils/sessionManager";

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
//       Login: "onboarding-complete",
//       ProviderTermsAndAgreement: "onboarding-success",
//     },
//   },
// };

// // 🔔 Ensure notifications show in all app states
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// async function registerForPushNotificationsAsync() {
//   if (!Device.isDevice) {
//     alert("Must use physical device for Push Notifications");
//     return null;
//   }

//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== "granted") {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== "granted") {
//     alert("Failed to get push token for push notification!");
//     return null;
//   }

//   const token = (
//     await Notifications.getExpoPushTokenAsync({
//       projectId: Constants.expoConfig.extra.eas?.projectId,
//     })
//   ).data;

//   console.log("✅ Expo Push Token:", token);

//   try {
//     await api.post("/users/push-token", { token });
//   } catch (err) {
//     console.warn("❌ Failed to send push token to backend:", err);
//   }

//   return token;
// }

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState(null);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     (async () => {
//       await registerForPushNotificationsAsync();
//       const token = await AsyncStorage.getItem("token");
//       const session = await loadSession();

//       if (token) {
//         try {
//           const { role: decodedRole } = jwtDecode(token);
//           setRole(decodedRole);

//           if (session?.jobId) {
//             setInitialRoute(
//               decodedRole === "customer"
//                 ? "CustomerJobStatus"
//                 : decodedRole === "serviceProvider"
//                 ? "ProviderJobStatus"
//                 : "Login"
//             );
//           } else {
//             setInitialRoute(
//               decodedRole === "customer"
//                 ? "CustomerDashboard"
//                 : decodedRole === "serviceProvider"
//                 ? "ServiceProviderDashboard"
//                 : "Login"
//             );
//           }
//         } catch {
//           await AsyncStorage.removeItem("token");
//           setInitialRoute("Login");
//         }
//       } else {
//         setInitialRoute("Login");
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const subscription = Notifications.addNotificationResponseReceivedListener(
//       (response) => {
//         const data = response.notification.request.content.data;
//         if (data?.jobId && data?.type === "jobInvite") {
//           navigationRef.current?.navigate("ProviderInvitation", {
//             jobId: data.jobId,
//           });
//         }
//       }
//     );
//     return () => subscription.remove();
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
//               <Stack.Screen name="Loading" component={LoadingScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//               <Stack.Screen name="Registration" component={RegistrationScreen} />
//               <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//               <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//               <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//               <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//               <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//               <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//               <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//               <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//               <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//               <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//               <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//               <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//               <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//               <Stack.Screen name="RateProvider" component={RateProvider} />
//               <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//               <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//               <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
//               <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//               <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
//               <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </AuthContext.Provider>
//       </SafeAreaProvider>
//     </StripeProvider>
//   );
// }
