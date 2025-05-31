// components/TermsAndConditions.js
// import React from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   StyleSheet,
// } from "react-native";
// import BackButton from "../components/BackButton";

// export default function TermsAndConditions() {
//   return (
//     <SafeAreaView style={styles.safe}>
//         <BackButton />
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Main Header */}
//         <Text style={styles.h3}>BlinqFix – Full Legal Terms & Conditions</Text>

//         {/* Intro */}
//         <Text style={styles.body}>
//           These Terms of Use govern your access to and use of the BlinqFix
//           platform. By using our platform, you agree to be bound by the
//           following terms and conditions.
//         </Text>

//         {/* Section 1 */}
//         <Text style={styles.h5}>Section 1: Homeowners (Customers)</Text>
//         <View style={styles.indent}>
//           {[
//             [
//               "1. Acceptance of Terms:",
//               "By accessing or using BlinqFix, you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the platform."
//             ],
//             [
//               "2. Use of the Platform:",
//               "You must be at least 18 years old and legally capable of entering into contracts. You are responsible for the accuracy of all information provided."
//             ],
//             [
//               "3. Service Requests:",
//               "You may use BlinqFix to request services from independent providers. You understand that BlinqFix does not perform services and is not liable for the acts of providers."
//             ],
//             [
//               "4. Emergency Services:",
//               "Emergency services may incur additional fees and are subject to provider availability."
//             ],
//             [
//               "5. Payments:",
//               "Payments are processed via third-party payment processors. By submitting a payment, you authorize all applicable charges. BlinqFix may pre-authorize payment methods."
//             ],
//             [
//               "6. Cancellations:",
//               "You may cancel service requests, but fees may apply, especially for emergency or late cancellations."
//             ],
//             [
//               "7. Reviews:",
//               "You may leave reviews for providers. BlinqFix reserves the right to moderate or remove content that violates platform rules."
//             ],
//             [
//               "8. Disclaimers:",
//               "BlinqFix provides the platform 'as is' and disclaims all warranties. We do not guarantee the quality or outcome of any services."
//             ],
//             [
//               "9. Limitation of Liability:",
//               "To the fullest extent permitted by law, BlinqFix shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid by you for the services."
//             ],
//             [
//               "10. Indemnification:",
//               "You agree to indemnify and hold harmless BlinqFix and its affiliates from any claims, losses, or damages arising out of your use of the platform."
//             ],
//             [
//               "11. Dispute Resolution:",
//               "All disputes must be resolved through binding arbitration in the state of [Insert State], and not in court."
//             ],
//             [
//               "12. Modifications:",
//               "BlinqFix may update these terms at any time. Continued use of the platform constitutes acceptance."
//             ],
//           ].map(([strong, text], i) => (
//             <Text key={i} style={styles.body}>
//               <Text style={styles.bold}>{strong} </Text>
//               {text}
//             </Text>
//           ))}
//         </View>

//         {/* Section 2 */}
//         <Text style={[styles.h5, { marginTop: 24 }]}>
//           Section 2: Service Providers
//         </Text>
//         <View style={styles.indent}>
//           {[
//             [
//               "1. Independent Contractor Status:",
//               "You are an independent contractor, not an employee of BlinqFix. You are responsible for all applicable taxes, insurance, and compliance."
//             ],
//             [
//               "2. Licensing & Insurance:",
//               "You represent and warrant that you are properly licensed and insured to perform the services you offer."
//             ],
//             [
//               "3. OSHA Compliance:",
//               "You agree to comply with all OSHA Federal Safety Standards and applicable safety laws."
//             ],
//             [
//               "4. Platform Fees:",
//               "BlinqFix may charge a platform fee on each job. You agree to receive payments less applicable fees."
//             ],
//             [
//               "5. Performance Standards:",
//               "You agree to perform all services with professionalism, care, and due skill."
//             ],
//             [
//               "6. Confidentiality:",
//               "You must keep all user information confidential and use it only for fulfilling services."
//             ],
//             [
//               "7. Dispute Resolution:",
//               "You agree to cooperate with BlinqFix in resolving any disputes. BlinqFix reserves the right to withhold payments pending investigation."
//             ],
//             [
//               "8. Platform Abuse:",
//               "You shall not solicit customers for off-platform work. Circumvention is a material breach and may lead to legal action."
//             ],
//             [
//               "9. Limitation of Liability:",
//               "BlinqFix shall not be liable for any damages related to your services. Your total liability to BlinqFix shall not exceed the amount paid through the platform."
//             ],
//             [
//               "10. Indemnification:",
//               "You agree to indemnify and hold harmless BlinqFix from any third-party claims arising out of your conduct or services."
//             ],
//             [
//               "11. Termination:",
//               "BlinqFix may suspend or terminate your account for violations of these terms."
//             ],
//             [
//               "12. Governing Law:",
//               "These terms are governed by the laws of the State of [Insert State]."
//             ],
//           ].map(([strong, text], i) => (
//             <Text key={i} style={styles.body}>
//               <Text style={styles.bold}>{strong} </Text>
//               {text}
//             </Text>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff", marginVertical: 45 },
//   container: {
//     paddingHorizontal: 16,
//     paddingVertical: 24,
//   },
//   h3: {
//     fontSize: 28,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   h5: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   body: {
//     fontSize: 16,
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   bold: { fontWeight: "700" },
//   indent: { paddingLeft: 12 },
// });


import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import BackButton from "../components/BackButton";

export default function TermsOfUse() {
  return (

    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.header}>BlinqFix Terms of Use for Customers and Service Pros</Text>
      <Text style={styles.subHeader}>Effective Date: 05/23/2025</Text>

      <Text style={styles.sectionTitle}>1. Definitions</Text>
      <Text style={styles.paragraph}>• "Platform": The BlinqFix website, mobile app, software, and related services.</Text>
      <Text style={styles.paragraph}>• "User": Any individual or entity accessing the Platform, including Customers and Service Providers.</Text>
      <Text style={styles.paragraph}>• "Customer": An individual or entity seeking home services through the Platform.</Text>
      <Text style={styles.paragraph}>• "Service Provider" / "Contractor": Independent professionals providing services via the Platform.</Text>
      <Text style={styles.paragraph}>• "Services": All repair, maintenance, and related tasks offered and completed through the Platform.</Text>
      <Text style={styles.paragraph}>• "Content": Text, photos, ratings, reviews, communications, and other data uploaded or generated by Users.</Text>
      <Text style={styles.paragraph}>• "Booking": A confirmed job request initiated through the Platform.</Text>

      <Text style={styles.sectionTitle}>2. Overview and Acceptance</Text>
      <Text style={styles.paragraph}>By accessing or using the Platform, you agree to these Terms, our Privacy Policy, and any additional posted policies. If you do not agree, do not use the Platform.</Text>

      <Text style={styles.sectionTitle}>3. Account Registration and Eligibility</Text>
      <Text style={styles.paragraph}>To use the Platform, Users must:</Text>
      <Text style={styles.paragraph}>• Provide complete and accurate information</Text>
      <Text style={styles.paragraph}>• Maintain security of login credentials</Text>
      <Text style={styles.paragraph}>• Be at least 18 years of age and legally able to enter contracts</Text>
      <Text style={styles.paragraph}>BlinqFix reserves the right to refuse access or cancel accounts at its sole discretion.</Text>

      <Text style={styles.sectionTitle}>4. Independent Contractor Status</Text>
      <Text style={styles.paragraph}>Service Providers are independent contractors, not employees, partners, or agents of BlinqFix. They are solely responsible for:</Text>
      <Text style={styles.paragraph}>• Setting their own schedules</Text>
      <Text style={styles.paragraph}>• Paying all applicable taxes</Text>
      <Text style={styles.paragraph}>• Providing their own tools and equipment</Text>
      <Text style={styles.paragraph}>• Maintaining required licenses and insurance</Text>

      <Text style={styles.sectionTitle}>5. Scope of Services</Text>
      <Text style={styles.paragraph}>Customers agree to:</Text>
      <Text style={styles.paragraph}>• Submit accurate service requests</Text>
      <Text style={styles.paragraph}>• Treat Service Providers respectfully</Text>
      <Text style={styles.paragraph}>• Pay for services in a timely manner</Text>
      <Text style={styles.paragraph}>Service Providers agree to:</Text>
      <Text style={styles.paragraph}>• Follow in-app job protocols</Text>
      <Text style={styles.paragraph}>• Communicate clearly with Customers</Text>
      <Text style={styles.paragraph}>• Submit required documentation</Text>
      <Text style={styles.paragraph}>• Clean work areas post-service</Text>

      <Text style={styles.sectionTitle}>... (continued for remaining sections) ...</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginVertical: 45,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});
