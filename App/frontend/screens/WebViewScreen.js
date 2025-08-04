// screens/WebViewScreen.js - onboarding hybrid
//latest
import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function WebViewScreen({ route }) {
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#1976d2"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

// screens/WebViewScreen.js - onboarding hybrid
// import React, { useRef } from "react";
// import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
// import { WebView } from "react-native-webview";
// import { useNavigation } from "@react-navigation/native";

// export default function WebViewScreen({ route }) {
//   const { uri } = route.params;
//   const navigation = useNavigation();
//   const shownRef = useRef(false);

//   const handleNavigationStateChange = (navState) => {
//     const currentUrl = navState?.url;

//     if (
//       currentUrl?.includes("/onboarding-success") &&
//       !shownRef.current
//     ) {
//       shownRef.current = true;

//       Alert.alert("✅ Subscription Updated", "Redirecting to Dashboard…");
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "ServiceProviderDashboard" }],
//         });
//       }, 5000);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri }}
//         startInLoadingState
//         renderLoading={() => (
//           <ActivityIndicator
//             style={styles.loader}
//             size="large"
//             color="#1976d2"
//           />
//         )}
//         onNavigationStateChange={handleNavigationStateChange} // ✅ Added
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loader: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -25 }, { translateY: -25 }],
//   },
// });
