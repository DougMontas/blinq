// Required libraries (install if not present):
// expo install react-native-maps expo-location

// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, ActivityIndicator } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// export default function DashboardMap() {
//   const [region, setRegion] = useState(null);
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") return;

//       const location = await Location.getCurrentPositionAsync({});
//       setRegion({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       });

//       const { data } = await api.get("/providers/nearby");
//       setProviders(data);
//       setLoading(false);
//     })();
//   }, []);

//   if (loading || !region) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

//   return (
//     <View style={styles.container}>
//       <MapView style={styles.map} initialRegion={region} showsUserLocation>
//         {providers.map((p) => (
//           <Marker
//             key={p._id}
//             coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}
//             pinColor={p.billingTier === "hybrid" ? "green" : "orange"}
//             title={p.name}
//             description={p.trade}
//           />
//         ))}
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
// });

// // For the Job Status Map
// export function JobStatusMap({ job }) {
//   const { customerLocation, providerLocation } = job;
//   const [region, setRegion] = useState(null);

//   useEffect(() => {
//     if (customerLocation && providerLocation) {
//       setRegion({
//         latitude: customerLocation.lat,
//         longitude: customerLocation.lng,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       });
//     }
//   }, [customerLocation, providerLocation]);

//   if (!region) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

//   return (
//     <MapView style={styles.map} initialRegion={region} showsUserLocation>
//       <Marker
//         coordinate={{ latitude: customerLocation.lat, longitude: customerLocation.lng }}
//         pinColor="blue"
//         title="Customer"
//       />
//       <Marker
//         coordinate={{ latitude: providerLocation.lat, longitude: providerLocation.lng }}
//         pinColor="red"
//         title="Service Provider"
//       />
//     </MapView>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// export default function DashboardMap() {
//   const [region, setRegion] = useState(null);
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     (async () => {
//       console.log("🔍 Requesting location permission...");
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         const msg = "❌ Permission to access location was denied";
//         console.warn(msg);
//         setError(msg);
//         return;
//       }

//       try {
//         const location = await Location.getCurrentPositionAsync({});
//         console.log("📍 Current location:", location.coords);
//         setRegion({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });

//         console.log("🌐 Fetching providers from /providers/active...");
//         const { data } = await api.get("/users/providers/active");
//         console.log("✅ Providers fetched:", data);
//         setProviders(data);
//       } catch (err) {
//         console.error("🚨 Error loading map or data:", err);
//         setError("Failed to load map or providers.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
//   if (error) return <Text style={{ marginTop: 20, color: "red" }}>{error}</Text>;
//   if (!region) return <Text style={{ marginTop: 20 }}>Region data missing.</Text>;

//   return (
//     <View style={styles.container}>
//       <MapView style={styles.map} initialRegion={region} showsUserLocation>
//         {providers.map((p) => {
//           const lat = p.location?.lat;
//           const lng = p.location?.lng;
//           if (lat == null || lng == null) {
//             console.warn("⚠️ Skipping provider with invalid coordinates:", p);
//             return null;
//           }

//           return (
//             <Marker
//               key={p._id?.toString?.() || Math.random().toString()}
//               coordinate={{ latitude: lat, longitude: lng }}
//               pinColor={p.billingTier === "hybrid" ? "green" : "orange"}
//               title={p.name}
//               description={p.trade}
//             />
//           );
//         })}
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
// });

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../api/client";

const SERVICE_COLORS = {
  Plumbing: "#007bff",
  HVAC: "#28a745",
  Roofing: "#ffc107",
  Electrician: "#dc3545",
  Handyman: "#6f42c1",
  Cleaning: "#20c997",
};

export default function DashboardMap() {
  const [region, setRegion] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("🔍 Requesting location permission...");
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        console.log("📍 Current location:", location.coords);

        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });

        console.log("🌐 Fetching providers from /users/providers/active...");
        const { data } = await api.get("/users/providers/active");
        console.log("✅ Providers fetched:", data);
        setProviders(data);
      } catch (err) {
        console.error("🚨 Error loading map or data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !region) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation>
        {providers.map((p) => {
          if (!p.position || p.position.length !== 2) {
            console.warn("⚠️ Skipping provider with invalid coordinates:", p);
            return null;
          }

          const [latitude, longitude] = p.position;
          return (
            <Marker
              key={p.id?.toString() || Math.random().toString()}
              coordinate={{ latitude, longitude }}
              pinColor={SERVICE_COLORS[p.serviceType] || "blue"}
              title={p.name}
              description={p.serviceType}
            />
          );
        })}
      </MapView>
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        {Object.entries(SERVICE_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legendContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  legendTitle: { fontWeight: "bold", marginBottom: 4 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
});
