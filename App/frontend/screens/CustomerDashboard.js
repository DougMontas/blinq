//working
// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Alert,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import socket from "../components/socket";
// import {
//   LogOut,
//   User,
//   Droplets,
//   Home,
//   Wind,
//   Zap,
//   Wrench,
//   AlertTriangle,
//   ChevronRight,
//   ClipboardList,
// } from "lucide-react-native";
// import Footer from "../components/Footer";

// const categories = [
//   { name: "Plumbing", icon: Droplets, color: "#60a5fa" },
//   { name: "Roofing", icon: Home, color: "#f87171" },
//   { name: "HVAC", icon: Wind, color: "#67e8f9" },
//   { name: "Electrician", icon: Zap, color: "#facc15" },
//   { name: "Handyman", icon: Wrench, color: "#818cf8" },
//   // { name: "View All Services", icon: ClipboardList, color: '#e0e7ff', fullWidth: true },
// ];

// const { width } = Dimensions.get("window");

// export default function CustomerDashboard() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [{ data: me }, { data: job }] = await Promise.all([
//         api.get("/users/me"),
//         api.get("/jobs/homeowner/active"),
//       ]);
//       setUser(me);
//       setActiveJob(job);
//     } catch (err) {
//       console.error(err);
//       await AsyncStorage.removeItem("token");
//       navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) {
//       fetchData();
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     if (user?.id) {
//       socket.emit("joinUserRoom", { userId: user.id });
//       socket.on("jobAccepted", ({ jobId }) => {
//         navigation.replace("CustomerJobStatus", { jobId });
//       });
//       return () => {
//         socket.off("jobAccepted");
//       };
//     }
//   }, [user, navigation]);

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem("token");
//     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//   };

//   const firstName = user?.name?.split(" ")[0] || "Customer";

//   if (loading) {
//     return (
//       <LinearGradient
//         colors={["#0f172a", "#1e3a8a", "#312e81"]}
//         style={styles.centered}
//       >
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#1e3a8a", "#312e81"]}
//       style={styles.container}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View>
//               <Text style={styles.welcomeText}>Welcome back,</Text>
//               <Text style={styles.userName}>{firstName}</Text>
//             </View>
//             <View style={styles.headerIcons}>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("MyAccountCustomer")}
//                 style={styles.iconButton}
//               >
//                 <User color="#fff" size={24} />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleLogout}
//                 style={styles.iconButton}
//               >
//                 <LogOut color="#f87171" size={24} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Active Job Card */}
//           {/* {activeJob && (
//             <TouchableOpacity onPress={() => navigation.navigate('CustomerJobStatus', { jobId: activeJob._id })}>
//               <LinearGradient 
//                 colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
//                 style={styles.activeJobCard}
//               >
//                 <View style={styles.activeJobLeft}>
//                    <View style={styles.liveIndicator}>
//                       <View style={styles.liveDot} />
//                     </View>
//                   <View>
//                     <Text style={styles.activeJobTitle}>Active Emergency Request</Text>
//                     <Text style={styles.activeJobSubtitle}>{activeJob.service} - {activeJob.status}</Text>
//                   </View>
//                 </View>
//                 <ChevronRight color="#22c55e" size={24} />
//               </LinearGradient>
//             </TouchableOpacity>
//           )} */}

//           {/* 911 Warning */}
//           <View style={styles.warningBox}>
//             <AlertTriangle color="#fb923c" size={20} />
//             <Text style={styles.warningText}>
//               If this is a life-threatening emergency, call 911!
//             </Text>
//           </View>

//           {/* Service Categories */}
//           <Text style={styles.sectionTitle}>How can we help today?</Text>
//           <View style={styles.cardsWrap}>
//             {categories.map(({ name, icon: Icon, color, fullWidth }) => (
//               <TouchableOpacity
//                 key={name}
//                 style={[styles.card, fullWidth && styles.fullWidthCard]}
//                 onPress={() =>
//                   name === "Handyman"
//                     ? navigation.navigate("HandymanCategoryScreen")
//                     : navigation.navigate("EmergencyForm", { category: name })
//                 }
//               >
//                 <View style={styles.cardContent}>
//                   <Icon color={color} size={32} />
//                   <Text style={styles.cardLabel}>{name}</Text>
//                 </View>
//                 {!fullWidth && (
//                   <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Footer />
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, marginTop: 40 },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   welcomeText: {
//     fontSize: 18,
//     color: "#e0e7ff",
//   },
//   userName: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   headerIcons: {
//     flexDirection: "row",
//     gap: 16,
//   },
//   iconButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//   },
//   activeJobCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(34, 197, 94, 0.5)",
//     marginBottom: 20,
//   },
//   activeJobLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   liveIndicator: {
//     width: 12,
//     height: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   liveDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#22c55e",
//   },
//   activeJobTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   activeJobSubtitle: {
//     color: "#e0e7ff",
//     fontSize: 14,
//   },
//   warningBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(251, 146, 60, 0.1)",
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(251, 146, 60, 0.3)",
//     marginBottom: 32,
//     gap: 12,
//   },
//   warningText: {
//     flex: 1,
//     color: "#fb923c",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   card: {
//     width: (width - 60) / 2,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     marginBottom: 20,
//     padding: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   fullWidthCard: {
//     width: "100%",
//   },
//   cardContent: {
//     gap: 12,
//   },
//   cardLabel: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   linksRow: {
//     padding: 16,
//     position: "absolute",
//     bottom: -10,
//     right: 100,
//     gap: 24,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 20,
//   },
//   link: {
//     color: "#1976d2",
//     textDecorationLine: "none",
//     fontSize: 14,
//   },
// });

//Added all categories >> 
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Alert,
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
  Key,
  Scissors,
  Car,
  Bug,
  Paintbrush,
  Leaf,
  Tv,
  Wifi,
  Shield,
  Hammer,
} from "lucide-react-native";
import Footer from "../components/Footer";

const { width } = Dimensions.get("window");

// Master category list (umbrella + direct service categories)
const categories = [
  { name: "Plumbing", icon: Droplets, color: "#60a5fa" },
  { name: "Roofing", icon: Home, color: "#f87171" },
  { name: "HVAC", icon: Wind, color: "#67e8f9" },
  { name: "Electrician", icon: Zap, color: "#facc15" },
  { name: "Handyman", icon: Wrench, color: "#818cf8", nested: true },
  { name: "Locksmith", icon: Key, color: "#fbbf24" },
  { name: "Cleaning", icon: Scissors, color: "#f472b6" },
  { name: "Auto", icon: Car, color: "#93c5fd" },
  { name: "Pest Control", icon: Bug, color: "#22c55e" },
  { name: "Painting", icon: Paintbrush, color: "#e879f9" },
  { name: "Flooring", icon: Home, color: "#f59e0b" },
  { name: "Landscaping", icon: Leaf, color: "#34d399" },
  { name: "Smart Home", icon: Tv, color: "#a78bfa" },
  { name: "IT Services", icon: Wifi, color: "#38bdf8" },
  { name: "Water & Mold Remediation", icon: Droplets, color: "#06b6d4" },
  { name: "Remodeling", icon: Hammer, color: "#fb7185" },
  { name: "Environmental", icon: Shield, color: "#22d3ee" },
  // Optional "All services" catch-all
  // { name: "View All Services", icon: ClipboardList, color: "#e0e7ff", fullWidth: true },
];

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
    if (isFocused) fetchData();
  }, [isFocused]);

  useEffect(() => {
    if (user?.id) {
      socket.emit("joinUserRoom", { userId: user.id });
      socket.on("jobAccepted", ({ jobId }) => {
        navigation.replace("CustomerJobStatus", { jobId });
      });
      return () => socket.off("jobAccepted");
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
              <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <LogOut color="#f87171" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 911 Warning */}
          <View style={styles.warningBox}>
            <AlertTriangle color="#fb923c" size={20} />
            <Text style={styles.warningText}>
              If this is a life-threatening emergency, call 911!
            </Text>
          </View>

          {/* Categories */}
          <Text style={styles.sectionTitle}>How can we help today?</Text>
          <View style={styles.cardsWrap}>
            {categories.map(({ name, icon: Icon, color, fullWidth, nested }) => (
              <TouchableOpacity
                key={name}
                style={[styles.card, fullWidth && styles.fullWidthCard]}
                onPress={() =>
                  nested
                    ? navigation.navigate("HandymanCategoryScreen", { category: name })
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

          <Footer />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, marginTop: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 18, color: "#e0e7ff" },
  userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerIcons: { flexDirection: "row", gap: 16 },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
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
    textAlign: "center",
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
  fullWidthCard: { width: "100%" },
  cardContent: { gap: 12 },
  cardLabel: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});

