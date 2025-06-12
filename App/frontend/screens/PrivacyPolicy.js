import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import BackButton from "../components/BackButton";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.title}>Privacy Policy for BlinqFix Official App</Text>
      <Text style={styles.effectiveDate}>Effective Date: 5/1/2025</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        BlinqFix ("we," "our," or "us") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use the BlinqFix official mobile
        application ("App").
      </Text>

      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect the following types of information:
      </Text>
      <Text style={styles.bullet}>
        • Personal Information: Name, email address, phone number, and payment
        information when you register or make a transaction.
      </Text>
      <Text style={styles.bullet}>
        • Device Information: IP address, operating system, device type, and app
        usage data.
      </Text>
      <Text style={styles.bullet}>
        • Location Data: With your consent, we may collect location information
        to enable service fulfillment.
      </Text>
      <Text style={styles.bullet}>
        • User Content: Photos, videos, and messages you upload or communicate
        through the App.
      </Text>

      <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
      <Text style={styles.bullet}>• Provide and manage the App services</Text>
      <Text style={styles.bullet}>
        • Process transactions and send confirmations
      </Text>
      <Text style={styles.bullet}>
        • Communicate with you about your account or services
      </Text>
      <Text style={styles.bullet}>
        • Improve our app and customer experience
      </Text>
      <Text style={styles.bullet}>• Comply with legal obligations</Text>

      <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
      <Text style={styles.bullet}>
        • Service Providers: Who perform services on our behalf
      </Text>
      <Text style={styles.bullet}>
        • Business Partners: With whom we may collaborate to deliver the App's
        features
      </Text>
      <Text style={styles.bullet}>
        • Law Enforcement: As required by law or to protect rights and safety
      </Text>

      <Text style={styles.sectionTitle}>5. Your Choices</Text>
      <Text style={styles.bullet}>
        • Access and Correction: You can access and update your personal
        information via the App.
      </Text>
      <Text style={styles.bullet}>
        • Location Services: You may enable or disable location services through
        your device settings.
      </Text>
      <Text style={styles.bullet}>
        • Marketing Communications: You can opt out of promotional messages by
        following the instructions in them.
      </Text>

      <Text style={styles.sectionTitle}>6. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement appropriate security measures to protect your data, but no
        system is 100% secure. We encourage you to use strong passwords and
        protect your login credentials.
      </Text>

      <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
      <Text style={styles.paragraph}>
        Our App is not intended for children under 13, and we do not knowingly
        collect data from children.
      </Text>

      <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this Privacy Policy from time to time. We will notify you
        of significant changes and update the "Effective Date" accordingly.
      </Text>

      <Text style={styles.sectionTitle}>9. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions or concerns about this Privacy Policy, please
        contact us at:
        {"\n"}BlinqFix, Inc.
        {"\n"}Email: support@blinqfix.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginVertical: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  effectiveDate: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 8,
  },
});
