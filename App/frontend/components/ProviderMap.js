import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";

const SERVICE_COLORS = {
  Plumbing: "#2196F3",
  Electrician: "#FFC107",
  HVAC: "#4CAF50",
  Roofing: "#FF5722",
  Handyman: "#9C27B0",
  Cleaning: "#009688",
};

export default function ProviderMap() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    axios.get("/api/users/all-providers").then((res) => {
      setProviders(res.data || []);
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        initialRegion={{
          latitude: 25.7617,
          longitude: -80.1918,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {providers.map((p) => (
          <Marker
            key={p._id}
            coordinate={{
              latitude: p.location?.lat || 25.76,
              longitude: p.location?.lng || -80.19,
            }}
            pinColor={SERVICE_COLORS[p.trade] || "#666"}
            title={p.name}
            description={p.trade}
          />
        ))}
      </MapView>
      <View style={styles.legend}>
        {Object.entries(SERVICE_COLORS).map(([trade, color]) => (
          <View key={trade} style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{trade}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legend: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendColor: { width: 16, height: 16, marginRight: 6, borderRadius: 2 },
  legendLabel: { fontSize: 14 },
});
