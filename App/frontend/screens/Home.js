import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to BlinqFix</Text>
        <Text style={styles.subtitle}>Instant on-demand emergency repairs</Text>
        
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300} style={styles.options}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("HomeCustomer")}
        >
          <Text style={styles.optionText}>I Need a Service Pro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButtonOutline}
          onPress={() => navigation.navigate("HomeServicePro")}
        >
          <Text style={styles.optionTextOutline}>I Am a Service Pro</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle2}>Residential & Commercial</Text>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 280,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1976d2",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 8,
    fontWeight: 700,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle2: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 48,
    fontWeight: 700,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  options: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#1976d2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  optionButtonOutline: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1976d2",
    alignItems: "center",
  },
  optionTextOutline: {
    color: "#1976d2",
    fontSize: 18,
    fontWeight: "600",
  },
});
