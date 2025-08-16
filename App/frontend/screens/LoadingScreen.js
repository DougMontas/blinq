// // screens/LoadingScreen.js
// import React, { useEffect, useRef } from "react";
// import { View, StyleSheet, Animated, Dimensions } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// export default function LoadingScreen({
//   animationOnly = false,
//   onAnimationEnd,
//   enterDuration = 1200,
//   holdDuration = 1200,
//   exitDuration = 1200,
// }) {
//   const navigation = useNavigation();
//   const scale = useRef(new Animated.Value(0.5)).current;
//   const opacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.sequence([
//       Animated.parallel([
//         Animated.timing(scale, {
//           toValue: 1.1,
//           duration: enterDuration,
//           useNativeDriver: false,
//         }),
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: enterDuration,
//           useNativeDriver: false,
//         }),
//       ]),
//       Animated.delay(holdDuration),
//       Animated.parallel([
//         Animated.timing(scale, {
//           toValue: 0.5,
//           duration: exitDuration,
//           useNativeDriver: false,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0,
//           duration: exitDuration,
//           useNativeDriver: false,
//         }),
//       ]),
//     ]).start(() => {
//       if (animationOnly) {
//         onAnimationEnd?.();
//       } else {
//         navigation.replace("Login");
//       }
//     });
//   }, [
//     animationOnly,
//     enterDuration,
//     exitDuration,
//     holdDuration,
//     navigation,
//     onAnimationEnd,
//     opacity,
//     scale,
//   ]);

//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   return (
//     <View style={styles.container}>
//       <Animated.Image
//         source={require("../assets/blinqfix_logo-new.jpeg")}
//         style={[
//           { width: LOGO_SIZE, height: LOGO_SIZE },
//           { transform: [{ scale }], opacity },
//         ]}
//         resizeMode="contain"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// // });

// import React, { useEffect, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   Text,
//   useWindowDimensions,
//   Image,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Zap } from "lucide-react-native";

// export default function LoadingScreen({
//   animationOnly = false,
//   onAnimationEnd,
//   enterDuration = 1200,
//   holdDuration = 1200,
//   exitDuration = 1200,
// }) {
//   const navigation = useNavigation();
//   const scale = useRef(new Animated.Value(0.5)).current;
//   const opacity = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   // Keep all original animation logic exactly the same
//   useEffect(() => {
//     Animated.sequence([
//       Animated.parallel([
//         Animated.timing(scale, {
//           toValue: 1.1,
//           duration: enterDuration,
//           useNativeDriver: false,
//         }),
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: enterDuration,
//           useNativeDriver: false,
//         }),
//       ]),
//       Animated.delay(holdDuration),
//       Animated.parallel([
//         Animated.timing(scale, {
//           toValue: 0.5,
//           duration: exitDuration,
//           useNativeDriver: false,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0,
//           duration: exitDuration,
//           useNativeDriver: false,
//         }),
//       ]),
//     ]).start(() => {
//       if (animationOnly) {
//         onAnimationEnd?.();
//       } else {
//         navigation.replace("Login");
//       }
//     });
//   }, [
//     animationOnly,
//     enterDuration,
//     exitDuration,
//     holdDuration,
//     navigation,
//     onAnimationEnd,
//     opacity,
//     scale,
//   ]);

//   // Add subtle pulse animation for background elements
//   useEffect(() => {
//     const pulseAnimation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.1,
//           duration: 4000,
//           useNativeDriver: false,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: false,
//         }),
//       ])
//     );
//     pulseAnimation.start();
//     return () => pulseAnimation.stop();
//   }, [pulseAnim]);

//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#1e3a8a", "#312e81"]}
//       style={styles.container}
//     >
//       {/* Animated background elements */}
//       <Animated.View
//         style={[
//           styles.backgroundCircle,
//           styles.backgroundCircle1,
//           { transform: [{ scale: pulseAnim }], opacity: 0.1 },
//         ]}
//       />
//       <Animated.View
//         style={[
//           styles.backgroundCircle,
//           styles.backgroundCircle2,
//           { transform: [{ scale: pulseAnim }], opacity: 0.05 },
//         ]}
//       />

//       {/* Main logo container */}
//       <View style={styles.logoContainer}>
//         <Animated.View
//           style={[styles.logoWrapper, { transform: [{ scale }], opacity }]}
//         >
//           <View style={styles.logoBackground}>
//             <View
//               style={[
//                 styles.logoPlaceholder,
//                 { width: LOGO_SIZE * 0.8, height: LOGO_SIZE * 0.8 },
//               ]}
//             >
//               <Image
//                 source={require("../assets/blinqfix_logo-new.jpeg")}
//                 style={{
//                   width: LOGO_SIZE,
//                   height: LOGO_SIZE,
//                   marginInline: "auto",
//                 }}
//                 resizeMode="contain"
//               />
//             </View>
//           </View>
//         </Animated.View>

//         {/* Brand elements */}
//         <Animated.View style={[styles.brandContainer, { opacity }]}>
//           {/* <View style={styles.iconContainer}>
//             <Zap color="#facc15" size={24} />
//           </View> */}
//           <Text style={styles.brandText}>BlinqFix</Text>
//           <Text style={styles.tagline}>Emergency repairs. Instantly.</Text>
//         </Animated.View>
//       </View>

//       {/* Loading indicator */}
//       <Animated.View style={[styles.loadingContainer, { opacity }]}>
//         <View style={styles.loadingDots}>
//           <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
//           <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
//           <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
//         </View>
//       </Animated.View>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   backgroundCircle: {
//     position: "absolute",
//     borderRadius: 9999,
//   },
//   backgroundCircle1: {
//     width: 400,
//     height: 400,
//     backgroundColor: "#60a5fa",
//     top: "10%",
//     left: "-20%",
//   },
//   backgroundCircle2: {
//     width: 300,
//     height: 300,
//     backgroundColor: "#c084fc",
//     bottom: "15%",
//     right: "-15%",
//   },
//   logoContainer: {
//     // backgroundColor: "rgba(250, 204, 21, 0.2)",
//     // padding: 16,
//     // borderRadius: 99,
//     // marginBottom: 24,
//     // borderWidth: 1,
//     // borderColor: "rgba(250, 204, 21, 0.3)",
//   },
//   // logoWrapper: {
//   //   marginBottom: 40,
//   // },
//   // logoBackground: {
//   //   backgroundColor: "rgba(255,255,255,0.1)",
//   //   borderRadius: 20,
//   //   padding: 20,
//   //   borderWidth: 1,
//   //   borderColor: "rgba(255,255,255,0.2)",
//   //   shadowColor: "#000",
//   //   shadowOffset: { width: 0, height: 10 },
//   //   shadowOpacity: 0.3,
//   //   shadowRadius: 20,
//   //   elevation: 10,
//   // },
//   logoPlaceholder: {
//     // borderRadius: 16,
//     // backgroundColor: "rgba(255,255,255,0.05)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   brandContainer: {
//     alignItems: "center",
//     marginBottom: 60,
//   },
//   // iconContainer: {
//   //   backgroundColor: "rgba(250, 204, 21, 0.2)",
//   //   padding: 12,
//   //   borderRadius: 16,
//   //   marginBottom: 16,
//   //   borderWidth: 1,
//   //   borderColor: "rgba(250, 204, 21, 0.3)",
//   // },
//   brandText: {
//     fontSize: 32,
//     fontWeight: "900",
//     color: "#fff",
//     marginBottom: 8,
//     textShadowColor: "rgba(0,0,0,0.3)",
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   tagline: {
//     fontSize: 16,
//     color: "#e0e7ff",
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   loadingContainer: {
//     position: "absolute",
//     bottom: 100,
//   },
//   loadingDots: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#60a5fa",
//   },
// });


// screens/LoadingScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function LoadingScreen({
  animationOnly = false,
  onAnimationEnd,
  enterDuration = 900,
  holdDuration = 900,
  exitDuration = 900,
}) {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // Size logo based on the shortest side so it looks right in portrait/landscape
  const shortest = Math.min(width, height);
  const LOGO_SIZE = clamp(shortest * 0.5, 160, 320); // 50% of shorter side, clamped

  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: enterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: enterDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(holdDuration),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: exitDuration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: exitDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    anim.start(() => {
      if (animationOnly) {
        onAnimationEnd?.();
      } else {
        navigation.replace("Login");
      }
    });

    return () => anim.stop();
  }, [animationOnly, enterDuration, holdDuration, exitDuration, navigation, onAnimationEnd, opacity, scale]);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.gradient}
      />

      <View style={styles.safe}>
        <View style={styles.centerWrap} pointerEvents="none">
          {/* Optional soft glow ring behind the logo */}
          <View
            style={[
              styles.glow,
              {
                width: LOGO_SIZE * 1.35,
                height: LOGO_SIZE * 1.35,
                borderRadius: (LOGO_SIZE * 1.35) / 2,
              },
            ]}
          />

          <Animated.Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            accessibilityRole="image"
            accessibilityLabel="BlinqFix"
            resizeMode="contain"
            style={[
              {
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  glow: {
    position: "absolute",
    backgroundColor: "rgba(99, 102, 241, 0.18)", // indigo glow
    shadowColor: "#6366f1",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
});
