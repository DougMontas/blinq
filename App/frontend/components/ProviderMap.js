// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, Text } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import axios from "axios";

// const SERVICE_COLORS = {
//   Plumbing: "#2196F3",
//   Electrician: "#FFC107",
//   HVAC: "#4CAF50",
//   Roofing: "#FF5722",
//   Handyman: "#9C27B0",
//   Cleaning: "#009688",
// };

// export default function ProviderMap() {
//   const [providers, setProviders] = useState([]);

//   useEffect(() => {
//     axios.get("/api/users/all-providers").then((res) => {
//       setProviders(res.data || []);
//     });
//   }, []);

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         provider={PROVIDER_GOOGLE}
//         showsUserLocation
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
//               latitude: p.location?.lat || 25.76,
//               longitude: p.location?.lng || -80.19,
//             }}
//             pinColor={SERVICE_COLORS[p.trade] || "#666"}
//             title={p.name}
//             description={p.trade}
//           />
//         ))}
//       </MapView>
//       <View style={styles.legend}>
//         {Object.entries(SERVICE_COLORS).map(([trade, color]) => (
//           <View key={trade} style={styles.legendRow}>
//             <View style={[styles.legendColor, { backgroundColor: color }]} />
//             <Text style={styles.legendLabel}>{trade}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   legend: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
//   legendColor: { width: 16, height: 16, marginRight: 6, borderRadius: 2 },
//   legendLabel: { fontSize: 14 },
// });


// import React, { useEffect, useState, useRef } from "react";
// import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const currentLoc = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setProviderLocation(currentLoc);

//       // Geocode customer address
//       const coords = await geocodeAddress(customerAddress);
//       setCustomerCoords(coords);

//       if (coords) {
//         fetchRoute(currentLoc, coords);
//       }

//       watcher = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (newLoc) => {
//           const coords = {
//             latitude: newLoc.coords.latitude,
//             longitude: newLoc.coords.longitude,
//           };
//           setProviderLocation(coords);
//           if (customerCoords) fetchRoute(coords, customerCoords);
//           mapRef.current?.animateCamera({
//             center: coords,
//             zoom: 16,
//             heading: 0,
//             pitch: 0,
//           });
//         }
//       );
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress]);

//   const geocodeAddress = async (address) => {
//     try {
//       const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
//       );
//       if (res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&key=${apiKey}`
//       );

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0, len = t.length;
//     let lat = 0, lng = 0;
//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         region={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsTraffic
//         showsScale
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         toolbarEnabled
//         showsCompass
//       >
//         <Marker coordinate={providerLocation} title="Service Pro">
//           <Image
//             source={require("../assets/driver_marker.png")}
//             style={styles.driverMarker}
//           />
//         </Marker>
//         <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>ETA: {duration} | Distance: {distance}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: Dimensions.get("window").height,
//   },
//   driverMarker: {
//     width: 40,
//     height: 40,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

// // //need api fixed
// import React, { useEffect, useState, useRef } from "react";
// import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";
// import Constants from "expo-constants";


// const { width, height } = Dimensions.get("window");


// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const currentLoc = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setProviderLocation(currentLoc);

//       const coords = await geocodeAddress(customerAddress);
//       setCustomerCoords(coords);

//       if (coords) {
//         fetchRoute(currentLoc, coords);
//       }

//       watcher = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (newLoc) => {
//           const coords = {
//             latitude: newLoc.coords.latitude,
//             longitude: newLoc.coords.longitude,
//           };
//           setProviderLocation(coords);
//           if (customerCoords) fetchRoute(coords, customerCoords);
//           mapRef.current?.animateCamera({
//             center: coords,
//             zoom: 16,
//             heading: 0,
//             pitch: 0,
//           });
//         }
//       );
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress]);

//   const geocodeAddress = async (address) => {
//     try {
//       // const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
//       const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
//       );
//       if (res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       // const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
//       const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&key=${apiKey}`
//       );

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0, len = t.length;
//     let lat = 0, lng = 0;
//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           ...providerLocation,
//           latitudeDelta: 0.03,
//           longitudeDelta: 0.03,
//         }}
//         showsUserLocation
//         showsTraffic
//         showsScale
//         zoomControlEnabled
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         toolbarEnabled
//         showsCompass
//       >
//         <Marker coordinate={providerLocation} title="Service Pro">
//           <Image
//             source={require("../assets/driver_marker.png")}
//             style={styles.driverMarker}
//           />
//         </Marker>
//         <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>ETA: {duration} | Distance: {distance}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: "100%",
//     height: "100%",
//   },
//   driverMarker: {
//     width: 40,
//     height: 40,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });


// import React, { useEffect, useState, useRef } from "react";
// import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const currentLoc = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setProviderLocation(currentLoc);

//       // Geocode customer address from backend
//       const coords = await geocodeAddress(customerAddress);
//       setCustomerCoords(coords);

//       if (coords) {
//         fetchRoute(currentLoc, coords);
//       }

//       watcher = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (newLoc) => {
//           const coords = {
//             latitude: newLoc.coords.latitude,
//             longitude: newLoc.coords.longitude,
//           };
//           setProviderLocation(coords);
//           if (customerCoords) fetchRoute(coords, customerCoords);
//           mapRef.current?.animateCamera({
//             center: coords,
//             zoom: 16,
//             heading: 0,
//             pitch: 0,
//           });
//         }
//       );
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress]);

//   const geocodeAddress = async (address) => {
//     try {
//       const res = await api.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
//       if (res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const originStr = `${origin.latitude},${origin.longitude}`;
//       const destStr = `${dest.latitude},${dest.longitude}`;
//       const response = await api.get(`/maps/directions?origin=${originStr}&destination=${destStr}`);

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0, len = t.length;
//     let lat = 0, lng = 0;
//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         region={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsTraffic
//         showsScale
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         toolbarEnabled
//         showsCompass
//       >
//         <Marker coordinate={providerLocation} title="Service Pro">
//           <Image
//             source={require("../assets/driver_marker.png")}
//             style={styles.driverMarker}
//           />
//         </Marker>
//         <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>ETA: {duration} | Distance: {distance}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: Dimensions.get("window").height,
//   },
//   driverMarker: {
//     width: 40,
//     height: 40,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

// import React, { useEffect, useState, useRef } from "react";
// import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const currentLoc = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setProviderLocation(currentLoc);

//       // Geocode customer address from backend
//       const coords = await geocodeAddress(customerAddress);
//       setCustomerCoords(coords);

//       if (coords) {
//         fetchRoute(currentLoc, coords);
//       }

//       watcher = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (newLoc) => {
//           const coords = {
//             latitude: newLoc.coords.latitude,
//             longitude: newLoc.coords.longitude,
//           };
//           setProviderLocation(coords);
//           if (customerCoords) fetchRoute(coords, customerCoords);
//           mapRef.current?.animateCamera({
//             center: coords,
//             zoom: 16,
//             heading: 0,
//             pitch: 0,
//           });
//         }
//       );
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress]);

//   const geocodeAddress = async (address) => {
//     try {
//       const res = await api.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
//       if (res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const originStr = `${origin.latitude},${origin.longitude}`;
//       const destStr = `${dest.latitude},${dest.longitude}`;
//       const response = await api.get(`/maps/directions?origin=${originStr}&destination=${destStr}`);

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0, len = t.length;
//     let lat = 0, lng = 0;
//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         region={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsTraffic
//         showsScale
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         toolbarEnabled
//         showsCompass
//       >
//         <Marker coordinate={providerLocation} title="Service Pro">
//           <Image
//             source={require("../assets/driver_marker.png")}
//             style={styles.driverMarker}
//           />
//         </Marker>
//         <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>ETA: {duration} | Distance: {distance}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: Dimensions.get("window").height,
//   },
//   driverMarker: {
//     width: 40,
//     height: 40,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

// import React, { useEffect, useState, useRef } from "react";
// import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from "react-native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const currentLoc = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setProviderLocation(currentLoc);

//       const coords = await geocodeAddress(customerAddress);
//       setCustomerCoords(coords);

//       if (coords) {
//         fetchRoute(currentLoc, coords);
//       }

//       watcher = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (newLoc) => {
//           const coords = {
//             latitude: newLoc.coords.latitude,
//             longitude: newLoc.coords.longitude,
//           };
//           setProviderLocation(coords);
//           if (customerCoords) fetchRoute(coords, customerCoords);
//           mapRef.current?.animateCamera({ center: coords });
//         }
//       );
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress]);

//   const geocodeAddress = async (address) => {
//     try {
//       const res = await api.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
//       if (res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const originStr = `${origin.latitude},${origin.longitude}`;
//       const destStr = `${dest.latitude},${dest.longitude}`;
//       const response = await api.get(`/maps/directions?origin=${originStr}&destination=${destStr}`);

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0, len = t.length;
//     let lat = 0, lng = 0;
//     while (index < len) {
//       let b, shift = 0, result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsTraffic
//         zoomControlEnabled
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         showsCompass
//       >
//         <Marker coordinate={providerLocation} title="Service Pro">
//           <Image
//             source={require("../assets/driver_marker.png")}
//             style={styles.driverMarker}
//           />
//         </Marker>
//         <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>ETA: {duration} | Distance: {distance}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: height,
//   },
//   driverMarker: {
//     width: 50,
//     height: 50,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Image,
//   Platform,
// } from "react-native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [mapReady, setMapReady] = useState(false);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       try {
//         console.log("Requesting location permissions...");
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           alert("Permission to access location was denied");
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({});
//         const currentLoc = {
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         };
//         console.log("Provider location:", currentLoc);
//         setProviderLocation(currentLoc);

//         console.log("Geocoding customer address:", customerAddress);
//         const coords = await geocodeAddress(customerAddress);
//         console.log("Customer coordinates:", coords);
//         setCustomerCoords(coords);

//         if (coords) {
//           fetchRoute(currentLoc, coords);
//         }

//         watcher = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 5000,
//             distanceInterval: 10,
//           },
//           (newLoc) => {
//             const coords = {
//               latitude: newLoc.coords.latitude,
//               longitude: newLoc.coords.longitude,
//             };
//             console.log("Updated provider location:", coords);
//             setProviderLocation(coords);
//             if (customerCoords) fetchRoute(coords, customerCoords);
//             if (mapRef.current && mapReady) {
//               mapRef.current.animateCamera({ center: coords });
//             }
//           }
//         );
//       } catch (err) {
//         console.error("Location setup error:", err);
//       }
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress, mapReady]);

//   const geocodeAddress = async (address) => {
//     if (!address) {
//       console.warn("⚠️ No address provided for geocoding");
//       return null;
//     }
//     try {
//       const res = await api.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
//       console.log("Geocode response:", res.data);
//       if (res.data.results && res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const originStr = `${origin.latitude},${origin.longitude}`;
//       const destStr = `${dest.latitude},${dest.longitude}`;
//       console.log("Fetching route from", originStr, "to", destStr);
//       const response = await api.get(`/maps/directions?origin=${originStr}&destination=${destStr}`);

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0,
//       len = t.length;
//     let lat = 0,
//       lng = 0;
//     while (index < len) {
//       let b,
//         shift = 0,
//         result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsTraffic
//         zoomControlEnabled
//         zoomEnabled
//         scrollEnabled
//         pitchEnabled
//         rotateEnabled
//         showsCompass
//         onMapReady={() => setMapReady(true)}
//       >
//         {providerLocation && (
//           <Marker coordinate={providerLocation} title="Service Pro">
//             <Image
//               source={require("../assets/driver_marker.png")}
//               style={styles.driverMarker}
//             />
//           </Marker>
//         )}
//         {customerCoords && (
//           <Marker coordinate={customerCoords} title="Customer" pinColor="green" />
//         )}
//         {routeCoords.length > 0 && (
//           <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//         )}
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>
//           ETA: {duration} | Distance: {distance}
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: height,
//   },
//   driverMarker: {
//     width: 50,
//     height: 50,
//     resizeMode: "contain",
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

//need to test on production
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Platform,
// } from "react-native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import * as Location from "expo-location";
// import api from "../api/client";

// const { width, height } = Dimensions.get("window");

// export default function ProviderMap({ customerAddress }) {
//   const mapRef = useRef(null);
//   const [providerLocation, setProviderLocation] = useState(null);
//   const [customerCoords, setCustomerCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [duration, setDuration] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [mapReady, setMapReady] = useState(false);

//   useEffect(() => {
//     let watcher;
//     (async () => {
//       try {
//         console.log("Requesting location permissions...");
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           alert("Permission to access location was denied");
//           return;
//         }

//         const loc = await Location.getCurrentPositionAsync({});
//         const currentLoc = {
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         };
//         console.log("Provider location:", currentLoc);
//         setProviderLocation(currentLoc);

//         console.log("Geocoding customer address:", customerAddress);
//         const coords = await geocodeAddress(customerAddress);
//         console.log("Customer coordinates:", coords);
//         setCustomerCoords(coords);

//         if (coords) {
//           fetchRoute(currentLoc, coords);
//         }

//         watcher = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.High,
//             timeInterval: 5000,
//             distanceInterval: 10,
//           },
//           (newLoc) => {
//             const coords = {
//               latitude: newLoc.coords.latitude,
//               longitude: newLoc.coords.longitude,
//             };
//             console.log("Updated provider location:", coords);
//             setProviderLocation(coords);
//             if (customerCoords) fetchRoute(coords, customerCoords);
//             if (mapRef.current && mapReady) {
//               mapRef.current.animateCamera({ center: coords });
//             }
//           }
//         );
//       } catch (err) {
//         console.error("Location setup error:", err);
//       }
//     })();

//     return () => watcher && watcher.remove();
//   }, [customerAddress, mapReady]);

//   const geocodeAddress = async (address) => {
//     if (!address) {
//       console.warn("⚠️ No address provided for geocoding");
//       return null;
//     }
//     try {
//       const res = await api.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
//       console.log("Geocode response:", res.data);
//       if (res.data.results && res.data.results.length) {
//         const { lat, lng } = res.data.results[0].geometry.location;
//         return { latitude: lat, longitude: lng };
//       }
//     } catch (err) {
//       console.error("Geocode error:", err);
//     }
//     return null;
//   };

//   const fetchRoute = async (origin, dest) => {
//     try {
//       const originStr = `${origin.latitude},${origin.longitude}`;
//       const destStr = `${dest.latitude},${dest.longitude}`;
//       console.log("Fetching route from", originStr, "to", destStr);
//       const response = await api.get(`/maps/directions?origin=${originStr}&destination=${destStr}`);

//       if (response.data.routes.length) {
//         const points = decodePolyline(response.data.routes[0].overview_polyline.points);
//         setRouteCoords(points);
//         const leg = response.data.routes[0].legs[0];
//         setDistance(leg.distance.text);
//         setDuration(leg.duration.text);
//       }
//     } catch (error) {
//       console.error("Route fetch failed", error);
//     }
//   };

//   const decodePolyline = (t) => {
//     let points = [];
//     let index = 0,
//       len = t.length;
//     let lat = 0,
//       lng = 0;
//     while (index < len) {
//       let b,
//         shift = 0,
//         result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
//       lat += dlat;
//       shift = 0;
//       result = 0;
//       do {
//         b = t.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
//       lng += dlng;
//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }
//     return points;
//   };

//   if (!providerLocation || !customerCoords) {
//     return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;
//   }

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           ...providerLocation,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation={true}
//         showsTraffic={true}
//         zoomControlEnabled={true}
//         zoomEnabled={true}
//         scrollEnabled={true}
//         pitchEnabled={true}
//         rotateEnabled={true}
//         showsCompass={true}
//         onMapReady={() => setMapReady(true)}
//       >
//         {providerLocation && (
//           <Marker
//             key="provider"
//             coordinate={providerLocation}
//             title="Service Pro"
//             identifier="provider"
//           />
//         )}
//         {customerCoords && (
//           <Marker
//             key="customer"
//             coordinate={customerCoords}
//             title="Customer"
//             pinColor="green"
//             identifier="customer"
//           />
//         )}
//         {routeCoords.length > 0 && (
//           <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
//         )}
//       </MapView>
//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>
//           ETA: {duration} | Distance: {distance}
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width: "100%",
//     height: height,
//   },
//   infoBox: {
//     position: "absolute",
//     top: 40,
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   infoText: {
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

//test map
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function TestMap() {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ width: '100%', height: '100%'}}
        initialRegion={{
          latitude: 25.54641940992723,
          longitude: -80.5271684547003,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: 25.54641940992723, longitude: -80.5271684547003 }} />
      </MapView>
    </View>
  );
}
