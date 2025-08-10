// import React from "react";
// import { ScrollView, View, Text, StyleSheet } from "react-native";
// import BackButton from "../components/BackButton";
// import ScreenWrapper from "../components/ScreenWrapper";

// export default function ProviderTermsAndAgreement() {
//   return (
//     <ScreenWrapper>
//         <BackButton />
//       <ScrollView style={styles.container}>

//         <Text style={styles.heading}>
//           1. Terms and Conditions for Service Providers
//         </Text>

//         <Text style={styles.subHeading}>1.1 Overview</Text>
//         <Text style={styles.paragraph}>
//           These Terms and Conditions ("Terms") govern your access to and use of
//           the BlinqFix platform as a Service Provider ("you," "contractor"). By
//           using the BlinqFix app or platform, you agree to be bound by these
//           Terms.
//         </Text>

//         <Text style={styles.subHeading}>1.2 Platform Access</Text>
//         <Text style={styles.paragraph}>
//           BlinqFix provides a digital marketplace that connects users
//           ("Clients") with independent service professionals. BlinqFix does not
//           provide services directly and is not responsible for the work
//           performed by contractors.
//         </Text>

//         <Text style={styles.subHeading}>1.3 Contractor Status</Text>
//         <Text style={styles.paragraph}>
//           Contractors are independent third parties and are not employees,
//           partners, agents, or representatives of BlinqFix. Nothing in these
//           Terms shall be construed to create an employer-employee relationship.
//         </Text>

//         <Text style={styles.subHeading}>1.4 Payment</Text>
//         <Text style={styles.paragraph}>
//           Payments are processed through the BlinqFix platform. You will receive
//           compensation for completed services minus BlinqFix’s platform fee. All
//           contractors are responsible for their own taxes and withholdings.
//         </Text>

//         <Text style={styles.subHeading}>1.5 Platform Fee</Text>
//         <Text style={styles.paragraph}>
//           A platform service fee of 7% will be deducted from each transaction as
//           compensation for the use of the BlinqFix platform, tools, and
//           services. This fee is subject to change at any time at BlinqFix’s
//           discretion, with or without prior notice.
//         </Text>

//         <Text style={styles.subHeading}>1.6 Conduct and Performance</Text>
//         <Text style={styles.paragraph}>You agree to:</Text>
//         <Text style={styles.listItem}>
//           - Perform services professionally and on time
//         </Text>
//         <Text style={styles.listItem}>
//           - Comply with all applicable laws and licensing requirements
//         </Text>
//         <Text style={styles.listItem}>
//           - Maintain appropriate insurance as required
//         </Text>
//         <Text style={styles.listItem}>
//           - Use the platform honestly and not misrepresent yourself or your
//           capabilities
//         </Text>

//         <Text style={styles.subHeading}>1.7 Insurance Requirements</Text>
//         <Text style={styles.paragraph}>
//           All service providers must maintain current and valid General
//           Liability Insurance with a minimum coverage of $500,000 per
//           occurrence.
//         </Text>
//         <Text style={styles.paragraph}>
//           BlinqFix must be named as a Certificate Holder on your policy and as
//           an Additional Insured to provide coverage in the event of a claim
//           related to your services.
//         </Text>
//         <Text style={styles.paragraph}>
//           We strongly encourage that service providers extend Additional Insured
//           status to customers who book services through the platform.
//         </Text>
//         <Text style={styles.paragraph}>
//           Proof of insurance (Certificate of Insurance) must be uploaded and
//           approved before accepting any job. This document must be updated
//           annually or upon expiration.
//         </Text>

//         <Text style={styles.subHeading}>1.8 Non-Circumvention</Text>
//         <Text style={styles.paragraph}>
//           Service Providers agree not to solicit or accept direct engagements
//           from any BlinqFix customer for services offered through the platform,
//           outside of the platform, for a period of 12 months following their
//           last interaction with such customer through BlinqFix. Any such
//           circumvention is grounds for immediate removal and legal action.
//         </Text>

//         <Text style={styles.subHeading}>
//           1.9 Confidentiality and Non-Disclosure
//         </Text>
//         <Text style={styles.paragraph}>
//           Service Providers agree to maintain the confidentiality of all
//           proprietary, customer, or platform-related information obtained
//           through BlinqFix. This includes, but is not limited to, customer data,
//           service records, pricing, platform workflows, and business operations.
//           This obligation extends beyond the termination of their relationship
//           with BlinqFix.
//         </Text>

//         <Text style={styles.subHeading}>1.10 Termination</Text>
//         <Text style={styles.paragraph}>
//           BlinqFix reserves the right to suspend or terminate access to the
//           platform for violations of these Terms or misconduct.
//         </Text>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", marginVertical: 0 },
//   heading: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     marginVertical: 120,
//   },
//   subHeading: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 16,
//     marginBottom: 6,
//   },
//   paragraph: { fontSize: 16, marginBottom: 40, lineHeight: 22 },
//   listItem: { fontSize: 16, marginLeft: 16, lineHeight: 22 },
// });

import React from "react";
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  FileText,
  Briefcase,
  Shield,
  DollarSign,
  Users,
  Lock,
  AlertTriangle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const Section = ({ title, icon: Icon, children }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={20} />
        <Text style={styles.subHeading}>{title}</Text>
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

export default function ProviderTermsAndAgreement() {
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
                <FileText color="#e0e7ff" size={16} />
                <Text style={styles.headerBadgeText}>Legal Agreement</Text>
              </View>
              <Text style={styles.headerTitle}>Provider Terms</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Title Card */}
          <View style={styles.titleCard}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={styles.titleGradient}
            >
              <View style={styles.titleHeader}>
                <Briefcase color="#22c55e" size={32} />
                <Text style={styles.heading}>Terms and Conditions for Service Providers</Text>
              </View>
            </LinearGradient>
          </View>

          <Section title="1.1 Overview" icon={FileText}>
            <Paragraph>
              These Terms and Conditions ("Terms") govern your access to and use of
              the BlinqFix platform as a Service Provider ("you," "contractor"). By
              using the BlinqFix app or platform, you agree to be bound by these
              Terms.
            </Paragraph>
          </Section>

          <Section title="1.2 Platform Access" icon={Users}>
            <Paragraph>
              BlinqFix provides a digital marketplace that connects users
              ("Clients") with independent service professionals. BlinqFix does not
              provide services directly and is not responsible for the work
              performed by contractors.
            </Paragraph>
          </Section>

          <Section title="1.3 Contractor Status" icon={Briefcase}>
            <Paragraph>
              Contractors are independent third parties and are not employees,
              partners, agents, or representatives of BlinqFix. Nothing in these
              Terms shall be construed to create an employer-employee relationship.
            </Paragraph>
          </Section>

          <Section title="1.4 Payment" icon={DollarSign}>
            <Paragraph>
              Payments are processed through the BlinqFix platform. You will receive
              compensation for completed services minus BlinqFix's platform fee. All
              contractors are responsible for their own taxes and withholdings.
            </Paragraph>
          </Section>

          <Section title="1.5 Platform Fee" icon={DollarSign}>
            <Paragraph>
              A platform service fee of 7% will be deducted from each transaction as
              compensation for the use of the BlinqFix platform, tools, and
              services. This fee is subject to change at any time at BlinqFix's
              discretion, with or without prior notice.
            </Paragraph>
          </Section>

          <Section title="1.6 Conduct and Performance" icon={Shield}>
            <Paragraph>You agree to:</Paragraph>
            <ListItem>Perform services professionally and on time</ListItem>
            <ListItem>Comply with all applicable laws and licensing requirements</ListItem>
            <ListItem>Maintain appropriate insurance as required</ListItem>
            <ListItem>
              Use the platform honestly and not misrepresent yourself or your
              capabilities
            </ListItem>
          </Section>

          <Section title="1.7 Insurance Requirements" icon={Shield}>
            <Paragraph>
              All service providers must maintain current and valid General
              Liability Insurance with a minimum coverage of $500,000 per
              occurrence.
            </Paragraph>
            <Paragraph>
              BlinqFix must be named as a Certificate Holder on your policy and as
              an Additional Insured to provide coverage in the event of a claim
              related to your services.
            </Paragraph>
            <Paragraph>
              We strongly encourage that service providers extend Additional Insured
              status to customers who book services through the platform.
            </Paragraph>
            <Paragraph>
              Proof of insurance (Certificate of Insurance) must be uploaded and
              approved before accepting any job. This document must be updated
              annually or upon expiration.
            </Paragraph>
          </Section>

          <Section title="1.8 Non-Circumvention" icon={AlertTriangle}>
            <Paragraph>
              Service Providers agree not to solicit or accept direct engagements
              from any BlinqFix customer for services offered through the platform,
              outside of the platform, for a period of 12 months following their
              last interaction with such customer through BlinqFix. Any such
              circumvention is grounds for immediate removal and legal action.
            </Paragraph>
          </Section>

          <Section title="1.9 Confidentiality and Non-Disclosure" icon={Lock}>
            <Paragraph>
              Service Providers agree to maintain the confidentiality of all
              proprietary, customer, or platform-related information obtained
              through BlinqFix. This includes, but is not limited to, customer data,
              service records, pricing, platform workflows, and business operations.
              This obligation extends beyond the termination of their relationship
              with BlinqFix.
            </Paragraph>
          </Section>

          <Section title="1.10 Termination" icon={AlertTriangle}>
            <Paragraph>
              BlinqFix reserves the right to suspend or terminate access to the
              platform for violations of these Terms or misconduct.
            </Paragraph>
          </Section>

          {/* Footer Notice */}
          <View style={styles.footerCard}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
              style={styles.footerGradient}
            >
              <View style={styles.footerHeader}>
                <AlertTriangle color="#f87171" size={20} />
                <Text style={styles.footerTitle}>Important Notice</Text>
              </View>
              <Text style={styles.footerText}>
                By using the BlinqFix platform, you acknowledge that you have read, 
                understood, and agree to be bound by these terms and conditions.
              </Text>
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
  titleCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden'
  },
  titleGradient: {
    padding: 24
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    flex: 1,
    lineHeight: 28
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  sectionGradient: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  paragraph: {
    fontSize: 15,
    color: '#e0e7ff',
    lineHeight: 22,
    marginBottom: 12
  },
  listItem: {
    fontSize: 15,
    color: '#e0e7ff',
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 16
  },
  footerCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  footerGradient: {
    padding: 20
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  footerText: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20
  }
});