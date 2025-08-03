import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const fontSize = width < 360 ? 14 : width < 768 ? 16 : 18;
  const padding = width < 360 ? 4 : width < 768 ? 6 : 8;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={[
          styles.backBtn,
          { paddingHorizontal: padding, paddingVertical: padding },
        ]}
      >
        <Text style={[styles.backBtnText, { fontSize: 38, color: "grey" }]}>
          {"<"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 999,
  },
  backBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: {
    color: "#1976d2",
    fontWeight: "600",
  },
});
