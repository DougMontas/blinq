// components/TermsAndConditions.js
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import BackButton from "../components/BackButton";

export default function TermsAndConditions() {
  return (
    <SafeAreaView style={styles.safe}>
        <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Header */}
        <Text style={styles.h3}>BlinqFix – Full Legal Terms & Conditions</Text>

        {/* Intro */}
        <Text style={styles.body}>
          These Terms of Use govern your access to and use of the BlinqFix
          platform. By using our platform, you agree to be bound by the
          following terms and conditions.
        </Text>

        {/* Section 1 */}
        <Text style={styles.h5}>Section 1: Homeowners (Customers)</Text>
        <View style={styles.indent}>
          {[
            [
              "1. Acceptance of Terms:",
              "By accessing or using BlinqFix, you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the platform."
            ],
            [
              "2. Use of the Platform:",
              "You must be at least 18 years old and legally capable of entering into contracts. You are responsible for the accuracy of all information provided."
            ],
            [
              "3. Service Requests:",
              "You may use BlinqFix to request services from independent providers. You understand that BlinqFix does not perform services and is not liable for the acts of providers."
            ],
            [
              "4. Emergency Services:",
              "Emergency services may incur additional fees and are subject to provider availability."
            ],
            [
              "5. Payments:",
              "Payments are processed via third-party payment processors. By submitting a payment, you authorize all applicable charges. BlinqFix may pre-authorize payment methods."
            ],
            [
              "6. Cancellations:",
              "You may cancel service requests, but fees may apply, especially for emergency or late cancellations."
            ],
            [
              "7. Reviews:",
              "You may leave reviews for providers. BlinqFix reserves the right to moderate or remove content that violates platform rules."
            ],
            [
              "8. Disclaimers:",
              "BlinqFix provides the platform 'as is' and disclaims all warranties. We do not guarantee the quality or outcome of any services."
            ],
            [
              "9. Limitation of Liability:",
              "To the fullest extent permitted by law, BlinqFix shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid by you for the services."
            ],
            [
              "10. Indemnification:",
              "You agree to indemnify and hold harmless BlinqFix and its affiliates from any claims, losses, or damages arising out of your use of the platform."
            ],
            [
              "11. Dispute Resolution:",
              "All disputes must be resolved through binding arbitration in the state of [Insert State], and not in court."
            ],
            [
              "12. Modifications:",
              "BlinqFix may update these terms at any time. Continued use of the platform constitutes acceptance."
            ],
          ].map(([strong, text], i) => (
            <Text key={i} style={styles.body}>
              <Text style={styles.bold}>{strong} </Text>
              {text}
            </Text>
          ))}
        </View>

        {/* Section 2 */}
        <Text style={[styles.h5, { marginTop: 24 }]}>
          Section 2: Service Providers
        </Text>
        <View style={styles.indent}>
          {[
            [
              "1. Independent Contractor Status:",
              "You are an independent contractor, not an employee of BlinqFix. You are responsible for all applicable taxes, insurance, and compliance."
            ],
            [
              "2. Licensing & Insurance:",
              "You represent and warrant that you are properly licensed and insured to perform the services you offer."
            ],
            [
              "3. OSHA Compliance:",
              "You agree to comply with all OSHA Federal Safety Standards and applicable safety laws."
            ],
            [
              "4. Platform Fees:",
              "BlinqFix may charge a platform fee on each job. You agree to receive payments less applicable fees."
            ],
            [
              "5. Performance Standards:",
              "You agree to perform all services with professionalism, care, and due skill."
            ],
            [
              "6. Confidentiality:",
              "You must keep all user information confidential and use it only for fulfilling services."
            ],
            [
              "7. Dispute Resolution:",
              "You agree to cooperate with BlinqFix in resolving any disputes. BlinqFix reserves the right to withhold payments pending investigation."
            ],
            [
              "8. Platform Abuse:",
              "You shall not solicit customers for off-platform work. Circumvention is a material breach and may lead to legal action."
            ],
            [
              "9. Limitation of Liability:",
              "BlinqFix shall not be liable for any damages related to your services. Your total liability to BlinqFix shall not exceed the amount paid through the platform."
            ],
            [
              "10. Indemnification:",
              "You agree to indemnify and hold harmless BlinqFix from any third-party claims arising out of your conduct or services."
            ],
            [
              "11. Termination:",
              "BlinqFix may suspend or terminate your account for violations of these terms."
            ],
            [
              "12. Governing Law:",
              "These terms are governed by the laws of the State of [Insert State]."
            ],
          ].map(([strong, text], i) => (
            <Text key={i} style={styles.body}>
              <Text style={styles.bold}>{strong} </Text>
              {text}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", marginVertical: 45 },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  h3: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  h5: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: { fontWeight: "700" },
  indent: { paddingLeft: 12 },
});
