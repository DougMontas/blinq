import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import BackButton from "../components/BackButton";

export default function ProviderTermsAndAgreement() {
  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <Text style={styles.heading}>
        1. Terms and Conditions for Service Providers
      </Text>

      <Text style={styles.subHeading}>1.1 Overview</Text>
      <Text style={styles.paragraph}>
        These Terms and Conditions ("Terms") govern your access to and use of
        the BlinqFix platform as a Service Provider ("you," "contractor"). By
        using the BlinqFix app or platform, you agree to be bound by these
        Terms.
      </Text>

      <Text style={styles.subHeading}>1.2 Platform Access</Text>
      <Text style={styles.paragraph}>
        BlinqFix provides a digital marketplace that connects users ("Clients")
        with independent service professionals. BlinqFix does not provide
        services directly and is not responsible for the work performed by
        contractors.
      </Text>

      <Text style={styles.subHeading}>1.3 Contractor Status</Text>
      <Text style={styles.paragraph}>
        Contractors are independent third parties and are not employees,
        partners, agents, or representatives of BlinqFix. Nothing in these Terms
        shall be construed to create an employer-employee relationship.
      </Text>

      <Text style={styles.subHeading}>1.4 Payment</Text>
      <Text style={styles.paragraph}>
        Payments are processed through the BlinqFix platform. You will receive
        compensation for completed services minus BlinqFix’s platform fee. All
        contractors are responsible for their own taxes and withholdings.
      </Text>

      <Text style={styles.subHeading}>1.5 Platform Fee</Text>
      <Text style={styles.paragraph}>
        A platform service fee of 7% will be deducted from each transaction as
        compensation for the use of the BlinqFix platform, tools, and services.
        This fee is subject to change at any time at BlinqFix’s discretion, with
        or without prior notice.
      </Text>

      <Text style={styles.subHeading}>1.6 Conduct and Performance</Text>
      <Text style={styles.paragraph}>You agree to:</Text>
      <Text style={styles.listItem}>
        - Perform services professionally and on time
      </Text>
      <Text style={styles.listItem}>
        - Comply with all applicable laws and licensing requirements
      </Text>
      <Text style={styles.listItem}>
        - Maintain appropriate insurance as required
      </Text>
      <Text style={styles.listItem}>
        - Use the platform honestly and not misrepresent yourself or your
        capabilities
      </Text>

      <Text style={styles.subHeading}>1.7 Insurance Requirements</Text>
      <Text style={styles.paragraph}>
        All service providers must maintain current and valid General Liability
        Insurance with a minimum coverage of $500,000 per occurrence.
      </Text>
      <Text style={styles.paragraph}>
        BlinqFix must be named as a Certificate Holder on your policy and as an
        Additional Insured to provide coverage in the event of a claim related
        to your services.
      </Text>
      <Text style={styles.paragraph}>
        We strongly encourage that service providers extend Additional Insured
        status to customers who book services through the platform.
      </Text>
      <Text style={styles.paragraph}>
        Proof of insurance (Certificate of Insurance) must be uploaded and
        approved before accepting any job. This document must be updated
        annually or upon expiration.
      </Text>

      <Text style={styles.subHeading}>1.8 Non-Circumvention</Text>
      <Text style={styles.paragraph}>
        Service Providers agree not to solicit or accept direct engagements from
        any BlinqFix customer for services offered through the platform, outside
        of the platform, for a period of 12 months following their last
        interaction with such customer through BlinqFix. Any such circumvention
        is grounds for immediate removal and legal action.
      </Text>

      <Text style={styles.subHeading}>
        1.9 Confidentiality and Non-Disclosure
      </Text>
      <Text style={styles.paragraph}>
        Service Providers agree to maintain the confidentiality of all
        proprietary, customer, or platform-related information obtained through
        BlinqFix. This includes, but is not limited to, customer data, service
        records, pricing, platform workflows, and business operations. This
        obligation extends beyond the termination of their relationship with
        BlinqFix.
      </Text>

      <Text style={styles.subHeading}>1.10 Termination</Text>
      <Text style={styles.paragraph}>
        BlinqFix reserves the right to suspend or terminate access to the
        platform for violations of these Terms or misconduct.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", marginVertical: 40 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: { fontSize: 16, marginBottom: 40, lineHeight: 22 },
  listItem: { fontSize: 16, marginLeft: 16, lineHeight: 22 },
});
