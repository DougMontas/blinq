import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import api from "../api/client";

export default function JobRouteMap({ jobId }) {
  const [customerLocation, setCustomerLocation] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setProviderLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const { data: job } = await api.get(`/jobs/${jobId}`);
        if (job?.location?.coordinates) {
          const [lng, lat] = job.location.coordinates;
          setCustomerLocation({ latitude: lat, longitude: lng });
        }
      } catch (err) {
        console.error("Map load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  if (!providerLocation || !customerLocation) return <Text>Unable to load locations.</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: providerLocation.latitude,
          longitude: providerLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={providerLocation} pinColor="blue" title="You" />
        <Marker coordinate={customerLocation} pinColor="green" title="Customer" />
        <Polyline
          coordinates={[providerLocation, customerLocation]}
          strokeColor="#1976d2"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height * 0.6,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});
