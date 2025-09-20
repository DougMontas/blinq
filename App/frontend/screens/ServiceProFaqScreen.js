// screens/UnifiedFAQScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
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
  Home,
  Calendar,
  CreditCard,
  Lock,
  MessageSquare,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

/* ============================ DATA ============================ */
const serviceProFaqs = [
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

const customerFaqGroups = [
  {
    title: "General",
    icon: HelpCircle,
    items: [
      {
        q: "What is BlinqFix?",
        a: "BlinqFix is a digital platform that connects homeowners with vetted, local service professionals for home repairs and maintenance. Our goal is to simplify the process of finding reliable help for your home needs.",
      },
      {
        q: "How does BlinqFix work?",
        a: "After signing up, you can submit a service request detailing the issue. BlinqFix then matches you with qualified professionals in your area who can address your specific needs.",
      },
      {
        q: "Which areas does BlinqFix serve?",
        a: "Currently, BlinqFix operates in select regions. Please check our website or app to see if services are available in your area. (Blinq Rewards)",
      },
    ],
  },
  {
    title: "Services",
    icon: Home,
    items: [
      {
        q: "What types of services does BlinqFix offer?",
        a: "We provide a range of home services, including plumbing, electrical work, HVAC maintenance, appliance repairs, and general handyman tasks.",
      },
      {
        q: "Are the service professionals vetted?",
        a: "Yes, all professionals on BlinqFix undergo a thorough background check and verification process to ensure quality and reliability.",
      },
    ],
  },
  {
    title: "Booking & Scheduling",
    icon: Calendar,
    items: [
      {
        q: "How do I book a service?",
        a: "Simply log in to your BlinqFix account, select the service you need, provide details about the issue, and choose a convenient time slot.",
      },
      {
        q: "Can I reschedule or cancel a booking?",
        a: "Yes, you can reschedule or cancel appointments through your account dashboard. Please note our cancellation policy for any applicable fees.",
      },
    ],
  },
  {
    title: "Pricing & Payment",
    icon: CreditCard,
    items: [
      {
        q: "How is pricing determined?",
        a: "Pricing is based on the type of service, complexity of the task, and market rates in your area. You'll receive a quote before confirming the booking.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept major credit cards and digital payment methods through our secure platform.",
      },
    ],
  },
  {
    title: "Safety & Trust",
    icon: Shield,
    items: [
      {
        q: "Is my personal information secure?",
        a: "Absolutely. We use advanced encryption and security protocols to protect your personal and payment information.",
      },
      {
        q: "What if I'm not satisfied with the service?",
        a: "Customer satisfaction is our priority. If you're not happy with the service provided, please contact our support team, and we'll work to resolve the issue promptly.",
      },
    ],
  },
  {
    title: "Support",
    icon: MessageSquare,
    items: [
      {
        q: "How can I contact BlinqFix support?",
        a: "You can reach our support team via the 'Contact Us' section on our website or through the in-app chat feature.",
      },
      {
        q: "What are your support hours?",
        a: "Our support team is available Monday through Friday, 9 AM to 5 PM EST.",
      },
    ],
  },
];

/* ============================ UI HELPERS ============================ */
const ProFAQCard = ({ question, answer, icon: Icon, index }) => (
  <View style={styles.card}>
    <LinearGradient
      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
      style={styles.cardGradient}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqIconBox}>
          <Icon color="#60a5fa" size={20} />
        </View>
        <Text style={styles.faqNumber}></Text>
      </View>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </LinearGradient>
  </View>
);

const CustomerSection = ({ title, icon: Icon, items }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={24} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {items.map((it, i) => (
        <View key={`${title}-${i}`} style={styles.faqItem}>
          <Text style={styles.question}>{it.q}</Text>
          <Text style={styles.answer}>{it.a}</Text>
        </View>
      ))}
    </LinearGradient>
  </View>
);

/* ============================ MAIN ============================ */
export default function UnifiedFAQScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Optional: allow deep-linking to a tab via route param
  const initialTab = useMemo(() => {
    const r = (route?.params?.initialTab || "customer").toLowerCase();
    return r === "pro" || r === "serviceProvider" ? "pro" : "customer";
  }, [route?.params?.initialTab]);

  const [tab, setTab] = useState(initialTab);

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerBadge}>
              <HelpCircle color="#22c55e" size={16} />
              <Text style={styles.headerBadgeText}>Help & Support</Text>
            </View>
            <Text style={styles.headerTitle}>BlinqFix FAQ</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setTab("customer")}
            style={[styles.tabChip, tab === "customer" && styles.tabChipActive]}
          >
            <Text
              style={[
                styles.tabText,
                tab === "customer" && styles.tabTextActive,
              ]}
            >
              For Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("pro")}
            style={[styles.tabChip, tab === "pro" && styles.tabChipActive]}
          >
            <Text
              style={[styles.tabText, tab === "pro" && styles.tabTextActive]}
            >
              For Service Pros
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {tab === "pro" ? (
            <>
              {/* Intro card for Pros */}
              <View style={styles.introCard}>
                <LinearGradient
                  colors={[
                    "rgba(34, 197, 94, 0.15)",
                    "rgba(16, 185, 129, 0.05)",
                  ]}
                  style={styles.introGradient}
                >
                  <View style={styles.introHeader}>
                    <Briefcase color="#22c55e" size={32} />
                    <Text style={styles.introTitle}>
                      Service Professional Guide
                    </Text>
                  </View>
                  <Text style={styles.introText}>
                    Everything you need to know about working as a BlinqFix
                    service professional. Find answers to the most common
                    questions about our platform.
                  </Text>
                </LinearGradient>
              </View>

              {serviceProFaqs.map((f, i) => (
                <ProFAQCard
                  key={i}
                  index={i}
                  question={f.question}
                  answer={f.answer}
                  icon={f.icon}
                />
              ))}

              {/* Support footer for Pros */}
              <View style={styles.supportCard}>
                <LinearGradient
                  colors={[
                    "rgba(96, 165, 250, 0.15)",
                    "rgba(59, 130, 246, 0.05)",
                  ]}
                  style={styles.supportGradient}
                >
                  <View style={styles.supportHeader}>
                    <MessageCircle color="#60a5fa" size={24} />
                    <Text style={styles.supportTitle}>Need More Help?</Text>
                  </View>
                  <Text style={styles.supportText}>
                    Can't find what you're looking for? Our support team is here
                    to help service professionals succeed on the platform.
                  </Text>
                  <View style={styles.supportBadge}>
                    <CheckCircle color="#22c55e" size={16} />
                    <Text style={styles.supportBadgeText}>
                      24/7 Support Available
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </>
          ) : (
            <>
              {/* Customer Sections */}
              {customerFaqGroups.map((grp, idx) => (
                <CustomerSection
                  key={idx}
                  title={grp.title}
                  icon={grp.icon}
                  items={grp.items}
                />
              ))}

              {/* Customer trust indicators */}
              <View style={styles.trustRow}>
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
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ============================ STYLES ============================ */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 60,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },

  tabsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 6,
  },
  tabChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tabChipActive: {
    backgroundColor: "rgba(96,165,250,0.2)",
    borderColor: "#60a5fa",
  },
  tabText: { color: "#e0e7ff", fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 10,
  },

  introCard: { marginBottom: 24, borderRadius: 16, overflow: "hidden" },
  introGradient: { padding: 24 },
  introHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  introTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
  },
  introText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },

  /* Pro cards */
  card: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  cardGradient: { padding: 20 },
  faqHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  faqIconBox: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  faqNumber: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 24,
  },
  answer: { fontSize: 15, color: "#e0e7ff", lineHeight: 22 },

  /* Customer sections */
  sectionCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  sectionGradient: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  /* Shared footer / trust row */
  supportCard: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  supportGradient: { padding: 24 },
  supportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  supportText: {
    fontSize: 16,
    color: "#e0e7ff",
    lineHeight: 24,
    marginBottom: 16,
  },
  supportBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  supportBadgeText: { color: "#22c55e", marginLeft: 8, fontWeight: "600" },

  trustRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    marginTop: 8,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
});
