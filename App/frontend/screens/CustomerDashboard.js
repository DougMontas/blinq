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
//   // {
//   //   name: "Locksmith",
//   //   img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7",
//   // },
//   // {
//   //   name: "Cleaning",
//   //   img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg",
//   // },
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
//     <ScrollView contentContainerStyle={styles.container}>
//       <LogoutButton />

//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{
//             width: LOGO_SIZE,
//             height: LOGO_SIZE,
//             marginHorizontal: 120,
//           }}
//           resizeMode="contain"
//         />
//         <Text style={styles.sectionTitle1}>Dashboard</Text>
//       </View>

//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.hero}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Text style={styles.heroText}>

//           {"\n"}
//           Hi {firstName},{" "}
//           <Text style={styles.heroSub}>how can we help today?</Text>
//         </Text>
//         <TouchableOpacity style={styles.ctaBtn}>
//           <Text style={styles.ctaText}>
//             If this is a life-threatening emergency, call 911!
//           </Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       <Text style={styles.sectionTitle}>Choose a service</Text>
//       <View style={styles.cardsWrap}>
//         {categories.map(({ name, img }) => (
//           <TouchableOpacity
//             key={name}
//             style={styles.card}
//             onPress={() =>
//               name === "Handyman"
//                 ? navigation.navigate("HandymanCategoryScreen")
//                 : navigation.navigate("EmergencyForm", { category: name })
//             }
//           >

//             <Image
//               source={
//                 typeof img === "string" && img.startsWith("http")
//                   ? { uri: img }
//                   : ""
//               }
//               style={styles.cardImg}
//             />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{name}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//       <Footer />

//       {/* <DeleteAccountButton /> */}

//       <View style={{ height: 40, marginVertical: 50 }} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 0, paddingTop: 50 },
//   containerLogo: {},
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30,
//   },
//   hero: {
//     padding: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
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
//     fontWeight: 700
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16,
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
import DeleteAccountButton from "../components/DeleteAccountButton";
import Footer from "../components/Footer";

const categories = [
  {
    name: "Plumbing",
    img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8",
  },
  {
    name: "Roofing",
    img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8",
  },
  {
    name: "HVAC",
    img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK",
  },
  {
    name: "Electrician",
    img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8",
  },
  {
    name: "Handyman",
    img: "https://imgs.search.brave.com/Eu2EwhIULj4LyBzlme4IwxTKn3xSibta_OUu-2oN5Vo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9idWls/ZGVyLWhhbmR5bWFu/LWNvbnN0cnVjdGlv/bi10b29scy1ob3Vz/ZS1yZW5vdmF0aW9u/LWJhY2tncm91bmQt/ODk4NTUyMDQuanBn",
  },
];

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.45;

export default function CustomerDashboard() {
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
      Alert.alert(
        "Tip",
        "Select the category that best describes your emergency."
      );
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
        <Text style={styles.sectionTitle1}>Dashboard</Text>
      </View>

      <LinearGradient
        colors={["#1976d2", "#2f80ed"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroText}>
          {"\n"}Hi {firstName},{" "}
          <Text style={styles.heroSub}>how can we help today?</Text>
        </Text>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>
            If this is a life-threatening emergency, call 911!
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Choose a service</Text>
      <View style={styles.cardsWrap}>
        {categories.map(({ name, img }) => (
          <TouchableOpacity
            key={name}
            style={styles.card}
            onPress={() =>
              name === "Handyman"
                ? navigation.navigate("HandymanCategoryScreen")
                : navigation.navigate("EmergencyForm", { category: name })
            }
          >
            <Image
              source={
                typeof img === "string" && img.startsWith("http")
                  ? { uri: img }
                  : require("../assets/coming_soon.jpeg") // fallback image
              }
              style={styles.cardImg}
            />

            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Footer />

      {/* ✅ Add "My Account" button at the bottom for customers */}
      <TouchableOpacity
        style={{
          backgroundColor: "#1976d2",
          padding: 16,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
        onPress={() => navigation.navigate("MyAccountCustomer")}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          My Account
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40, marginVertical: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingBottom: 24,
    marginTop: 0,
    paddingTop: 50,
  },
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
  sectionTitle1: {
    color: "black",
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
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
