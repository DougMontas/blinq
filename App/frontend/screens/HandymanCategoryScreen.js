import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  LogOut,
  Wrench,
  AlertTriangle,
  Zap,
  User,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import socket from "../components/socket";

const SUBCATEGORIES = [
  {
    label: "Drywall Repair",
    img: "https://th.bing.com/th/id/OIP.OFn-yBhr0crvKmLPd7ZP-gHaE7?w=260&h=180&c=7&r=0&o=5&dpr=2&pid=1.7",
  },
  {
    label: "Furniture Assembly",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  },
  {
    label: "Mounting & Hanging",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  },
  {
    label: "Minor Plumbing",
    img: "https://images.unsplash.com/photo-1562440499-64e2123f2cf2",
  },
  {
    label: "Minor Electrical",
    img: "https://images.unsplash.com/photo-1581091215367-59cf0a0b16f9",
  },
  {
    label: "Appliance Installation",
    img: "https://images.unsplash.com/photo-1590595901608-2b5e6e7dc9ff",
  },
];

const { width } = Dimensions.get("window");

export default function HandymanCategoryScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep all original backend logic exactly the same
  useEffect(() => {
    (async () => {
      try {
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
    })();
  }, []);

  useEffect(() => {
    if (user) {
      Alert.alert("Tip", "Select the handyman task you need help with.");
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("joinUserRoom", { userId: user.id });
    socket.on("jobAccepted", ({ jobId }) => {
      navigation.replace("CustomerJobStatus", { jobId });
    });
    return () => socket.off("jobAccepted");
  }, [user, navigation]);

  const firstName = user?.name?.split(" ")[0] || "Customer";

  const handleSelect = (subcategory) => {
    navigation.navigate("EmergencyForm", {
      category: "Handyman",
      subcategory,
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading handyman services...</Text>
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <Wrench color="#facc15" size={16} />
                <Text style={styles.headerBadgeText}>Handyman Services</Text>
              </View>
              <Text style={styles.headerTitle}>Choose Your Service</Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut color="#f87171" size={24} />
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
              style={styles.heroGradient}
            >
              <View style={styles.heroHeader}>
                <View style={styles.profileIcon}>
                  <User color="#22c55e" size={24} />
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.heroGreeting}>Hi {firstName}!</Text>
                  <Text style={styles.heroSubtext}>
                    What kind of handyman work do you need?
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Emergency Warning */}
          <View style={styles.warningCard}>
            <LinearGradient
              colors={["rgba(251, 146, 60, 0.15)", "rgba(234, 88, 12, 0.05)"]}
              style={styles.warningGradient}
            >
              <AlertTriangle color="#fb923c" size={20} />
              <Text style={styles.warningText}>
                If this is a life-threatening emergency, call 911!
              </Text>
            </LinearGradient>
          </View>

          {/* Active Job Alert */}
          {/* {activeJob && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('CustomerJobStatus', { jobId: activeJob._id })}
              style={styles.activeJobCard}
            >
              <LinearGradient
                colors={['rgba(96, 165, 250, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                style={styles.activeJobGradient}
              >
                <View style={styles.activeJobLeft}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                  </View>
                  <View>
                    <Text style={styles.activeJobTitle}>Active Request</Text>
                    <Text style={styles.activeJobSubtitle}>Tap to view status</Text>
                  </View>
                </View>
                <ChevronRight color="#60a5fa" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          )} */}

          {/* Service Categories */}
          <Text style={styles.sectionTitle}>Select Your Handyman Task</Text>
          <View style={styles.cardsContainer}>
            {SUBCATEGORIES.map(({ label, img }) => {
              const isEnabled = label === "Drywall Repair";
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.card, !isEnabled && styles.disabledCard]}
                  onPress={() =>
                    isEnabled
                      ? handleSelect(label)
                      : Alert.alert(
                          "Coming Soon",
                          `${label} is not yet available.`
                        )
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: img }}
                      style={[styles.cardImage, !isEnabled && { opacity: 0.4 }]}
                    />
                    {isEnabled && (
                      <View style={styles.availableBadge}>
                        <Zap color="#22c55e" size={12} />
                        <Text style={styles.availableText}>Available</Text>
                      </View>
                    )}
                    {!isEnabled && (
                      <View style={styles.comingSoonBadge}>
                        <Clock color="#fb923c" size={12} />
                        <Text style={styles.comingSoonText}>Soon</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        !isEnabled && styles.disabledCardTitle,
                      ]}
                    >
                      {label}
                    </Text>
                    {isEnabled && <ChevronRight color="#60a5fa" size={16} />}
                  </View>
                </TouchableOpacity>
              );
            })}
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
    marginTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
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
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroGradient: {
    padding: 20,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 16,
    color: "#e0e7ff",
    lineHeight: 22,
  },
  warningCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  warningGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: "#fb923c",
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
  },
  activeJobCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  activeJobGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
    backgroundColor: "#60a5fa",
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  cardsContainer: {
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
    overflow: "hidden",
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardImageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  availableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availableText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 146, 60, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  comingSoonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  disabledCardTitle: {
    color: "#94a3b8",
  },
});
