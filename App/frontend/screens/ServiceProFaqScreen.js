import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../components/BackButton";

const faqs = [
  {
    question: "Who can use the BlinqFix platform as a contractor?",
    answer:
      "Any qualified professional with valid licensing (if applicable), liability insurance, and approval through the onboarding process.",
  },
  {
    question: "What insurance do I need?",
    answer:
      "All service providers must carry General Liability Insurance with a minimum of $500,000 per occurrence. BlinqFix must be listed as a Certificate Holder and Additional Insured.",
  },
  {
    question: "Can I work with customers outside the app?",
    answer:
      "No. Direct communication or business with BlinqFix customers outside the app is a violation of the non-circumvention clause.",
  },
  {
    question: "What happens if I can't complete a job?",
    answer:
      "Notify BlinqFix immediately through the app. We will assess the situation and communicate with the customer.",
  },
  {
    question: "How do I submit additional charges?",
    answer:
      "Only use the in-app \u201cAdditional Charge\u201d feature when the customer initiates a change in scope or it\u2019s necessary to perform the original service. Clearly document the request and wait for customer approval before proceeding.",
  },
  {
    question: "Are before and after photos mandatory?",
    answer:
      "Yes. Both must be submitted through the app to verify job completion and release payment.",
  },
  {
    question: "How are disputes handled?",
    answer:
      "Most issues are resolved through support. If unresolved, binding arbitration through the American Arbitration Association will be used.",
  },
  {
    question: "How do I stay in good standing?",
    answer:
      "Be punctual, professional, follow all app instructions, clean up after your work, communicate with customers, and adhere to the Terms and Agreement.",
  },
  {
    question: "Can I accept tips from customers?",
    answer:
      "Yes, you are welcome to accept tips if a customer offers one. In the future, we may offer in-app tipping functionality as well.",
  },
];

export default function ServiceProFaqScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>FAQ – For Service Pros</Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqContainer}>
          <Text style={styles.question}>{faq.question}</Text>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    marginVertical: 120
  },
  faqContainer: {
    marginBottom: 120,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  answer: {
    fontSize: 14,
    color: "#555",
  },
});
