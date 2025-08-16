// // import React from "react";
// // import { ScrollView, View, Text, StyleSheet } from "react-native";
// // import BackButton from "../components/BackButton";
// // import ScreenWrapper from "../components/ScreenWrapper";

// // export default function ProviderTermsAndAgreement() {
// //   return (
// //     <ScreenWrapper>
// //         <BackButton />
// //       <ScrollView style={styles.container}>

// //         <Text style={styles.heading}>
// //           1. Terms and Conditions for Service Providers
// //         </Text>

// //         <Text style={styles.subHeading}>1.1 Overview</Text>
// //         <Text style={styles.paragraph}>
// //           These Terms and Conditions ("Terms") govern your access to and use of
// //           the BlinqFix platform as a Service Provider ("you," "contractor"). By
// //           using the BlinqFix app or platform, you agree to be bound by these
// //           Terms.
// //         </Text>

// //         <Text style={styles.subHeading}>1.2 Platform Access</Text>
// //         <Text style={styles.paragraph}>
// //           BlinqFix provides a digital marketplace that connects users
// //           ("Clients") with independent service professionals. BlinqFix does not
// //           provide services directly and is not responsible for the work
// //           performed by contractors.
// //         </Text>

// //         <Text style={styles.subHeading}>1.3 Contractor Status</Text>
// //         <Text style={styles.paragraph}>
// //           Contractors are independent third parties and are not employees,
// //           partners, agents, or representatives of BlinqFix. Nothing in these
// //           Terms shall be construed to create an employer-employee relationship.
// //         </Text>

// //         <Text style={styles.subHeading}>1.4 Payment</Text>
// //         <Text style={styles.paragraph}>
// //           Payments are processed through the BlinqFix platform. You will receive
// //           compensation for completed services minus BlinqFix’s platform fee. All
// //           contractors are responsible for their own taxes and withholdings.
// //         </Text>

// //         <Text style={styles.subHeading}>1.5 Platform Fee</Text>
// //         <Text style={styles.paragraph}>
// //           A platform service fee of 7% will be deducted from each transaction as
// //           compensation for the use of the BlinqFix platform, tools, and
// //           services. This fee is subject to change at any time at BlinqFix’s
// //           discretion, with or without prior notice.
// //         </Text>

// //         <Text style={styles.subHeading}>1.6 Conduct and Performance</Text>
// //         <Text style={styles.paragraph}>You agree to:</Text>
// //         <Text style={styles.listItem}>
// //           - Perform services professionally and on time
// //         </Text>
// //         <Text style={styles.listItem}>
// //           - Comply with all applicable laws and licensing requirements
// //         </Text>
// //         <Text style={styles.listItem}>
// //           - Maintain appropriate insurance as required
// //         </Text>
// //         <Text style={styles.listItem}>
// //           - Use the platform honestly and not misrepresent yourself or your
// //           capabilities
// //         </Text>

// //         <Text style={styles.subHeading}>1.7 Insurance Requirements</Text>
// //         <Text style={styles.paragraph}>
// //           All service providers must maintain current and valid General
// //           Liability Insurance with a minimum coverage of $500,000 per
// //           occurrence.
// //         </Text>
// //         <Text style={styles.paragraph}>
// //           BlinqFix must be named as a Certificate Holder on your policy and as
// //           an Additional Insured to provide coverage in the event of a claim
// //           related to your services.
// //         </Text>
// //         <Text style={styles.paragraph}>
// //           We strongly encourage that service providers extend Additional Insured
// //           status to customers who book services through the platform.
// //         </Text>
// //         <Text style={styles.paragraph}>
// //           Proof of insurance (Certificate of Insurance) must be uploaded and
// //           approved before accepting any job. This document must be updated
// //           annually or upon expiration.
// //         </Text>

// //         <Text style={styles.subHeading}>1.8 Non-Circumvention</Text>
// //         <Text style={styles.paragraph}>
// //           Service Providers agree not to solicit or accept direct engagements
// //           from any BlinqFix customer for services offered through the platform,
// //           outside of the platform, for a period of 12 months following their
// //           last interaction with such customer through BlinqFix. Any such
// //           circumvention is grounds for immediate removal and legal action.
// //         </Text>

// //         <Text style={styles.subHeading}>
// //           1.9 Confidentiality and Non-Disclosure
// //         </Text>
// //         <Text style={styles.paragraph}>
// //           Service Providers agree to maintain the confidentiality of all
// //           proprietary, customer, or platform-related information obtained
// //           through BlinqFix. This includes, but is not limited to, customer data,
// //           service records, pricing, platform workflows, and business operations.
// //           This obligation extends beyond the termination of their relationship
// //           with BlinqFix.
// //         </Text>

// //         <Text style={styles.subHeading}>1.10 Termination</Text>
// //         <Text style={styles.paragraph}>
// //           BlinqFix reserves the right to suspend or terminate access to the
// //           platform for violations of these Terms or misconduct.
// //         </Text>
// //       </ScrollView>
// //     </ScreenWrapper>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { padding: 20, backgroundColor: "#fff", marginVertical: 0 },
// //   heading: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //     marginBottom: 20,
// //     marginVertical: 120,
// //   },
// //   subHeading: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     marginTop: 16,
// //     marginBottom: 6,
// //   },
// //   paragraph: { fontSize: 16, marginBottom: 40, lineHeight: 22 },
// //   listItem: { fontSize: 16, marginLeft: 16, lineHeight: 22 },
// // });


// //previous working
// // import React from "react";
// // import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
// // import { LinearGradient } from "expo-linear-gradient";
// // import {
// //   ArrowLeft,
// //   FileText,
// //   Briefcase,
// //   Shield,
// //   DollarSign,
// //   Users,
// //   Lock,
// //   AlertTriangle,
// // } from "lucide-react-native";
// // import { useNavigation } from "@react-navigation/native";

// // const Section = ({ title, icon: Icon, children }) => (
// //   <View style={styles.sectionCard}>
// //     <LinearGradient
// //       colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
// //       style={styles.sectionGradient}
// //     >
// //       <View style={styles.sectionHeader}>
// //         <Icon color="#60a5fa" size={20} />
// //         <Text style={styles.subHeading}>{title}</Text>
// //       </View>
// //       {children}
// //     </LinearGradient>
// //   </View>
// // );

// // const Paragraph = ({ children }) => (
// //   <Text style={styles.paragraph}>{children}</Text>
// // );

// // const ListItem = ({ children }) => (
// //   <Text style={styles.listItem}>• {children}</Text>
// // );

// // export default function ProviderTermsAndAgreement() {
// //   const navigation = useNavigation();

// //   return (
// //     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
// //       <SafeAreaView style={{ flex: 1 }}>
// //         <ScrollView contentContainerStyle={styles.scrollContent}>
// //           {/* Header */}
// //           <View style={styles.header}>
// //             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //               <ArrowLeft color="#fff" size={24} />
// //             </TouchableOpacity>
// //             <View style={styles.headerCenter}>
// //               <View style={styles.headerBadge}>
// //                 <FileText color="#e0e7ff" size={16} />
// //                 <Text style={styles.headerBadgeText}>Legal Agreement</Text>
// //               </View>
// //               {/* <Text style={styles.headerTitle}>Provider Terms</Text> */}
// //             </View>
// //             <View style={{ width: 40 }} />
// //           </View>

// //           {/* Main Title Card */}
// //           <View style={styles.titleCard}>
// //             <LinearGradient
// //               colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
// //               style={styles.titleGradient}
// //             >
// //               <View style={styles.titleHeader}>
// //                 <Briefcase color="#22c55e" size={32} />
// //                 <Text style={styles.heading}>Terms and Conditions</Text>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <Section title="1.1 Overview" icon={FileText}>
// //             <Paragraph>
// //               These Terms and Conditions ("Terms") govern your access to and use of
// //               the BlinqFix platform as a Service Provider ("you," "contractor"). By
// //               using the BlinqFix app or platform, you agree to be bound by these
// //               Terms.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.2 Platform Access" icon={Users}>
// //             <Paragraph>
// //               BlinqFix provides a digital marketplace that connects users
// //               ("Clients") with independent service professionals. BlinqFix does not
// //               provide services directly and is not responsible for the work
// //               performed by contractors.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.3 Contractor Status" icon={Briefcase}>
// //             <Paragraph>
// //               Contractors are independent third parties and are not employees,
// //               partners, agents, or representatives of BlinqFix. Nothing in these
// //               Terms shall be construed to create an employer-employee relationship.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.4 Payment" icon={DollarSign}>
// //             <Paragraph>
// //               Payments are processed through the BlinqFix platform. You will receive
// //               compensation for completed services minus BlinqFix's platform fee. All
// //               contractors are responsible for their own taxes and withholdings.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.5 Platform Fee" icon={DollarSign}>
// //             <Paragraph>
// //               A platform service fee of 7% will be deducted from each transaction as
// //               compensation for the use of the BlinqFix platform, tools, and
// //               services. This fee is subject to change at any time at BlinqFix's
// //               discretion, with or without prior notice.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.6 Conduct and Performance" icon={Shield}>
// //             <Paragraph>You agree to:</Paragraph>
// //             <ListItem>Perform services professionally and on time</ListItem>
// //             <ListItem>Comply with all applicable laws and licensing requirements</ListItem>
// //             <ListItem>Maintain appropriate insurance as required</ListItem>
// //             <ListItem>
// //               Use the platform honestly and not misrepresent yourself or your
// //               capabilities
// //             </ListItem>
// //           </Section>

// //           <Section title="1.7 Insurance Requirements" icon={Shield}>
// //             <Paragraph>
// //               All service providers must maintain current and valid General
// //               Liability Insurance with a minimum coverage of $500,000 per
// //               occurrence.
// //             </Paragraph>
// //             <Paragraph>
// //               BlinqFix must be named as a Certificate Holder on your policy and as
// //               an Additional Insured to provide coverage in the event of a claim
// //               related to your services.
// //             </Paragraph>
// //             <Paragraph>
// //               We strongly encourage that service providers extend Additional Insured
// //               status to customers who book services through the platform.
// //             </Paragraph>
// //             <Paragraph>
// //               Proof of insurance (Certificate of Insurance) must be uploaded and
// //               approved before accepting any job. This document must be updated
// //               annually or upon expiration.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.8 Non-Circumvention" icon={AlertTriangle}>
// //             <Paragraph>
// //               Service Providers agree not to solicit or accept direct engagements
// //               from any BlinqFix customer for services offered through the platform,
// //               outside of the platform, for a period of 12 months following their
// //               last interaction with such customer through BlinqFix. Any such
// //               circumvention is grounds for immediate removal and legal action.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.9 Confidentiality and Non-Disclosure" icon={Lock}>
// //             <Paragraph>
// //               Service Providers agree to maintain the confidentiality of all
// //               proprietary, customer, or platform-related information obtained
// //               through BlinqFix. This includes, but is not limited to, customer data,
// //               service records, pricing, platform workflows, and business operations.
// //               This obligation extends beyond the termination of their relationship
// //               with BlinqFix.
// //             </Paragraph>
// //           </Section>

// //           <Section title="1.10 Termination" icon={AlertTriangle}>
// //             <Paragraph>
// //               BlinqFix reserves the right to suspend or terminate access to the
// //               platform for violations of these Terms or misconduct.
// //             </Paragraph>
// //           </Section>

// //           {/* Footer Notice */}
// //           <View style={styles.footerCard}>
// //             <LinearGradient
// //               colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
// //               style={styles.footerGradient}
// //             >
// //               <View style={styles.footerHeader}>
// //                 <AlertTriangle color="#f87171" size={20} />
// //                 <Text style={styles.footerTitle}>Important Notice</Text>
// //               </View>
// //               <Text style={styles.footerText}>
// //                 By using the BlinqFix platform, you acknowledge that you have read, 
// //                 understood, and agree to be bound by these terms and conditions.
// //               </Text>
// //             </LinearGradient>
// //           </View>
// //         </ScrollView>
// //       </SafeAreaView>
// //     </LinearGradient>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     padding: 20,
// //     paddingBottom: 40,
// //     marginTop: 40,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingBottom: 20,
// //   },
// //   backButton: {
// //     backgroundColor: 'rgba(255,255,255,0.1)',
// //     padding: 10,
// //     borderRadius: 99,
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //     alignItems: 'center'
// //   },
// //   headerCenter: {
// //     alignItems: 'center',
// //     flex: 1
// //   },
// //   headerBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255,255,255,0.1)',
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 16,
// //     marginBottom: 8
// //   },
// //   headerBadgeText: {
// //     color: '#fff',
// //     marginLeft: 6,
// //     fontSize: 12,
// //     fontWeight: '500'
// //   },
// //   headerTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#fff'
// //   },
// //   titleCard: {
// //     marginBottom: 24,
// //     borderRadius: 16,
// //     overflow: 'hidden'
// //   },
// //   titleGradient: {
// //     padding: 24
// //   },
// //   titleHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center'
// //   },
// //   heading: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     marginLeft: 16,
// //     flex: 1,
// //     lineHeight: 28
// //   },
// //   sectionCard: {
// //     marginBottom: 16,
// //     borderRadius: 16,
// //     overflow: 'hidden'
// //   },
// //   sectionGradient: {
// //     padding: 20
// //   },
// //   sectionHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 12
// //   },
// //   subHeading: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     marginLeft: 12
// //   },
// //   paragraph: {
// //     fontSize: 15,
// //     color: '#e0e7ff',
// //     lineHeight: 22,
// //     marginBottom: 12
// //   },
// //   listItem: {
// //     fontSize: 15,
// //     color: '#e0e7ff',
// //     lineHeight: 22,
// //     marginBottom: 8,
// //     marginLeft: 16
// //   },
// //   footerCard: {
// //     marginTop: 16,
// //     borderRadius: 16,
// //     overflow: 'hidden'
// //   },
// //   footerGradient: {
// //     padding: 20
// //   },
// //   footerHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 12
// //   },
// //   footerTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     marginLeft: 12
// //   },
// //   footerText: {
// //     fontSize: 14,
// //     color: '#e0e7ff',
// //     lineHeight: 20
// //   }
// // });

// import React from "react";
// import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   ArrowLeft,
//   FileText,
//   Briefcase,
//   Shield,
//   DollarSign,
//   Users,
//   Lock,
//   AlertTriangle,
//   Phone, // ← added
// } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";

// const Section = ({ title, icon: Icon, children }) => (
//   <View style={styles.sectionCard}>
//     <LinearGradient
//       colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//       style={styles.sectionGradient}
//     >
//       <View style={styles.sectionHeader}>
//         <Icon color="#60a5fa" size={20} />
//         <Text style={styles.subHeading}>{title}</Text>
//       </View>
//       {children}
//     </LinearGradient>
//   </View>
// );

// const Paragraph = ({ children }) => (
//   <Text style={styles.paragraph}>{children}</Text>
// );

// const ListItem = ({ children, indented = false }) => (
//   <Text style={[styles.listItem, indented && styles.listItemIndented]}>• {children}</Text>
// );

// // Small in-section heading for numbered items
// const PolicyHeading = ({ children }) => (
//   <Text style={styles.policyHeading}>{children}</Text>
// );

// export default function ProviderTermsAndAgreement() {
//   const navigation = useNavigation();

//   return (
//     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </TouchableOpacity>
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <FileText color="#e0e7ff" size={16} />
//                 <Text style={styles.headerBadgeText}>Legal Agreement</Text>
//               </View>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Main Title Card */}
//           <View style={styles.titleCard}>
//             <LinearGradient
//               colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
//               style={styles.titleGradient}
//             >
//               <View style={styles.titleHeader}>
//                 <Briefcase color="#22c55e" size={32} />
//                 <Text style={styles.heading}>Terms and Conditions</Text>
//               </View>
//             </LinearGradient>
//           </View>

//           <Section title="1.1 Overview" icon={FileText}>
//             <Paragraph>
//               These Terms and Conditions ("Terms") govern your access to and use of
//               the BlinqFix platform as a Service Provider ("you," "contractor"). By
//               using the BlinqFix app or platform, you agree to be bound by these
//               Terms.
//             </Paragraph>
//           </Section>

//           <Section title="1.2 Platform Access" icon={Users}>
//             <Paragraph>
//               BlinqFix provides a digital marketplace that connects users
//               ("Clients") with independent service professionals. BlinqFix does not
//               provide services directly and is not responsible for the work
//               performed by contractors.
//             </Paragraph>
//           </Section>

//           <Section title="1.3 Contractor Status" icon={Briefcase}>
//             <Paragraph>
//               Contractors are independent third parties and are not employees,
//               partners, agents, or representatives of BlinqFix. Nothing in these
//               Terms shall be construed to create an employer-employee relationship.
//             </Paragraph>
//           </Section>

//           <Section title="1.4 Payment" icon={DollarSign}>
//             <Paragraph>
//               Payments are processed through the BlinqFix platform. You will receive
//               compensation for completed services minus BlinqFix's platform fee. All
//               contractors are responsible for their own taxes and withholdings.
//             </Paragraph>
//           </Section>

//           <Section title="1.5 Platform Fee" icon={DollarSign}>
//             <Paragraph>
//               A platform service fee of 7% will be deducted from each transaction as
//               compensation for the use of the BlinqFix platform, tools, and
//               services. This fee is subject to change at any time at BlinqFix's
//               discretion, with or without prior notice.
//             </Paragraph>
//           </Section>

//           <Section title="1.6 Conduct and Performance" icon={Shield}>
//             <Paragraph>You agree to:</Paragraph>
//             <ListItem>Perform services professionally and on time</ListItem>
//             <ListItem>Comply with all applicable laws and licensing requirements</ListItem>
//             <ListItem>Maintain appropriate insurance as required</ListItem>
//             <ListItem>
//               Use the platform honestly and not misrepresent yourself or your
//               capabilities
//             </ListItem>
//           </Section>

//           <Section title="1.7 Insurance Requirements" icon={Shield}>
//             <Paragraph>
//               All service providers must maintain current and valid General
//               Liability Insurance with a minimum coverage of $500,000 per
//               occurrence.
//             </Paragraph>
//             <Paragraph>
//               BlinqFix must be named as a Certificate Holder on your policy and as
//               an Additional Insured to provide coverage in the event of a claim
//               related to your services.
//             </Paragraph>
//             <Paragraph>
//               We strongly encourage that service providers extend Additional Insured
//               status to customers who book services through the platform.
//             </Paragraph>
//             <Paragraph>
//               Proof of insurance (Certificate of Insurance) must be uploaded and
//               approved before accepting any job. This document must be updated
//               annually or upon expiration.
//             </Paragraph>
//           </Section>

//           <Section title="1.8 Non-Circumvention" icon={AlertTriangle}>
//             <Paragraph>
//               Service Providers agree not to solicit or accept direct engagements
//               from any BlinqFix customer for services offered through the platform,
//               outside of the platform, for a period of 12 months following their
//               last interaction with such customer through BlinqFix. Any such
//               circumvention is grounds for immediate removal and legal action.
//             </Paragraph>
//           </Section>

//           <Section title="1.9 Confidentiality and Non-Disclosure" icon={Lock}>
//             <Paragraph>
//               Service Providers agree to maintain the confidentiality of all
//               proprietary, customer, or platform-related information obtained
//               through BlinqFix. This includes, but is not limited to, customer data,
//               service records, pricing, platform workflows, and business operations.
//               This obligation extends beyond the termination of their relationship
//               with BlinqFix.
//             </Paragraph>
//           </Section>

//           <Section title="1.10 Termination" icon={AlertTriangle}>
//             <Paragraph>
//               BlinqFix reserves the right to suspend or terminate access to the
//               platform for violations of these Terms or misconduct.
//             </Paragraph>
//           </Section>

//           {/* ======================= NEW: SMS & Phone Number Privacy Policy ======================= */}
//           <Section title="BlinqFix SMS & Phone Number Privacy Policy" icon={Phone}>
//             <Paragraph style={{ fontStyle: "italic" }}>
//               Effective Date: [Insert Date]
//             </Paragraph>

//             <PolicyHeading>1. Information We Collect</PolicyHeading>
//             <Paragraph>
//               When you opt in to receive SMS messages from BlinqFix, we collect your
//               phone number and your messaging preferences (e.g., job notifications, marketing messages).
//             </Paragraph>

//             <PolicyHeading>2. How We Use Your Phone Number</PolicyHeading>
//             <ListItem>Job Notifications &amp; Updates (Transactional)</ListItem>
//             <ListItem indented>
//               For Customers: Messages about your service bookings, including confirmations,
//               arrival times, progress updates, and completion notices.
//             </ListItem>
//             <ListItem indented>
//               For Service Providers: Messages about new job opportunities, job details,
//               scheduling changes, and job progress updates.
//             </ListItem>
//             <ListItem>Promotions &amp; Marketing Messages</ListItem>
//             <ListItem indented>
//               Messages about special offers, promotions, platform updates, training opportunities,
//               and announcements about new features or services relevant to your role.
//             </ListItem>

//             <PolicyHeading>3. Message Frequency</PolicyHeading>
//             <ListItem>Transactional messages are sent as needed based on your service activity.</ListItem>
//             <ListItem>Marketing messages are sent up to 4 times per month unless otherwise stated.</ListItem>

//             <PolicyHeading>4. Opting Out</PolicyHeading>
//             <Paragraph>
//               You may opt out of receiving SMS messages at any time by replying STOP to any message.
//               After you opt out, you may continue to receive messages for transactions you initiated
//               until they are complete.
//             </Paragraph>

//             <PolicyHeading>5. Data Sharing &amp; Disclosure</PolicyHeading>
//             <Paragraph>
//               We do not sell, rent, or share your phone number with third parties for their own
//               marketing purposes. Your number may be shared only with:
//             </Paragraph>
//             <ListItem>Service providers who send messages on our behalf (e.g., Twilio)</ListItem>
//             <ListItem>Legal authorities if required by law</ListItem>

//             <PolicyHeading>6. Data Security</PolicyHeading>
//             <Paragraph>
//               We use industry-standard measures to protect your phone number and messaging preferences.
//             </Paragraph>

//             <PolicyHeading>7. Changes to This Policy</PolicyHeading>
//             <Paragraph>
//               We may update this policy from time to time. Changes will be posted on our website with an
//               updated “Effective Date.”
//             </Paragraph>

//             <PolicyHeading>8. Contact Us</PolicyHeading>
//             <Paragraph>
//               BlinqFix{"\n"}
//               Email: support@blinqfix.com{"\n"}
             
//             </Paragraph>
//           </Section>
//           {/* ======================= END SMS POLICY ======================= */}

//           {/* Footer Notice */}
//           <View style={styles.footerCard}>
//             <LinearGradient
//               colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
//               style={styles.footerGradient}
//             >
//               <View style={styles.footerHeader}>
//                 <AlertTriangle color="#f87171" size={20} />
//                 <Text style={styles.footerTitle}>Important Notice</Text>
//               </View>
//               <Text style={styles.footerText}>
//                 By using the BlinqFix platform, you acknowledge that you have read, 
//                 understood, and agree to be bound by these terms and conditions.
//               </Text>
//             </LinearGradient>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//     marginTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     padding: 10,
//     borderRadius: 99,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   headerCenter: {
//     alignItems: 'center',
//     flex: 1
//   },
//   headerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8
//   },
//   headerBadgeText: {
//     color: '#fff',
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500'
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff'
//   },
//   titleCard: {
//     marginBottom: 24,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   titleGradient: {
//     padding: 24
//   },
//   titleHeader: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 16,
//     flex: 1,
//     lineHeight: 28
//   },
//   sectionCard: {
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   sectionGradient: {
//     padding: 20
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   subHeading: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   paragraph: {
//     fontSize: 15,
//     color: '#e0e7ff',
//     lineHeight: 22,
//     marginBottom: 12
//   },
//   listItem: {
//     fontSize: 15,
//     color: '#e0e7ff',
//     lineHeight: 22,
//     marginBottom: 8,
//     marginLeft: 16
//   },
//   listItemIndented: {
//     marginLeft: 32
//   },
//   policyHeading: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#fff',
//     marginTop: 6,
//     marginBottom: 6
//   },
//   footerCard: {
//     marginTop: 16,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   footerGradient: {
//     padding: 20
//   },
//   footerHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   footerTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   footerText: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     lineHeight: 20
//   }
// });

// screens/TermsOfUse.js // previous
import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  FileText,
  BookText,
  CheckSquare,
  User,
  Briefcase,
  Wrench,
  DollarSign,
  Shield,
  Users,
  Lock,
  AlertTriangle,
  Phone,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

/* ---------- small UI helpers ---------- */
const Section = ({ title, icon: Icon, children }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={20} />
        <Text style={styles.sectionHeading}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const ListItem = ({ children, indented = false }) => (
  <Text style={[styles.listItem, indented && styles.listItemIndented]}>
    • {children}
  </Text>
);

const SubHeading = ({ children }) => (
  <Text style={styles.subHeading}>{children}</Text>
);

const PolicyHeading = ({ children }) => (
  <Text style={styles.policyHeading}>{children}</Text>
);

/* ---------- main screen ---------- */
export default function TermsOfUse() {
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
              <Text style={styles.headerTitle}>Terms of Use</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Intro Card */}
          <View style={styles.introCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.introGradient}
            >
              <Text style={styles.introTitle}>
                BlinqFix Terms of Use for Customers and Service Pros
              </Text>
              <Text style={styles.subHeader}>Effective Date: 05/1/2025</Text>
            </LinearGradient>
          </View>

          {/* Definitions */}
          <Section title="1. Definitions" icon={BookText}>
            <ListItem>
              “Platform”: The BlinqFix website, mobile app, software, and related
              services.
            </ListItem>
            <ListItem>
              “User”: Any individual or entity accessing the Platform, including
              Customers and Service Providers.
            </ListItem>
            <ListItem>
              “Customer”: An individual or entity seeking home services through
              the Platform.
            </ListItem>
            <ListItem>
              “Service Provider” / “Contractor”: Independent professionals
              providing services via the Platform.
            </ListItem>
            <ListItem>
              “Services”: Repair, maintenance, installation, clean-up, and other
              tasks offered or completed through the Platform.
            </ListItem>
            <ListItem>
              “Content”: Text, photos, ratings, reviews, communications, and
              other data uploaded or generated by Users.
            </ListItem>
            <ListItem>“Booking”: A confirmed job request made in the app.</ListItem>
          </Section>

          {/* Overview */}
          <Section title="2. Overview and Acceptance" icon={CheckSquare}>
            <Paragraph>
              By accessing or using the Platform, you agree to these Terms, the
              Privacy Policy, the SMS & Phone Number Privacy Policy below, and
              any additional posted policies. If you do not agree, do not use the
              Platform.
            </Paragraph>
          </Section>

          {/* Registration */}
          <Section title="3. Account Registration & Eligibility" icon={User}>
            <Paragraph>To use the Platform, Users must:</Paragraph>
            <ListItem>Provide complete and accurate information</ListItem>
            <ListItem>Maintain security of login credentials</ListItem>
            <ListItem>
              Be at least 18 years of age and legally able to enter contracts
            </ListItem>
            <Paragraph>
              BlinqFix may refuse access, suspend, or cancel accounts at its sole
              discretion for violations or fraud.
            </Paragraph>
          </Section>

          {/* CUSTOMER TERMS */}
          <Section title="4. Customer Terms (Homeowners)" icon={Wrench}>
            <SubHeading>4.1 Submitting a Request</SubHeading>
            <ListItem>Provide accurate address, contact, and job details</ListItem>
            <ListItem>
              Ensure safe access to the property and disclose hazards
            </ListItem>

            <SubHeading>4.2 Booking, Pricing & Payments</SubHeading>
            <ListItem>
              Pricing and fees (including any platform/convenience fee) are shown
              before you confirm. By booking, you authorize payment for the shown
              amounts and any approved add-ons.
            </ListItem>
            <ListItem>
              Some jobs may require additional on-site approval for non-covered
              scope; you’ll see and confirm before you’re charged.
            </ListItem>

            <SubHeading>4.3 Cancellations & Refunds</SubHeading>
            <ListItem>
              Cancellation and refund terms are disclosed in-app during booking
              and may vary by job status and timing.
            </ListItem>

            <SubHeading>4.4 Conduct</SubHeading>
            <ListItem>Treat Service Pros respectfully and lawfully</ListItem>
            <ListItem>Do not request unsafe or illegal work</ListItem>

            <SubHeading>4.5 Ratings & Reviews</SubHeading>
            <ListItem>
              Reviews must be accurate, respectful, and free of hateful or
              harassing content. We may moderate or remove content that violates
              policy.
            </ListItem>
          </Section>

          {/* PROVIDER TERMS */}
          <Section title="5. Service Provider Terms" icon={Briefcase}>
            <SubHeading>5.1 Overview</SubHeading>
            <Paragraph>
              By using the Platform as a Service Provider, you agree to be bound
              by these Terms and applicable policies.
            </Paragraph>

            <SubHeading>5.2 Platform Access</SubHeading>
            <Paragraph>
              BlinqFix is a marketplace connecting Clients with independent
              professionals. BlinqFix does not perform services and is not
              responsible for contractors’ work.
            </Paragraph>

            <SubHeading>5.3 Contractor Status</SubHeading>
            <Paragraph>
              You are an independent contractor—not an employee, partner, agent,
              or representative of BlinqFix.
            </Paragraph>

            <SubHeading>5.4 Payment</SubHeading>
            <Paragraph>
              Payments are processed through the Platform. You receive payment
              for completed work minus BlinqFix’s platform fee and any agreed
              fees. You are responsible for taxes and withholdings.
            </Paragraph>

            <SubHeading>5.5 Platform Fee</SubHeading>
            <Paragraph>
              A platform service fee (currently 7%) is deducted per transaction
              for platform tools and services. The fee may change at BlinqFix’s
              discretion.
            </Paragraph>

            <SubHeading>5.6 Conduct & Performance</SubHeading>
            <ListItem>Arrive on time and communicate proactively</ListItem>
            <ListItem>Maintain required licenses and insurance</ListItem>
            <ListItem>Perform work safely and professionally</ListItem>
            <ListItem>Accurately represent skills and qualifications</ListItem>

            <SubHeading>5.7 Insurance Requirements</SubHeading>
            <Paragraph>
              Maintain valid General Liability Insurance (minimum $500,000 per
              occurrence). BlinqFix must be named as Certificate Holder and
              Additional Insured. Upload a current COI and keep it updated.
            </Paragraph>

            <SubHeading>5.8 Non-Circumvention</SubHeading>
            <Paragraph>
              For 12 months after your last interaction with a BlinqFix customer
              through the Platform, do not solicit or accept jobs outside the
              Platform that were originated on BlinqFix.
            </Paragraph>

            <SubHeading>5.9 Confidentiality</SubHeading>
            <Paragraph>
              Keep customer and platform information confidential during and
              after your use of the Platform.
            </Paragraph>

            <SubHeading>5.10 Termination</SubHeading>
            <Paragraph>
              BlinqFix may suspend or terminate access for violations or
              misconduct.
            </Paragraph>
          </Section>

          {/* General Rules */}
          <Section title="6. General Rules & Prohibited Uses" icon={Users}>
            <ListItem>Do not misuse, reverse engineer, or attack the Platform</ListItem>
            <ListItem>Do not upload unlawful, harassing, or infringing content</ListItem>
            <ListItem>Obey all applicable laws and safety standards</ListItem>
          </Section>

          {/* Privacy/Security */}
          <Section title="7. Privacy & Security" icon={Lock}>
            <Paragraph>
              We use industry-standard measures to safeguard your information.
              See our Privacy Policy and SMS policy below for details on the data
              we collect and how we use it.
            </Paragraph>
          </Section>

          {/* SMS POLICY (all users) */}
          <Section
            title="BlinqFix SMS & Phone Number Privacy Policy"
            icon={Phone}
          >

            <PolicyHeading>1. Information We Collect</PolicyHeading>
            <Paragraph>
              If you opt in to SMS, we collect your phone number and messaging
              preferences (e.g., job notifications, marketing).
            </Paragraph>

            <PolicyHeading>2. How We Use Your Phone Number</PolicyHeading>
            <ListItem>Job Notifications &amp; Updates (Transactional)</ListItem>
            <ListItem indented>
              Customers: confirmations, arrival times, progress updates, and
              completion notices.
            </ListItem>
            <ListItem indented>
              Service Providers: new job opportunities, job details, scheduling
              changes, and progress updates.
            </ListItem>
            <ListItem>Promotions &amp; Marketing Messages</ListItem>
            <ListItem indented>
              Offers, platform updates, training, and announcements relevant to
              your role.
            </ListItem>

            <PolicyHeading>3. Message Frequency</PolicyHeading>
            <ListItem>
              Transactional: sent as needed based on your activity.
            </ListItem>
            <ListItem>Marketing: up to 4 messages/month.</ListItem>

            <PolicyHeading>4. Opting Out</PolicyHeading>
            <Paragraph>
              Reply STOP to unsubscribe; HELP for help. You may still receive
              messages needed to complete in-progress transactions.
            </Paragraph>

            <PolicyHeading>5. Data Sharing &amp; Disclosure</PolicyHeading>
            <Paragraph>
              We don’t sell or rent your number. We may share it with providers
              who send messages on our behalf (e.g., Twilio) or with authorities
              if required by law.
            </Paragraph>

            <PolicyHeading>6. Data Security</PolicyHeading>
            <Paragraph>
              We use industry-standard safeguards for phone numbers and
              preferences.
            </Paragraph>

            <PolicyHeading>7. Changes</PolicyHeading>
            <Paragraph>
              We may update this policy; changes will show an updated Effective
              Date.
            </Paragraph>

            <PolicyHeading>8. Contact</PolicyHeading>
            <Paragraph>
              Email: support@blinqfix.com{"\n"}
              Message &amp; data rates may apply.
            </Paragraph>
          </Section>

          {/* Disclaimers / Liability */}
          <Section title="8. Disclaimers & Limitation of Liability" icon={Shield}>
            <Paragraph>
              The Platform is provided “as is.” To the fullest extent permitted
              by law, BlinqFix disclaims warranties of merchantability, fitness,
              and non-infringement, and is not liable for indirect or
              consequential damages. Some jurisdictions do not allow certain
              limitations; your rights may vary.
            </Paragraph>
          </Section>

          {/* Changes & Contact */}
          <Section title="9. Changes to Terms" icon={FileText}>
            <Paragraph>
              We may update these Terms from time to time. Updates will be posted
              in-app with an effective date. Continued use constitutes acceptance.
            </Paragraph>
          </Section>

          {/* Footer Notice */}
          <View style={styles.footerCard}>
            <LinearGradient
              colors={["rgba(239, 68, 68, 0.1)", "rgba(220, 38, 38, 0.05)"]}
              style={styles.footerGradient}
            >
              <View style={styles.footerHeader}>
                <AlertTriangle color="#f87171" size={20} />
                <Text style={styles.footerTitle}>Important Notice</Text>
              </View>
              <Text style={styles.footerText}>
                By using the BlinqFix platform, you acknowledge you’ve read and
                agree to these Terms and the SMS & Phone Number Privacy Policy.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  introCard: { marginBottom: 24, borderRadius: 16, overflow: "hidden" },
  introGradient: { padding: 20 },
  introTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#fff",
  },
  subHeader: { fontSize: 14, textAlign: "center", color: "#94a3b8" },

  sectionCard: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  sectionGradient: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  sectionHeading: { fontSize: 16, fontWeight: "bold", color: "#fff", marginLeft: 12 },

  paragraph: {
    fontSize: 15,
    color: "#e0e7ff",
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    color: "#e0e7ff",
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 16,
  },
  listItemIndented: { marginLeft: 32 },

  subHeading: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 6,
  },
  policyHeading: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },

  footerCard: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  footerGradient: { padding: 20 },
  footerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  footerTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  footerText: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
});
