import React from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  FileText,
  Shield,
  ClipboardList,
  Settings,
  Share2,
  CheckSquare,
  Lock,
  AlertTriangle,
  RefreshCw,
  Mail,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const Section = ({ title, icon: Icon, children }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={20} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const ListItem = ({ children }) => (
  <Text style={styles.listItem}>• {children}</Text>
);

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <FileText color="#e0e7ff" size={16} />
                <Text style={styles.headerBadgeText}>Legal</Text>
              </View>
              <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Intro Card */}
          <View style={styles.introCard}>
            <LinearGradient
              colors={["rgba(34, 197, 94, 0.15)", "rgba(16, 185, 129, 0.05)"]}
              style={styles.introGradient}
            >
              <View style={styles.introHeader}>
                <Shield color="#22c55e" size={32} />
                <Text style={styles.introTitle}>
                  Privacy Policy for BlinqFix Official App
                </Text>
              </View>
              <Text style={styles.effectiveDate}>Effective Date: 5/1/2025</Text>
            </LinearGradient>
          </View>

          <Section title="1. Introduction" icon={FileText}>
            <Paragraph>
              BlinqFix ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use the BlinqFix
              official mobile application ("App").
            </Paragraph>
          </Section>

          <Section title="2. Information We Collect" icon={ClipboardList}>
            <Paragraph>
              We may collect the following types of information:
            </Paragraph>
            <ListItem>
              Personal Information: Name, email address, phone number, and
              payment information when you register or make a transaction.
            </ListItem>
            <ListItem>
              Device Information: IP address, operating system, device type, and
              app usage data.
            </ListItem>
            <ListItem>
              Location Data: With your consent, we may collect location
              information to enable service fulfillment.
            </ListItem>
            <ListItem>
              User Content: Photos, videos, and messages you upload or
              communicate through the App.
            </ListItem>
          </Section>

          <Section title="3. How We Use Your Information" icon={Settings}>
            <ListItem>Provide and manage the App services</ListItem>
            <ListItem>Process transactions and send confirmations</ListItem>
            <ListItem>
              Communicate with you about your account or services
            </ListItem>
            <ListItem>Improve our app and customer experience</ListItem>
            <ListItem>Comply with legal obligations</ListItem>
          </Section>

          <Section title="4. Sharing Your Information" icon={Share2}>
            <ListItem>
              Service Providers: Who perform services on our behalf
            </ListItem>
            <ListItem>
              Business Partners: With whom we may collaborate to deliver the
              App's features
            </ListItem>
            <ListItem>
              Law Enforcement: As required by law or to protect rights and
              safety
            </ListItem>
          </Section>

          <Section title="5. Your Choices" icon={CheckSquare}>
            <ListItem>
              Access and Correction: You can access and update your personal
              information via the App.
            </ListItem>
            <ListItem>
              Location Services: You may enable or disable location services
              through your device settings.
            </ListItem>
            <ListItem>
              Marketing Communications: You can opt out of promotional messages
              by following the instructions in them.
            </ListItem>
          </Section>

          <Section title="6. Data Security" icon={Lock}>
            <Paragraph>
              We implement appropriate security measures to protect your data,
              but no system is 100% secure. We encourage you to use strong
              passwords and protect your login credentials.
            </Paragraph>
          </Section>

          <Section title="7. Children's Privacy" icon={AlertTriangle}>
            <Paragraph>
              Our App is not intended for children under 13, and we do not
              knowingly collect data from children.
            </Paragraph>
          </Section>

          <Section title="8. Changes to This Policy" icon={RefreshCw}>
            <Paragraph>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes and update the "Effective Date"
              accordingly.
            </Paragraph>
          </Section>

          <Section title="9. Contact Us" icon={Mail}>
            <Paragraph>
              If you have any questions or concerns about this Privacy Policy,
              please contact us at:
              {"\n"}BlinqFix, Inc.
              {"\n"}Email: support@blinqfix.com
            </Paragraph>
          </Section>
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
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
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
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  introCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  introGradient: {
    padding: 24,
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
    flex: 1,
    lineHeight: 28,
  },
  effectiveDate: {
    fontSize: 14,
    color: "#e0e7ff",
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  paragraph: {
    fontSize: 15,
    color: "#e0e7ff",
    lineHeight: 22,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 15,
    color: "#e0e7ff",
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 8,
  },
});
