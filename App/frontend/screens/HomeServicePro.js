import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";

export default function HomeServicePro() {
  const navigation = useNavigation();

  return (
    <ScreenWrapper>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Earn More with BlinqFix</Text>
          <Text style={styles.subtitle}>
            Join our platform and get access to high-paying, emergency service
            jobs with zero marketing costs.
          </Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Why Join BlinqFix?</Text>
          <View style={styles.featureBox}>
            <Text style={styles.bullet}>
              {"\u2022"} Instant job alerts in your area
            </Text>
            <Text style={styles.bullet}>
              {"\u2022"} Keep more of what you earn
            </Text>
            <Text style={styles.bullet}>{"\u2022"} Set your own schedule</Text>
            <Text style={styles.bullet}>
              {"\u2022"} Two billing options: Free or Priority
            </Text>
          </View>

          <Text style={styles.sectionTitle}>What Service Pros Say</Text>
          <View style={styles.testimonialBox}>
            <Text style={styles.quote}>
              "I get steady work every week now without spending a dollar on
              ads. BlinqFix is a game changer."
            </Text>
            <Text style={styles.author}>— Jordan M., Electrician</Text>
          </View>
          <View style={styles.testimonialBox}>
            <Text style={styles.quote}>
              "I love how simple it is to pick up emergency jobs and get paid
              quickly."
            </Text>
            <Text style={styles.author}>— Lisa R., Plumber</Text>
          </View>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={600}
          style={styles.actions}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Registration")}
          >
            <Text style={styles.primaryButtonText}>Join as a Service Pro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.linksRow}>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              Privacy Policy
            </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("CustomerFAQScreen")}
            >
              FAQs
            </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("TermsAndConditions")}
            >
              Terms
            </Text>
          </View>
        </Animatable.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1976d2",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#1976d2",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  featureBox: {
    marginBottom: 24,
  },
  bullet: {
    fontSize: 16,
    marginBottom: 8,
  },
  testimonialBox: {
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
  },
  quote: {
    fontStyle: "italic",
    fontSize: 16,
  },
  author: {
    marginTop: 8,
    textAlign: "right",
    fontWeight: "500",
  },
  actions: {
    alignItems: "center",
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#1976d2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderColor: "#1976d2",
    borderWidth: 2,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1976d2",
    fontSize: 16,
    fontWeight: "bold",
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
    marginRight: 0,
  },
  link: {
    color: "#1976d2",
    textDecorationLine: "none",
    fontSize: 14,
    marginRight: 50,
  },
});
