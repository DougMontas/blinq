import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";

export default function HomeCustomer() {
  const navigation = useNavigation();

  return (
      <ScreenWrapper>
        <BackButton/>
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Fast Emergency Repairs</Text>
        <Text style={styles.subtitle}>Book certified pros instantly.</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.content}>
        <Text style={styles.bulletTitle}>Why Choose BlinqFix?</Text>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>{"\u2022"}</Text>
          <Text style={styles.bulletText}>Certified & Vetted Service Pros</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>{"\u2022"}</Text>
          <Text style={styles.bulletText}>Upfront Pricing, No Surprises</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>{"\u2022"}</Text>
          <Text style={styles.bulletText}>Live GPS Tracking of Arrival</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>{"\u2022"}</Text>
          <Text style={styles.bulletText}>24/7 Availability for Emergencies</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Registration")}
        >
          <Text style={styles.buttonText}>Create an Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>Already have an account?</Text>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <Text style={styles.link} onPress={() => navigation.navigate("PrivacyPolicy")}>Privacy Policy</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("CustomerFAQScreen")}>FAQs</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("TermsAndConditions")}>Terms</Text>
        </View>

        <Text style={styles.sectionTitle}>What Customers Are Saying:</Text>
        <View style={styles.testimonialBox}>
          <Text style={styles.testimonial}>
            "I had a burst pipe at 2 AM and BlinqFix had a pro at my door in 15 minutes. Incredible service!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Maria G., Tampa</Text>
        </View>
        <View style={styles.testimonialBox}>
          <Text style={styles.testimonial}>
            "The price was fair, the app was easy to use, and the technician was professional."
          </Text>
          <Text style={styles.testimonialAuthor}>- John M., Miami</Text>
        </View>
      </Animatable.View>
    </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1976d2",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  content: {
    marginTop: 20,
  },
  bulletTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 20,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  button: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loginLink: {
    marginTop: 12,
    alignItems: "center",
  },
  loginText: {
    color: "#1976d2",
    fontWeight: "600",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  link: {
    color: "#1976d2",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 32,
    marginBottom: 10,
  },
  testimonialBox: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  testimonial: {
    fontStyle: "italic",
    fontSize: 15,
    color: "#444",
  },
  testimonialAuthor: {
    marginTop: 6,
    fontWeight: "600",
    fontSize: 14,
    color: "#000",
  },
});
