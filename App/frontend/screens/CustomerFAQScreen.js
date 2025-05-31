import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function CustomerFAQScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>BlinqFix Customer FAQ</Text>

      <Text style={styles.sectionTitle}>General</Text>

      <Text style={styles.question}>What is BlinqFix?</Text>
      <Text style={styles.answer}>
        BlinqFix is a digital platform that connects homeowners with vetted, local service
        professionals for home repairs and maintenance. Our goal is to simplify the process
        of finding reliable help for your home needs.
      </Text>

      <Text style={styles.question}>How does BlinqFix work?</Text>
      <Text style={styles.answer}>
        After signing up, you can submit a service request detailing the issue. BlinqFix then
        matches you with qualified professionals in your area who can address your specific needs.
      </Text>

      <Text style={styles.question}>Which areas does BlinqFix serve?</Text>
      <Text style={styles.answer}>
        Currently, BlinqFix operates in select regions. Please check our website or app to see
        if services are available in your area. (Blinq Rewards)
      </Text>

      <Text style={styles.sectionTitle}>Services</Text>

      <Text style={styles.question}>What types of services does BlinqFix offer?</Text>
      <Text style={styles.answer}>
        We provide a range of home services, including plumbing, electrical work, HVAC maintenance,
        appliance repairs, and general handyman tasks.
      </Text>

      <Text style={styles.question}>Are the service professionals vetted?</Text>
      <Text style={styles.answer}>
        Yes, all professionals on BlinqFix undergo a thorough background check and verification
        process to ensure quality and reliability.
      </Text>

      <Text style={styles.sectionTitle}>Booking & Scheduling</Text>

      <Text style={styles.question}>How do I book a service?</Text>
      <Text style={styles.answer}>
        Simply log in to your BlinqFix account, select the service you need, provide details about
        the issue, and choose a convenient time slot.
      </Text>

      <Text style={styles.question}>Can I reschedule or cancel a booking?</Text>
      <Text style={styles.answer}>
        Yes, you can reschedule or cancel appointments through your account dashboard. Please note
        our cancellation policy for any applicable fees.
      </Text>

      <Text style={styles.sectionTitle}>Pricing & Payment</Text>

      <Text style={styles.question}>How is pricing determined?</Text>
      <Text style={styles.answer}>
        Pricing is based on the type of service, complexity of the task, and market rates in your area.
        You'll receive a quote before confirming the booking.
      </Text>

      <Text style={styles.question}>What payment methods are accepted?</Text>
      <Text style={styles.answer}>
        We accept major credit cards and digital payment methods through our secure platform.
      </Text>

      <Text style={styles.sectionTitle}>Safety & Trust</Text>

      <Text style={styles.question}>Is my personal information secure?</Text>
      <Text style={styles.answer}>
        Absolutely. We use advanced encryption and security protocols to protect your personal
        and payment information.
      </Text>

      <Text style={styles.question}>What if I'm not satisfied with the service?</Text>
      <Text style={styles.answer}>
        Customer satisfaction is our priority. If you're not happy with the service provided,
        please contact our support team, and we'll work to resolve the issue promptly.
      </Text>

      <Text style={styles.sectionTitle}>Support</Text>

      <Text style={styles.question}>How can I contact BlinqFix support?</Text>
      <Text style={styles.answer}>
        You can reach our support team via the 'Contact Us' section on our website or through the
        in-app chat feature.
      </Text>

      <Text style={styles.question}>What are your support hours?</Text>
      <Text style={styles.answer}>
        Our support team is available Monday through Friday, 9 AM to 5 PM EST.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  answer: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 22,
  },
});
