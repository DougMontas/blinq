// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Linking,
//   ActivityIndicator,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import { Ionicons } from "@expo/vector-icons";
// import * as Animatable from "react-native-animatable";
// import ScreenWrapper from "../components/ScreenWrapper";

// export default function Home() {
//   const navigation = useNavigation();
//   const [testimonials, setTestimonials] = useState([]);
//   const [links, setLinks] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         const testimonialRes = await api.get("/home/testimonials");
//         const linkRes = await api.get("/home/links");
//         setTestimonials(testimonialRes.data);
//         setLinks(linkRes.data);
//       } catch (err) {
//         console.error("Failed to load home screen content:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContent();
//   }, []);

//   if (loading) {
//     return (
//       <ActivityIndicator style={{ flex: 1 }} size="large" color="#1976d2" />
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//       >
//         <Animatable.View animation="fadeInDown" style={styles.header}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//           <Text style={styles.title}>Emergency Repairs, Made Simple</Text>
//           <Text style={styles.subtitle}>
//             Fast, fixed-price repairs for your home or business. Join thousands
//             who trust BlinqFix.
//           </Text>
//         </Animatable.View>

//         <Animatable.View
//           animation="fadeInUp"
//           delay={300}
//           style={styles.section}
//         >
//           <Text style={styles.sectionTitle}>Plans & Pricing</Text>
//           <View style={styles.card}>
//             <Text style={styles.planTitle}>BlinqFix Go (Free)</Text>
//             <Text style={styles.planDescription}>
//               Pay-per-job model with profit sharing.
//             </Text>
//           </View>
//           <View style={styles.cardHighlight}>
//             <Text style={styles.planTitle}>BlinqFix Priority ($99/mo)</Text>
//             <Text style={styles.planDescription}>
//               Get priority access to high-paying jobs and keep more of your
//               earnings.
//             </Text>
//           </View>
//         </Animatable.View>

//         <Animatable.View
//           animation="fadeInUp"
//           delay={500}
//           style={styles.section}
//         >
//           <Text style={styles.sectionTitle}>Why Choose Us?</Text>
//           <Text style={styles.benefit}>
//             ✔️ Instant access to urgent repair jobs
//           </Text>
//           <Text style={styles.benefit}>
//             ✔️ Transparent pricing with no surprises
//           </Text>
//           <Text style={styles.benefit}>
//             ✔️ Boost your income without advertising
//           </Text>
//         </Animatable.View>

//         <Animatable.View
//           animation="fadeInUp"
//           delay={700}
//           style={styles.section}
//         >
//           <Text style={styles.sectionTitle}>Testimonials</Text>
//           {testimonials.map((t, index) => (
//             <View key={index} style={styles.testimonial}>
//               <Ionicons name="chatbubble-ellipses" size={20} color="#1976d2" />
//               <Text style={styles.quote}>"{t.quote}"</Text>
//               <Text style={styles.name}>— {t.name}</Text>
//             </View>
//           ))}
//         </Animatable.View>

//         <Animatable.View
//           animation="fadeInUp"
//           delay={800}
//           style={styles.section}
//         >
//           <Text style={styles.sectionTitle}>Get Started</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => navigation.navigate("Login")}
//           >
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.outlineButton}
//             onPress={() => navigation.navigate("Registration")}
//           >
//             <Text style={styles.outlineButtonText}>Create Account</Text>
//           </TouchableOpacity>
//         </Animatable.View>

//         <Animatable.View
//           animation="fadeInUp"
//           delay={900}
//           style={styles.footerLinks}
//         >
//           {links?.termsUrl && (
//             <Text
//               style={styles.link}
//               onPress={() => Linking.openURL(links.termsUrl)}
//             >
//               Terms of Service
//             </Text>
//           )}
//           {links?.privacyUrl && (
//             <Text
//               style={styles.link}
//               onPress={() => Linking.openURL(links.privacyUrl)}
//             >
//               Privacy Policy
//             </Text>
//           )}
//           {links?.faqUrl && (
//             <Text
//               style={styles.link}
//               onPress={() => Linking.openURL(links.faqUrl)}
//             >
//               FAQ
//             </Text>
//           )}
//         </Animatable.View>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   contentContainer: { padding: 24, paddingBottom: 80 },
//   header: { alignItems: "center", marginBottom: 24 },
//   logo: { width: 180, height: 100, marginBottom: 16 },
//   title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
//   subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginTop: 8 },
//   section: { marginVertical: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   cardHighlight: {
//     backgroundColor: "#1976d2",
//     padding: 14,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   planTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   planDescription: { color: "#eee", marginTop: 4 },
//   benefit: { fontSize: 15, marginBottom: 6 },
//   testimonial: { marginBottom: 16 },
//   quote: { fontStyle: "italic", fontSize: 15, marginVertical: 4 },
//   name: { fontSize: 13, color: "#444" },
//   button: {
//     backgroundColor: "#1976d2",
//     padding: 14,
//     borderRadius: 6,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   outlineButton: {
//     padding: 14,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: "#1976d2",
//     alignItems: "center",
//   },
//   outlineButtonText: { color: "#1976d2", fontWeight: "600", fontSize: 16 },
//   footerLinks: {
//     marginTop: 32,
//     alignItems: "center",
//   },
//   link: {
//     color: "#1976d2",
//     fontSize: 14,
//     textDecorationLine: "underline",
//     marginBottom: 6,
//   },
// });

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to BlinqFix</Text>
        <Text style={styles.subtitle}>Instant on-demand emergency repairs</Text>
        
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300} style={styles.options}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("HomeCustomer")}
        >
          <Text style={styles.optionText}>I Need a Service Pro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButtonOutline}
          onPress={() => navigation.navigate("HomeServicePro")}
        >
          <Text style={styles.optionTextOutline}>I Am a Service Pro</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle2}>Residential & Commercial</Text>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 280,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1976d2",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 8,
    fontWeight: 700,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle2: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 48,
    fontWeight: 700,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  options: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#1976d2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  optionButtonOutline: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1976d2",
    alignItems: "center",
  },
  optionTextOutline: {
    color: "#1976d2",
    fontSize: 18,
    fontWeight: "600",
  },
});
