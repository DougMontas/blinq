// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import api from "../api/client";

// const SERVICE_COLORS = {
//   Plumbing: "#007bff",
//   HVAC: "#28a745",
//   Roofing: "#ffc107",
//   Electrician: "#dc3545",
//   Handyman: "#6f42c1",
//   Cleaning: "#20c997",
// };

// export default function ProviderMapDashboard() {
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const { data } = await api.get("/routes/providers/active");
//         setProviders(data);
//       } catch (err) {
//         console.error("Failed to fetch providers:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProviders();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <MapView
//         style={{ flex: 1 }}
//         initialRegion={{
//           latitude: 25.7617,
//           longitude: -80.1918,
//           latitudeDelta: 0.5,
//           longitudeDelta: 0.5,
//         }}
//       >
//         {providers.map((p) => (
//           <Marker
//             key={p._id}
//             coordinate={{
//               latitude: p.location?.lat || 0,
//               longitude: p.location?.lng || 0,
//             }}
//             pinColor={SERVICE_COLORS[p.serviceType] || "blue"}
//             title={p.name}
//             description={p.serviceType}
//           />
//         ))}
//       </MapView>
//       <View style={styles.legendContainer}>
//         <Text style={styles.legendTitle}>Legend</Text>
//         {Object.entries(SERVICE_COLORS).map(([type, color]) => (
//           <View key={type} style={styles.legendRow}>
//             <View style={[styles.legendColor, { backgroundColor: color }]} />
//             <Text>{type}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   legendContainer: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     backgroundColor: "white",
//     padding: 8,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   legendTitle: { fontWeight: "bold", marginBottom: 4 },
//   legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
//   legendColor: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     marginRight: 6,
//   },
// });

// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import api from "../api/client";

// const SERVICE_COLORS = {
//   Plumbing: "#007bff",
//   HVAC: "#28a745",
//   Roofing: "#ffc107",
//   Electrician: "#dc3545",
//   Handyman: "#6f42c1",
//   Cleaning: "#20c997",
// };

// export default function ProviderMapDashboard() {
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const { data } = await api.get("/routes/providers");
//         setProviders(data);
//       } catch (err) {
//         console.error("Failed to fetch providers:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProviders();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <MapView
//         style={{ flex: 1 }}
//         initialRegion={{
//           latitude: 25.7617,
//           longitude: -80.1918,
//           latitudeDelta: 0.5,
//           longitudeDelta: 0.5,
//         }}
//       >
//         {providers.map((p) => {
//           if (!p.location || p.location.lat == null || p.location.lng == null) return null;

//           return (
//             <Marker
//               key={p._id}
//               coordinate={{
//                 latitude: p.location.lat,
//                 longitude: p.location.lng,
//               }}
//               pinColor={SERVICE_COLORS[p.serviceType] || "blue"}
//               title={p.name}
//               description={p.serviceType}
//             />
//           );
//         })}
//       </MapView>
//       <View style={styles.legendContainer}>
//         <Text style={styles.legendTitle}>Legend</Text>
//         {Object.entries(SERVICE_COLORS).map(([type, color]) => (
//           <View key={type} style={styles.legendRow}>
//             <View style={[styles.legendColor, { backgroundColor: color }]} />
//             <Text>{type}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   legendContainer: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     backgroundColor: "white",
//     padding: 8,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   legendTitle: { fontWeight: "bold", marginBottom: 4 },
//   legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
//   legendColor: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     marginRight: 6,
//   },
// });


// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import api from "../api/client";

// const SERVICE_COLORS = {
//   Plumbing: "#007bff",
//   HVAC: "#28a745",
//   Roofing: "#ffc107",
//   Electrician: "#dc3545",
//   Handyman: "#6f42c1",
//   Cleaning: "#20c997",
// };

// export default function ProviderMapDashboard() {
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const { data } = await api.get("/users/providers/active");
//         // Normalize location data
//         const mapped = data.map((p) => {
//           const [lng, lat] = p.location?.coordinates || [];
//           return {
//             ...p,
//             location: lat != null && lng != null ? { lat, lng } : null,
//           };
//         });
//         setProviders(mapped);
//       } catch (err) {
//         console.error("Failed to fetch providers:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProviders();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <MapView
//         style={{ flex: 1 }}
//         initialRegion={{
//           latitude: 25.7617,
//           longitude: -80.1918,
//           latitudeDelta: 0.5,
//           longitudeDelta: 0.5,
//         }}
//       >
//         {providers.map((p) => {
//           if (!p.location || p.location.lat == null || p.location.lng == null) return null;

//           return (
//             <Marker
//               key={p._id?.toString() || `${p.name}-${p.serviceType}`}
//               coordinate={{
//                 latitude: p.location.lat,
//                 longitude: p.location.lng,
//               }}
//               pinColor={SERVICE_COLORS[p.serviceType] || "blue"}
//               title={p.name}
//               description={p.serviceType}
//             />
//           );
//         })}
//       </MapView>
//       <View style={styles.legendContainer}>
//         <Text style={styles.legendTitle}>Legend</Text>
//         {Object.entries(SERVICE_COLORS).map(([type, color]) => (
//           <View key={type} style={styles.legendRow}>
//             <View style={[styles.legendColor, { backgroundColor: color }]} />
//             <Text>{type}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   legendContainer: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     backgroundColor: "white",
//     padding: 8,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   legendTitle: { fontWeight: "bold", marginBottom: 4 },
//   legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
//   legendColor: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     marginRight: 6,
//   },
// });


import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
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

export default function ProviderMapDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialRegion, setInitialRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });

      try {
        const { data } = await api.get("/users/providers/active");
        setProviders(data);
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !initialRegion) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {providers.map((p) => {
          const lat = p.location?.lat;
          const lng = p.location?.lng;

          if (typeof lat !== "number" || typeof lng !== "number") return null;

          return (
            <Marker
              key={p._id?.toString()}
              coordinate={{ latitude: lat, longitude: lng }}
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
