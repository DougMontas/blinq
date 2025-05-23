// screens/LoadingScreen.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoadingScreen({
  animationOnly = false,
  onAnimationEnd,
  enterDuration = 1200,
  holdDuration  =  1200,
  exitDuration  =  1200,
}) {
  const navigation = useNavigation();
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: enterDuration,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: enterDuration,
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(holdDuration),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.5,
          duration: exitDuration,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: exitDuration,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      if (animationOnly) {
        onAnimationEnd?.();
      } else {
        navigation.replace("Login");
      }
    });
  }, [animationOnly, enterDuration, exitDuration, holdDuration, navigation, onAnimationEnd, opacity, scale]);

  const { width } = Dimensions.get("window");
  const LOGO_SIZE = width * 0.5;

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/blinqfix_logo-new.jpeg")}
        style={[
          { width: LOGO_SIZE, height: LOGO_SIZE },
          { transform: [{ scale }], opacity },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
});
