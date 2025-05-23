// // screens/ServiceProvidersMap.js
// import React, { useState, useEffect } from "react";
// import { View, ActivityIndicator, StyleSheet } from "react-native";
// // import MapView, { Marker } from "react-native-maps";
// import api from "../api/client";

// export default function ServiceProvidersMap({ route }) {
//   const { serviceType, zipcode } = route.params;
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         // Adjust this endpoint to match your backend
//         const { data } = await api.get(
//           `/providers?serviceType=${encodeURIComponent(serviceType)}&zipcode=${encodeURIComponent(zipcode)}`
//         );
//         setProviders(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [serviceType, zipcode]);

//   if (loading) return <ActivityIndicator style={styles.center} />;
//   if (providers.length === 0)
//     return <View style={styles.center}><Text>No providers found.</Text></View>;

//   // center on first provider
//   const first = providers[0].location; // { lat, lng }
//   const initialRegion = {
//     latitude: first.lat,
//     longitude: first.lng,
//     latitudeDelta: 0.1,
//     longitudeDelta: 0.1,
//   };

//   return (
//     <MapView style={styles.map} initialRegion={initialRegion}>
//       {providers.map((p) => (
//         <Marker
//           key={p._id}
//           coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}
//           title={p.name}
//           pinColor="blue"
//         />
//       ))}
//     </MapView>
//   );
// }

// const styles = StyleSheet.create({
//   map: { flex: 1 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
