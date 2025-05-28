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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import socket from "../components/socket";
import LogoutButton from "../components/LogoutButton";
import ComingSoon from "../assets/coming_soon.jpeg";

const SUBCATEGORIES = [
  {
    label: "Drywall Repair",
    img: "https://th.bing.com/th/id/OIP.OFn-yBhr0crvKmLPd7ZP-gHaE7?w=260&h=180&c=7&r=0&o=5&dpr=2&pid=1.7", // valid image
  },
  {
    label: "Furniture Assembly",
    img: ComingSoon,
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
const LOGO_SIZE = width * 0.25;

export default function HandymanCategoryScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

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

    return () => {
      socket.off("jobAccepted");
    };
  }, [user, navigation]);

  const firstName = user?.name?.split(" ")[0] || "Customer";

  const handleSelect = (subcategory) => {
    navigation.navigate("EmergencyForm", {
      category: "Handyman",
      subcategory, // passed into EmergencyForm for direct estimate
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LogoutButton />

      <LinearGradient
        colors={["#1976d2", "#2f80ed"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroText}>
          <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                marginHorizontal: 120,
              }}
              resizeMode="contain"
            />
          </View>
          {"\n"}
          Hi {firstName},{" "}
          <Text style={styles.heroSub}>
            What kind of handyman work do you need?
          </Text>
        </Text>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>
            If this is a life-threatening emergency, call 911!
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Choose a Handyman Specialist</Text>
      <View style={styles.cardsWrap}>
        {SUBCATEGORIES.map(({ label, img }) => {
          const isEnabled = label === "Drywall Repair";

          return (
            <TouchableOpacity
              key={label}
              style={[styles.card, !isEnabled && styles.disabledCard]}
              onPress={() => {
                if (isEnabled) {
                  handleSelect(label);
                } else {
                  Alert.alert("Coming Soon", `${label} is not yet available.`);
                }
              }}
            >
              <Image
                source={{ uri: img }}
                style={[
                  styles.cardImg,
                  !isEnabled && { opacity: 0.4 }, // fade image if disabled
                ]}
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>
                  {label}
                  {!isEnabled && " (Coming Soon)"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
  containerLogo: {},
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 30,
  },
  hero: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  heroText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 32,
  },
  heroSub: { fontWeight: "400" },
  ctaBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
  },
  cardsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  card: {
    width: 160,
    margin: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  cardImg: { width: "100%", height: 100 },
  cardBody: { alignItems: "center", paddingVertical: 10 },
  cardLabel: { fontSize: 16, fontWeight: "600" },
});
