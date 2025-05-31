// App.js
//working
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
// import HandymanCategoryScreen from './screens/HandymanCategoryScreen'
// import WebViewScreen from "./screens/WebViewScreen";
// import PrivacyPolicy from "./screens/PrivacyPolicy";
// import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
// import CustomerFAQScreen from "./screens/CustomerFAQScreen";

// // import ServiceProvidersMap from "./screens/ServiceProvidersMap";
// // import JobRouteMap from "./screens/JobRouteMap";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState(null);

//   // load & decode token
//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         try {
//           const { role: r } = jwtDecode(token);
//           setRole(r);
//         } catch {
//           await AsyncStorage.removeItem("token");
//         }
//       }
//       setLoading(false);
//     })();
//   }, []);

//   const { stripeKey } = Constants.expoConfig.extra;

//   return (
//     <AuthContext.Provider value={{ role, setRole }}>
//       <StripeProvider publishableKey={stripeKey}>
//         <NavigationContainer ref={navigationRef}>
//           <Stack.Navigator
//             // while loading=true we start at LoadingScreen, else at Login
//             initialRouteName={loading ? "Loading" : "Login"}
//             screenOptions={{ headerShown: false }}
//           >
//             {/* 1) Splash */}
//             <Stack.Screen name="Loading" component={LoadingScreen} />

//             {/* 2) Public auth */}
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//             <Stack.Screen name="Registration" component={RegistrationScreen} />
//             <Stack.Screen
//               name="ResetPasswordScreen"
//               component={ResetPasswordScreen}
//             />

//             {/* 3) Customer flow */}
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

//             {/* 4) Provider flow */}
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
//             <Stack.Screen
//               name="PrivacyPolicy"
//               component={PrivacyPolicy}
//             />
//             <Stack.Screen
//               name="ServiceProFaqScreen"
//               component={ServiceProFaqScreen}
//             />
//             <Stack.Screen
//               name="ProviderJobStatus"
//               component={ProviderJobStatus}
//             />
//             <Stack.Screen
//               name="WebViewScreen"
//               component={WebViewScreen}
//             />
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

//             {/* 5) Admin */}
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen
//               name="NotFound"
//               component={NotFoundScreen}
//               options={{ headerShown: false }}
//             />
//             {/* <Stack.Screen
//               name="ServiceProvidersMap"
//               component={ServiceProvidersMap}
//               options={{ title: "Nearby Providers" }}
//             />
//             <Stack.Screen
//               name="JobRouteMap"
//               component={JobRouteMap}
//               options={{ title: "Your Provider’s Route" }}
//             /> */}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </StripeProvider>
//     </AuthContext.Provider>
//   );
// }


// App.js
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
// import HandymanCategoryScreen from './screens/HandymanCategoryScreen';
// import WebViewScreen from "./screens/WebViewScreen";
// import PrivacyPolicy from "./screens/PrivacyPolicy";
// import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
// import CustomerFAQScreen from "./screens/CustomerFAQScreen";

// import { saveSession, loadSession } from "./utils/sessionManager";

// export const navigationRef = createNavigationContainerRef();
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// const Stack = createNativeStackNavigator();

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

//   if (!initialRoute) return null;

//   return (
//     <AuthContext.Provider value={{ role, setRole }}>
//       <StripeProvider publishableKey={stripeKey}>
//         <NavigationContainer ref={navigationRef}>
//           <Stack.Navigator
//             initialRouteName={initialRoute}
//             screenOptions={{ headerShown: false }}
//           >
//             <Stack.Screen name="Loading" component={LoadingScreen} />
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
//             <Stack.Screen name="Registration" component={RegistrationScreen} />
//             <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
//             <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
//             <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
//             <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
//             <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
//             <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
//             <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
//             <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
//             <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
//             <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
//             <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
//             <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//             <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
//             <Stack.Screen name="RateProvider" component={RateProvider} />
//             <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
//             <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </StripeProvider>
//     </AuthContext.Provider>
//   );
// }


// App.js
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

// Screens
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
import HandymanCategoryScreen from './screens/HandymanCategoryScreen';
import WebViewScreen from "./screens/WebViewScreen";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import ServiceProFaqScreen from "./screens/ServiceProFaqScreen";
import CustomerFAQScreen from "./screens/CustomerFAQScreen";

import { saveSession, loadSession, clearSession } from "./utils/sessionManager";

export const navigationRef = createNavigationContainerRef();
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const { role: decodedRole } = jwtDecode(token);
          setRole(decodedRole);
          const session = await loadSession();
          if (session?.jobId && decodedRole === "customer") {
            setInitialRoute("CustomerJobStatus");
          } else if (decodedRole === "serviceProvider") {
            setInitialRoute("ServiceProviderDashboard");
          } else {
            setInitialRoute("Login");
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

  const { stripeKey } = Constants.expoConfig.extra;
  const returnURL = "blinqfix://stripe-redirect";

  if (!initialRoute) return null;

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      <StripeProvider publishableKey={stripeKey} urlScheme="blinqfix" merchantIdentifier="merchant.com.blinqfix">
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="HandymanCategoryScreen" component={HandymanCategoryScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
            <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
            <Stack.Screen name="EmergencyForm" component={EmergencyForm} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
            <Stack.Screen name="CustomerJobStatus" component={CustomerJobStatus} />
            <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboard} />
            <Stack.Screen name="ProviderInvitation" component={ProviderInvitation} />
            <Stack.Screen name="ProviderTermsAndAgreement" component={ProviderTermsAndAgreement} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="ServiceProFaqScreen" component={ServiceProFaqScreen} />
            <Stack.Screen name="ProviderJobStatus" component={ProviderJobStatus} />
            <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
            <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
            <Stack.Screen name="RateProvider" component={RateProvider} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
            <Stack.Screen name="CustomerFAQScreen" component={CustomerFAQScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </AuthContext.Provider>
  );
}
