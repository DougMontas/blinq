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
  }, [
    animationOnly,
    enterDuration,
    holdDuration,
    exitDuration,
    navigation,
    onAnimationEnd,
    opacity,
    scale,
  ]);

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
    // backgroundColor: "rgba(99, 102, 241, 0.18)", // indigo glow
    // shadowColor: "white",
    // shadowOpacity: 0.5,
    // shadowRadius: 30,
    // shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
});
