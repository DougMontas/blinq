// import React from "react";
// import { ScrollView, View, Text, StyleSheet } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import BackButton from "../components/BackButton";
// import ScreenWrapper from "../components/ScreenWrapper";

// const faqs = [
//   {
//     question: "Who can use the BlinqFix platform as a contractor?",
//     answer:
//       "Any qualified professional with valid licensing (if applicable), liability insurance, and approval through the onboarding process.",
//   },
//   {
//     question: "What insurance do I need?",
//     answer:
//       "All service providers must carry General Liability Insurance with a minimum of $500,000 per occurrence. BlinqFix must be listed as a Certificate Holder and Additional Insured.",
//   },
//   {
//     question: "Can I work with customers outside the app?",
//     answer:
//       "No. Direct communication or business with BlinqFix customers outside the app is a violation of the non-circumvention clause.",
//   },
//   {
//     question: "What happens if I can't complete a job?",
//     answer:
//       "Notify BlinqFix immediately through the app. We will assess the situation and communicate with the customer.",
//   },
//   {
//     question: "How do I submit additional charges?",
//     answer:
//       "Only use the in-app \u201cAdditional Charge\u201d feature when the customer initiates a change in scope or it\u2019s necessary to perform the original service. Clearly document the request and wait for customer approval before proceeding.",
//   },
//   {
//     question: "Are before and after photos mandatory?",
//     answer:
//       "Yes. Both must be submitted through the app to verify job completion and release payment.",
//   },
//   {
//     question: "How are disputes handled?",
//     answer:
//       "Most issues are resolved through support. If unresolved, binding arbitration through the American Arbitration Association will be used.",
//   },
//   {
//     question: "How do I stay in good standing?",
//     answer:
//       "Be punctual, professional, follow all app instructions, clean up after your work, communicate with customers, and adhere to the Terms and Agreement.",
//   },
//   {
//     question: "Can I accept tips from customers?",
//     answer:
//       "Yes, you are welcome to accept tips if a customer offers one. In the future, we may offer in-app tipping functionality as well.",
//   },
// ];

// export default function ServiceProFaqScreen() {
//   const navigation = useNavigation();

//   return (
//     <ScreenWrapper>
//         <BackButton onPress={() => navigation.goBack()} />
//       <ScrollView style={styles.container}>
//         <Text style={styles.title}>FAQ – For Service Pros</Text>
//         {faqs.map((faq, index) => (
//           <View key={index} style={styles.faqContainer}>
//             <Text style={styles.question}>{faq.question}</Text>
//             <Text style={styles.answer}>{faq.answer}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//     padding: 16,
//     marginBottom: 0,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//     marginVertical: 120,
//   },
//   faqContainer: {
//     marginBottom: 120,
//   },
//   question: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   answer: {
//     fontSize: 14,
//     color: "#555",
//   },
// });

import React from "react";
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  HelpCircle,
  Briefcase,
  Shield,
  DollarSign,
  Camera,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
} from "lucide-react-native";

const faqs = [
  {
    question: "Who can use the BlinqFix platform as a contractor?",
    answer:
      "Any qualified professional with valid licensing (if applicable), liability insurance, and approval through the onboarding process.",
    icon: Briefcase,
  },
  {
    question: "What insurance do I need?",
    answer:
      "All service providers must carry General Liability Insurance with a minimum of $500,000 per occurrence. BlinqFix must be listed as a Certificate Holder and Additional Insured.",
    icon: Shield,
  },
  {
    question: "Can I work with customers outside the app?",
    answer:
      "No. Direct communication or business with BlinqFix customers outside the app is a violation of the non-circumvention clause.",
    icon: AlertTriangle,
  },
  {
    question: "What happens if I can't complete a job?",
    answer:
      "Notify BlinqFix immediately through the app. We will assess the situation and communicate with the customer.",
    icon: MessageCircle,
  },
  {
    question: "How do I submit additional charges?",
    answer:
      "Only use the in-app 'Additional Charge' feature when the customer initiates a change in scope or it's necessary to perform the original service. Clearly document the request and wait for customer approval before proceeding.",
    icon: DollarSign,
  },
  {
    question: "Are before and after photos mandatory?",
    answer:
      "Yes. Both must be submitted through the app to verify job completion and release payment.",
    icon: Camera,
  },
  {
    question: "How are disputes handled?",
    answer:
      "Most issues are resolved through support. If unresolved, binding arbitration through the American Arbitration Association will be used.",
    icon: AlertTriangle,
  },
  {
    question: "How do I stay in good standing?",
    answer:
      "Be punctual, professional, follow all app instructions, clean up after your work, communicate with customers, and adhere to the Terms and Agreement.",
    icon: CheckCircle,
  },
  {
    question: "Can I accept tips from customers?",
    answer:
      "Yes, you are welcome to accept tips if a customer offers one. In the future, we may offer in-app tipping functionality as well.",
    icon: DollarSign,
  },
];

const FAQItem = ({ question, answer, icon: Icon, index }) => (
  <View style={styles.faqCard}>
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      style={styles.faqGradient}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqIconContainer}>
          <Icon color="#60a5fa" size={20} />
        </View>
        <Text style={styles.faqNumber}>FAQ {index + 1}</Text>
      </View>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </LinearGradient>
  </View>
);

export default function ServiceProFaqScreen() {
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
                <Text style={styles.headerBadgeText}>Service Pro Help</Text>
              </View>
              <Text style={styles.headerTitle}>FAQ – For Service Pros</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Intro Card */}
          <View style={styles.introCard}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={styles.introGradient}
            >
              <View style={styles.introHeader}>
                <Briefcase color="#22c55e" size={32} />
                <Text style={styles.introTitle}>Service Professional Guide</Text>
              </View>
              <Text style={styles.introText}>
                Everything you need to know about working as a BlinqFix service professional. 
                Find answers to the most common questions about our platform.
              </Text>
            </LinearGradient>
          </View>

          {/* FAQ Items */}
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              icon={faq.icon}
              index={index}
            />
          ))}

          {/* Support Card */}
          <View style={styles.supportCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.15)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.supportGradient}
            >
              <View style={styles.supportHeader}>
                <MessageCircle color="#60a5fa" size={24} />
                <Text style={styles.supportTitle}>Need More Help?</Text>
              </View>
              <Text style={styles.supportText}>
                Can't find what you're looking for? Our support team is here to help service professionals succeed on the platform.
              </Text>
              <View style={styles.supportBadge}>
                <CheckCircle color="#22c55e" size={16} />
                <Text style={styles.supportBadgeText}>24/7 Support Available</Text>
              </View>
            </LinearGradient>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  introCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden'
  },
  introGradient: {
    padding: 24
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16
  },
  introText: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 24
  },
  faqCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  faqGradient: {
    padding: 20
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  faqIconContainer: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    padding: 8,
    borderRadius: 12,
    marginRight: 12
  },
  faqNumber: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600'
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 24
  },
  answer: {
    fontSize: 15,
    color: '#e0e7ff',
    lineHeight: 22
  },
  supportCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  supportGradient: {
    padding: 24
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  supportText: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 24,
    marginBottom: 16
  },
  supportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  supportBadgeText: {
    color: '#22c55e',
    marginLeft: 8,
    fontWeight: '600'
  }
});