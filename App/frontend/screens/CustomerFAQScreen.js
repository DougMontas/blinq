// import React from "react";
// import { View, Text, ScrollView, StyleSheet } from "react-native";
// import BackButton from "../components/BackButton";
// import ScreenWrapper from "../components/ScreenWrapper";

// export default function CustomerFAQScreen() {
//   return (
//     <ScreenWrapper>
//         <BackButton />
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.header}>BlinqFix Customer FAQ</Text>

//         <Text style={styles.sectionTitle}>General</Text>

//         <Text style={styles.question}>What is BlinqFix?</Text>
//         <Text style={styles.answer}>
//           BlinqFix is a digital platform that connects homeowners with vetted,
//           local service professionals for home repairs and maintenance. Our goal
//           is to simplify the process of finding reliable help for your home
//           needs.
//         </Text>

//         <Text style={styles.question}>How does BlinqFix work?</Text>
//         <Text style={styles.answer}>
//           After signing up, you can submit a service request detailing the
//           issue. BlinqFix then matches you with qualified professionals in your
//           area who can address your specific needs.
//         </Text>

//         <Text style={styles.question}>Which areas does BlinqFix serve?</Text>
//         <Text style={styles.answer}>
//           Currently, BlinqFix operates in select regions. Please check our
//           website or app to see if services are available in your area. (Blinq
//           Rewards)
//         </Text>

//         <Text style={styles.sectionTitle}>Services</Text>

//         <Text style={styles.question}>
//           What types of services does BlinqFix offer?
//         </Text>
//         <Text style={styles.answer}>
//           We provide a range of home services, including plumbing, electrical
//           work, HVAC maintenance, appliance repairs, and general handyman tasks.
//         </Text>

//         <Text style={styles.question}>
//           Are the service professionals vetted?
//         </Text>
//         <Text style={styles.answer}>
//           Yes, all professionals on BlinqFix undergo a thorough background check
//           and verification process to ensure quality and reliability.
//         </Text>

//         <Text style={styles.sectionTitle}>Booking & Scheduling</Text>

//         <Text style={styles.question}>How do I book a service?</Text>
//         <Text style={styles.answer}>
//           Simply log in to your BlinqFix account, select the service you need,
//           provide details about the issue, and choose a convenient time slot.
//         </Text>

//         <Text style={styles.question}>
//           Can I reschedule or cancel a booking?
//         </Text>
//         <Text style={styles.answer}>
//           Yes, you can reschedule or cancel appointments through your account
//           dashboard. Please note our cancellation policy for any applicable
//           fees.
//         </Text>

//         <Text style={styles.sectionTitle}>Pricing & Payment</Text>

//         <Text style={styles.question}>How is pricing determined?</Text>
//         <Text style={styles.answer}>
//           Pricing is based on the type of service, complexity of the task, and
//           market rates in your area. You'll receive a quote before confirming
//           the booking.
//         </Text>

//         <Text style={styles.question}>What payment methods are accepted?</Text>
//         <Text style={styles.answer}>
//           We accept major credit cards and digital payment methods through our
//           secure platform.
//         </Text>

//         <Text style={styles.sectionTitle}>Safety & Trust</Text>

//         <Text style={styles.question}>Is my personal information secure?</Text>
//         <Text style={styles.answer}>
//           Absolutely. We use advanced encryption and security protocols to
//           protect your personal and payment information.
//         </Text>

//         <Text style={styles.question}>
//           What if I'm not satisfied with the service?
//         </Text>
//         <Text style={styles.answer}>
//           Customer satisfaction is our priority. If you're not happy with the
//           service provided, please contact our support team, and we'll work to
//           resolve the issue promptly.
//         </Text>

//         <Text style={styles.sectionTitle}>Support</Text>

//         <Text style={styles.question}>How can I contact BlinqFix support?</Text>
//         <Text style={styles.answer}>
//           You can reach our support team via the 'Contact Us' section on our
//           website or through the in-app chat feature.
//         </Text>

//         <Text style={styles.question}>What are your support hours?</Text>
//         <Text style={styles.answer}>
//           Our support team is available Monday through Friday, 9 AM to 5 PM EST.
//         </Text>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     marginTop: -100,
//     // marginVertical: 150
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//     marginTop: 120,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginTop: 24,
//     marginBottom: 12,
//   },
//   question: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 12,
//   },
//   answer: {
//     fontSize: 16,
//     marginTop: 4,
//     marginBottom: 8,
//     lineHeight: 22,
//   },
// });


import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  HelpCircle,
  Shield,
  Home,
  Calendar,
  CreditCard,
  Lock,
  MessageSquare,
  CheckCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const FAQSection = ({ title, icon: Icon, children }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={24} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const FAQItem = ({ question, answer }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>{question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

export default function CustomerFAQScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <HelpCircle color="#22c55e" size={16} />
                <Text style={styles.headerBadgeText}>Help & Support</Text>
              </View>
              <Text style={styles.headerTitle}>BlinqFix Customer FAQ</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* General Section */}
          <FAQSection title="General" icon={HelpCircle}>
            <FAQItem
              question="What is BlinqFix?"
              answer="BlinqFix is a digital platform that connects homeowners with vetted, local service professionals for home repairs and maintenance. Our goal is to simplify the process of finding reliable help for your home needs."
            />
            <FAQItem
              question="How does BlinqFix work?"
              answer="After signing up, you can submit a service request detailing the issue. BlinqFix then matches you with qualified professionals in your area who can address your specific needs."
            />
            <FAQItem
              question="Which areas does BlinqFix serve?"
              answer="Currently, BlinqFix operates in select regions. Please check our website or app to see if services are available in your area. (Blinq Rewards)"
            />
          </FAQSection>

          {/* Services Section */}
          <FAQSection title="Services" icon={Home}>
            <FAQItem
              question="What types of services does BlinqFix offer?"
              answer="We provide a range of home services, including plumbing, electrical work, HVAC maintenance, appliance repairs, and general handyman tasks."
            />
            <FAQItem
              question="Are the service professionals vetted?"
              answer="Yes, all professionals on BlinqFix undergo a thorough background check and verification process to ensure quality and reliability."
            />
          </FAQSection>

          {/* Booking & Scheduling Section */}
          <FAQSection title="Booking & Scheduling" icon={Calendar}>
            <FAQItem
              question="How do I book a service?"
              answer="Simply log in to your BlinqFix account, select the service you need, provide details about the issue, and choose a convenient time slot."
            />
            <FAQItem
              question="Can I reschedule or cancel a booking?"
              answer="Yes, you can reschedule or cancel appointments through your account dashboard. Please note our cancellation policy for any applicable fees."
            />
          </FAQSection>

          {/* Pricing & Payment Section */}
          <FAQSection title="Pricing & Payment" icon={CreditCard}>
            <FAQItem
              question="How is pricing determined?"
              answer="Pricing is based on the type of service, complexity of the task, and market rates in your area. You'll receive a quote before confirming the booking."
            />
            <FAQItem
              question="What payment methods are accepted?"
              answer="We accept major credit cards and digital payment methods through our secure platform."
            />
          </FAQSection>

          {/* Safety & Trust Section */}
          <FAQSection title="Safety & Trust" icon={Shield}>
            <FAQItem
              question="Is my personal information secure?"
              answer="Absolutely. We use advanced encryption and security protocols to protect your personal and payment information."
            />
            <FAQItem
              question="What if I'm not satisfied with the service?"
              answer="Customer satisfaction is our priority. If you're not happy with the service provided, please contact our support team, and we'll work to resolve the issue promptly."
            />
          </FAQSection>

          {/* Support Section */}
          <FAQSection title="Support" icon={MessageSquare}>
            <FAQItem
              question="How can I contact BlinqFix support?"
              answer="You can reach our support team via the 'Contact Us' section on our website or through the in-app chat feature."
            />
            <FAQItem
              question="What are your support hours?"
              answer="Our support team is available Monday through Friday, 9 AM to 5 PM EST."
            />
          </FAQSection>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <CheckCircle color="#22c55e" size={16} />
              <Text style={styles.trustText}>24/7 Emergency Support</Text>
            </View>
            <View style={styles.trustItem}>
              <Shield color="#60a5fa" size={16} />
              <Text style={styles.trustText}>Verified Professionals</Text>
            </View>
            <View style={styles.trustItem}>
              <Lock color="#c084fc" size={16} />
              <Text style={styles.trustText}>Secure Platform</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8
  },
  headerBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  sectionGradient: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24
  },
  answer: {
    fontSize: 15,
    color: '#e0e7ff',
    lineHeight: 22
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 20
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  trustText: {
    color: '#e0e7ff',
    fontSize: 11,
    fontWeight: '500'
  }
});