import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Zap,
  Shield,
  MapPin,
  CreditCard,
  Clock,
  Wrench,
  Droplets,
  Car,
  Flame,
  CheckCircle,
  Users,
  Star,
  Phone,
  Home,
  Snowflake,
  Download,
  DollarSign,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient"; // ✅ Expo import (named)

const services = [
  {
    icon: Droplets,
    title: "Plumbing",
    description: "Burst pipes, leaks, clogs",
    color: "#60a5fa",
  },
  {
    icon: Zap,
    title: "Electrical",
    description: "Power outages, wiring issues",
    color: "#facc15",
  },
  {
    icon: Flame,
    title: "HVAC",
    description: "Heating & cooling emergencies",
    color: "#fb923c",
  },
  {
    icon: Home,
    title: "Appliance Repair",
    description: "Refrigerator, washer, dryer",
    color: "#4ade80",
  },
  {
    icon: Shield,
    title: "Security Systems",
    description: "Locks, alarms, cameras",
    color: "#c084fc",
  },
  {
    icon: Car,
    title: "Garage Doors",
    description: "Opener malfunctions, track issues",
    color: "#f87171",
  },
  {
    icon: Snowflake,
    title: "Emergency Clean-up",
    description: "Water damage, storm cleanup",
    color: "#67e8f9",
  },
  {
    icon: Wrench,
    title: "General Repairs",
    description: "Doors, windows, fixtures",
    color: "#818cf8",
  },
];

const steps = [
  {
    icon: Phone,
    title: "Request Help",
    description:
      "Describe your emergency through our app. Get instant pricing upfront. Get an estimate instantly.",
    gradient: ["#3b82f6", "#22d3ee"],
  },
  {
    icon: MapPin,
    title: "Get Matched",
    description:
      "Pay and book the job in seconds. Our system instantly connects you with the nearest vetted service pro.",
    gradient: ["#a855f7", "#ec4899"],
  },
  {
    icon: Wrench,
    title: "Problem Solved",
    description: "Service pro arrives within the hour, resolves the issue.",
    gradient: ["#22c55e", "#10b981"],
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Vetted Professionals",
    description:
      "Background checked, licensed, and insured professionals you can trust.",
    gradient: ["#3b82f6", "#22d3ee"],
  },
  {
    icon: DollarSign,
    title: "Fixed Transparent Pricing",
    description: "Know the exact cost upfront. No surprises, no hidden fees.",
    gradient: ["#22c55e", "#10b981"],
  },
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    description:
      "Track your professional in real-time from dispatch to completion.",
    gradient: ["#a855f7", "#ec4899"],
  },
  {
    icon: Clock,
    title: "24/7 Emergency Response",
    description: "Available around the clock for any urgent repair emergency.",
    gradient: ["#f97316", "#ef4444"],
  },
  {
    icon: CreditCard,
    title: "Seamless Digital Payments",
    description: "Contactless payment processing through our secure platform.",
    gradient: ["#6366f1", "#a855f7"],
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description:
      "Every job backed by our satisfaction guarantee and insurance.",
    gradient: ["#eab308", "#f97316"],
  },
];

const stats = [
  {
    icon: Clock,
    value: "< 30 min",
    label: "Average Response Time",
    color: "#60a5fa",
  },
  { icon: Users, value: "50,000+", label: "Happy Customers", color: "#4ade80" },
  {
    icon: CheckCircle,
    value: "99.8%",
    label: "Success Rate",
    color: "#c084fc",
  },
  {
    icon: MapPin,
    value: "24/7",
    label: "Available Nationwide",
    color: "#fb923c",
  },
];

export default function LandingPage() {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const LOGO_SIZE = width * 0.55;

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* --- HERO SECTION --- */}
          <View style={[styles.section, styles.heroSection]}>
            <View style={styles.heroBadge}>
              <Zap color="#facc15" width={16} height={16} />
              <Text style={styles.heroBadgeText}>
                Emergency Repairs • On-Demand
              </Text>
            </View>
            <Text style={styles.heroTitle}>BlinqFix</Text>
            <View>
                <Image
                  source={require("../assets/blinqfix_logo-new.jpeg")}
                  style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
                  resizeMode="contain"
                />
              </View>
            <Text style={styles.heroSubtitle}>
              The first on-demand emergency repair platform that connects
              customers with vetted service professionals in real time!
            </Text>
            <Text style={styles.heroDescription}>
              <Text style={{ fontWeight: "bold" }}>Instantly.</Text> With fixed
              pricing, GPS tracking, and seamless payments, we’re redefining
              speed and trust in urgent home and business repairs.
            </Text>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.mainButtonText}>Get Emergency Help Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.secondaryButtonText}>Earn with Blinqfix</Text>
            </TouchableOpacity>
            <View style={styles.heroFeaturesContainer}>
              <View style={styles.heroFeature}>
                <Shield color="#4ade80" width={16} height={16} />
                <Text style={styles.heroFeatureText}>Vetted Professionals</Text>
              </View>
              <View style={styles.heroFeature}>
                <Clock color="#60a5fa" width={16} height={16} />
                <Text style={styles.heroFeatureText}>Fixed Pricing</Text>
              </View>
              <View style={styles.heroFeature}>
                <Zap color="#c084fc" width={16} height={16} />
                <Text style={styles.heroFeatureText}>Instant Connection</Text>
              </View>
            </View>
          </View>

          {/* --- SERVICES SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              On-Demand & Emergency Services Available 24/7
            </Text>
            <Text style={styles.sectionSubtitle}>
              From plumbing disasters to electrical emergencies, our vetted
              professionals are ready to fix any urgent repair, anytime,
              anywhere.
            </Text>
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <View key={index} style={styles.serviceCard}>
                  <View style={styles.serviceIconContainer}>
                    <service.icon
                      color={service.color}
                      width={32}
                      height={32}
                    />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* --- HOW IT WORKS SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How BlinqFix Works</Text>
            <Text style={styles.sectionSubtitle}>
              Getting emergency repairs has never been this simple. Three easy
              steps from problem to solution.
            </Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepIconOuter}>
                  <LinearGradient
                    colors={step.gradient}
                    style={styles.stepIconInner}
                  >
                    <step.icon color="#fff" width={32} height={32} />
                  </LinearGradient>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            ))}
          </View>

          {/* --- BENEFITS SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose BlinqFix?</Text>
            <Text style={styles.sectionSubtitle}>
              We've reimagined emergency repairs with technology, transparency,
              and trust at the center of everything we do.
            </Text>
            <View style={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <LinearGradient
                    colors={benefit.gradient}
                    style={styles.benefitIconContainer}
                  >
                    <benefit.icon color="#fff" width={24} height={24} />
                  </LinearGradient>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>
                    {benefit.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* --- STATS SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trusted by Thousands</Text>
            <Text style={styles.sectionSubtitle}>
              The numbers speak for themselves - BlinqFix delivers results.
            </Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <stat.icon color={stat.color} width={32} height={32} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.testimonialCard}>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    color="#facc15"
                    fill="#facc15"
                    width={16}
                    height={16}
                  />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "My water heater burst at 2 AM. BlinqFix had someone at my door
                in 25 minutes. Professional, fast, and the pricing was exactly
                what they quoted upfront."
              </Text>
              <Text style={styles.testimonialAuthor}>
                — Sarah M., Homeowner
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    color="#facc15"
                    fill="#facc15"
                    width={16}
                    height={16}
                  />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                “Blinqfix just sends me jobs. No drama. No nonsense. Just jobs
                you can choose. Joining the network was the best decision I ever
                made.”
              </Text>
              <Text style={styles.testimonialAuthor}>
                — Micheal S., Lic. Plumber
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    color="#facc15"
                    fill="#facc15"
                    width={16}
                    height={16}
                  />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "I am a property manager. We manage over 1,000 properties.
                Blinqfix has been fast and reliable also they are 24/7."
              </Text>
              <Text style={styles.testimonialAuthor}>
                — Rosa T., Propery Manager
              </Text>
            </View>
          </View>

          {/* --- CTA SECTION --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ready for Fast, Reliable Repairs?
            </Text>
            <Text style={styles.sectionSubtitle}>
              Don't let emergencies ruin your day. Get connected with a
              professional in minutes.
            </Text>
            <TouchableOpacity style={styles.mainButton}>
              <Phone
                color="#fff"
                width={20}
                height={20}
                style={{ marginRight: 8 }}
              />
              <Text
                style={styles.mainButtonText}
                onPress={() => navigation.navigate("Login")}
              >
                Get Help Now
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2025 BlinqFix. All rights reserved.
              </Text>
              <Text style={styles.footerText}>
                Redefining speed and trust in emergency and on demand repairs.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { padding: 20, marginTop: 40 },
  section: { marginBottom: 48, alignItems: "center" },
  heroSection: {
    minHeight: 600,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },

  // Hero
  heroBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    alignItems: "center",
    marginBottom: 24,
  },
  heroBadgeText: { color: "#fff", marginLeft: 8, fontWeight: "500" },
  heroTitle: {
    fontSize: 60,
    fontWeight: "900",
    color: "#fff",
    marginBottom: -36,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  mainButton: {
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  mainButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  heroFeaturesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 48,
    width: "40%",
    
  },
  heroFeature: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  heroFeatureText: { color: "#fff", marginLeft: 2 },

  // Services
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  serviceIconContainer: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  serviceDescription: { fontSize: 14, color: "#e0e7ff", textAlign: "center" },

  // How It Works
  stepCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stepIconOuter: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginBottom: 16,
  },
  stepIconInner: { padding: 16, borderRadius: 18 },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 24,
  },

  // Benefits
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  benefitIconContainer: { padding: 12, borderRadius: 16, marginBottom: 12 },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  benefitDescription: {
    fontSize: 14,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 20,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginVertical: 8,
  },
  statLabel: { fontSize: 14, color: "#e0e7ff", textAlign: "center" },
  testimonialCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  testimonialText: {
    fontSize: 16,
    color: "#fff",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  testimonialAuthor: { fontSize: 14, color: "#e0e7ff", textAlign: "center" },

  // Footer / CTA
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    width: "100%",
    alignItems: "center",
  },
  footerText: { color: "#e0e7ff", fontSize: 12, textAlign: "center" },
});
