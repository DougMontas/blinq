// import React from "react";
// import { View, StyleSheet, ActivityIndicator } from "react-native";
// import { WebView } from "react-native-webview";

// export default function WebViewScreen({ route }) {
//   const { uri } = route.params;

//   return (
//     <View style={styles.container}>
//       <WebView source={{ uri }} startInLoadingState renderLoading={() => <ActivityIndicator size="large" />} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// import React from "react";
// import { View, ActivityIndicator, StyleSheet } from "react-native";
// import { WebView } from "react-native-webview";

// export default function WebViewScreen({ route }) {
//   const { uri } = route.params;

//   return (
//     <View style={{ flex: 1 }}>
//       <WebView
//         source={{ uri }}
//         startInLoadingState
//         renderLoading={() => (
//           <View style={styles.loader}>
//             <ActivityIndicator size="large" color="#1976d2" />
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


// screens/WebViewScreen.js - onboarding hybrid
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
