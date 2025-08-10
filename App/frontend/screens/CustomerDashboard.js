// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import socket from "../components/socket";
// import LogoutButton from "../components/LogoutButton";
// import ComingSoon from "../assets/coming_soon.jpeg";
// import DeleteAccountButton from "../components/DeleteAccountButton";
// import Footer from "../components/Footer";
// import ScreenWrapper from "../components/ScreenWrapper";

// const categories = [
//   {
//     name: "Plumbing",
//     img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8",
//   },
//   {
//     name: "Roofing",
//     img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8",
//   },
//   {
//     name: "HVAC",
//     img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK",
//   },
//   {
//     name: "Electrician",
//     img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8",
//   },
//   {
//     name: "Handyman",
//     img: "https://imgs.search.brave.com/Eu2EwhIULj4LyBzlme4IwxTKn3xSibta_OUu-2oN5Vo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9idWls/ZGVyLWhhbmR5bWFu/LWNvbnN0cnVjdGlv/bi10b29scy1ob3Vz/ZS1yZW5vdmF0aW9u/LWJhY2tncm91bmQt/ODk4NTUyMDQuanBn",
//   },
// ];

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.45;

// export default function CustomerDashboard() {
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [{ data: me }, { data: job }] = await Promise.all([
//           api.get("/users/me"),
//           api.get("/jobs/homeowner/active"),
//         ]);
//         setUser(me);
//         setActiveJob(job);
//       } catch (err) {
//         console.error(err);
//         await AsyncStorage.removeItem("token");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (user) {
//       Alert.alert(
//         "Tip",
//         "Select the category that best describes your emergency."
//       );
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!user?.id) return;
//     socket.emit("joinUserRoom", { userId: user.id });

//     socket.on("jobAccepted", ({ jobId }) => {
//       navigation.replace("CustomerJobStatus", { jobId });
//     });

//     return () => {
//       socket.off("jobAccepted");
//     };
//   }, [user, navigation]);

//   const firstName = user?.name?.split(" ")[0] || "Customer";

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={styles.container}>
//         <LogoutButton />

//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={{
//               width: LOGO_SIZE,
//               height: LOGO_SIZE,
//               marginHorizontal: 120,
//             }}
//             resizeMode="contain"
//           />
//           <Text style={styles.sectionTitle1}>Dashboard</Text>
//         </View>

//         <LinearGradient
//           colors={["#1976d2", "#2f80ed"]}
//           style={styles.hero}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <Text style={styles.heroText}>
//             {"\n"}Hi {firstName},{" "}
//             <Text style={styles.heroSub}>how can we help today?</Text>
//           </Text>
//           <TouchableOpacity style={styles.ctaBtn}>
//             <Text style={styles.ctaText}>
//               If this is a life-threatening emergency, call 911!
//             </Text>
//           </TouchableOpacity>
//         </LinearGradient>

//         <Text style={styles.sectionTitle}>Choose a service</Text>
//         <View style={styles.cardsWrap}>
//           {categories.map(({ name, img }) => (
//             <TouchableOpacity
//               key={name}
//               style={styles.card}
//               onPress={() =>
//                 name === "Handyman"
//                   ? navigation.navigate("HandymanCategoryScreen")
//                   : navigation.navigate("EmergencyForm", { category: name })
//               }
//             >
//               <Image
//                 source={
//                   typeof img === "string" && img.startsWith("http")
//                     ? { uri: img }
//                     : require("../assets/coming_soon.jpeg") // fallback image
//                 }
//                 style={styles.cardImg}
//               />

//               <View style={styles.cardBody}>
//                 <Text style={styles.cardLabel}>{name}</Text>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Footer />
//       </ScrollView>

//       <TouchableOpacity
//         style={{
//           backgroundColor: "#1976d2",
//           padding: 16,
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           zIndex: 999,
//         }}
//         onPress={() => navigation.navigate("MyAccountCustomer")}
//       >
//         <Text
//           style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
//         >
//           My Account
//         </Text>
//       </TouchableOpacity>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//     paddingBottom: 24,
//     marginTop: 0,
//     paddingTop: 50,
//   },
//   containerLogo: {},
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30,
//   },
//   hero: {
//     padding: 4,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32,
//     marginTop: 0,
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   ctaText: {
//     color: "red",
//     fontWeight: "600",
//     fontSize: 16,
//     textAlign: "center",
//     fontStyle: "italic",
//   },
//   sectionTitle1: {
//     color: "black",
//     textAlign: "center",
//     fontSize: 24,
//     fontWeight: 700,
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16,
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     paddingHorizontal: 8,
//   },
//   card: {
//     width: 160,
//     margin: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cardImg: { width: "100%", height: 100 },
//   cardBody: { alignItems: "center", paddingVertical: 10 },
//   cardLabel: { fontSize: 16, fontWeight: "600" },
// });

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import socket from "../components/socket";
import {
  LogOut,
  User,
  Droplets,
  Home,
  Wind,
  Zap,
  Wrench,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
} from "lucide-react-native";

const categories = [
  { name: "Plumbing", icon: Droplets, color: "#60a5fa" },
  { name: "Roofing", icon: Home, color: "#f87171" },
  { name: "HVAC", icon: Wind, color: "#67e8f9" },
  { name: "Electrician", icon: Zap, color: "#facc15" },
  { name: "Handyman", icon: Wrench, color: "#818cf8" },
  // { name: "View All Services", icon: ClipboardList, color: '#e0e7ff', fullWidth: true },
];

const { width } = Dimensions.get("window");

export default function CustomerDashboard() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [{ data: me }, { data: job }] = await Promise.all([
        api.get("/users/me"),
        api.get("/jobs/homeowner/active"),
      ]);
      setUser(me);
      setActiveJob(job);
    } catch (err) {
      console.error(err);
      await AsyncStorage.removeItem("token");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (user?.id) {
      socket.emit("joinUserRoom", { userId: user.id });
      socket.on("jobAccepted", ({ jobId }) => {
        navigation.replace("CustomerJobStatus", { jobId });
      });
      return () => {
        socket.off("jobAccepted");
      };
    }
  }, [user, navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const firstName = user?.name?.split(" ")[0] || "Customer";

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MyAccountCustomer")}
                style={styles.iconButton}
              >
                <User color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.iconButton}
              >
                <LogOut color="#f87171" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Job Card */}
          {/* {activeJob && (
            <TouchableOpacity onPress={() => navigation.navigate('CustomerJobStatus', { jobId: activeJob._id })}>
              <LinearGradient 
                colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                style={styles.activeJobCard}
              >
                <View style={styles.activeJobLeft}>
                   <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                    </View>
                  <View>
                    <Text style={styles.activeJobTitle}>Active Emergency Request</Text>
                    <Text style={styles.activeJobSubtitle}>{activeJob.service} - {activeJob.status}</Text>
                  </View>
                </View>
                <ChevronRight color="#22c55e" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          )} */}

          {/* 911 Warning */}
          <View style={styles.warningBox}>
            <AlertTriangle color="#fb923c" size={20} />
            <Text style={styles.warningText}>
              If this is a life-threatening emergency, call 911!
            </Text>
          </View>

          {/* Service Categories */}
          <Text style={styles.sectionTitle}>How can we help today?</Text>
          <View style={styles.cardsWrap}>
            {categories.map(({ name, icon: Icon, color, fullWidth }) => (
              <TouchableOpacity
                key={name}
                style={[styles.card, fullWidth && styles.fullWidthCard]}
                onPress={() =>
                  name === "Handyman"
                    ? navigation.navigate("HandymanCategoryScreen")
                    : navigation.navigate("EmergencyForm", { category: name })
                }
              >
                <View style={styles.cardContent}>
                  <Icon color={color} size={32} />
                  <Text style={styles.cardLabel}>{name}</Text>
                </View>
                {!fullWidth && (
                  <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.linksRow}>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              Privacy Policy
            </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("CustomerFAQScreen")}
            >
              FAQs
            </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("TermsAndConditions")}
            >
              Terms
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, marginTop: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "#e0e7ff",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
  },
  activeJobCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
    marginBottom: 20,
  },
  activeJobLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveIndicator: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  activeJobTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeJobSubtitle: {
    color: "#e0e7ff",
    fontSize: 14,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 146, 60, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.3)",
    marginBottom: 32,
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: "#fb923c",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  cardsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fullWidthCard: {
    width: "100%",
  },
  cardContent: {
    gap: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  linksRow: {
    padding: 16,
    position: "absolute",
    bottom: -270,
    right: 100,
    gap:24,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  link: {
    color: "#1976d2",
    textDecorationLine: "none",
    fontSize: 14,
  },
});
