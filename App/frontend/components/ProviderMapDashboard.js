// src/components/ServiceProMapDashboard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import api from "../api/client";

const { width, height } = Dimensions.get("window");

const CATEGORY_COLORS = {
  Electrician: "#ff0000",
  HVAC: "#00bcd4",
  Plumbing: "#4caf50",
  Roofing: "#ff9800",
  Cleaning: "#9c27b0",
  Handyman: "#3f51b5",
  Odd_Jobs: "#795548",
};

export default function ServiceProMapDashboard() {
  const [region, setRegion] = useState(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setRegion(currentRegion);

      try {
        const res = await api.get("/users/active-providers");
        const enrichedProviders = res.data.map((pro) => ({
          id: pro._id,
          name: pro.name,
          category: pro.serviceType,
          coords: {
            latitude: pro.location.coordinates[1],
            longitude: pro.location.coordinates[0],
          },
        }));
        setProviders(enrichedProviders);
      } catch (err) {
        console.warn("Failed to fetch providers", err);
        setProviders([]);
      }
    })();
  }, []);

  if (!region)
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsTraffic
        zoomEnabled
        scrollEnabled
      >
        {providers.map((pro) => (
          <Marker
            key={pro.id}
            coordinate={pro.coords}
            title={pro.name}
            description={pro.category}
            pinColor={CATEGORY_COLORS[pro.category] || "#000"}
          />
        ))}
      </MapView>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        {Object.entries(CATEGORY_COLORS).map(([type, color]) => (
          <View style={styles.legendItem} key={type}>
            <View style={[styles.colorBox, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: "100vw",
    height: height,
  },
  legendContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    elevation: 4,
  },
  legendTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  colorBox: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
