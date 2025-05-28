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
