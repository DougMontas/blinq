// screens/MapSmokeTest.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";

export default function MapSmokeTest() {
  const [ready, setReady] = useState(false);

  const region = {
    latitude: 37.4220936,
    longitude: -122.083922,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>
        provider={Platform.OS === "android" ? "google" : "apple"} | ready:{" "}
        {String(ready)}
      </Text>

      {/* Give the map an explicit, fixed height and no clipping parent */}
      <View
        style={styles.mapBox}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          console.log("🧪 Map box size", { width, height });
        }}
      >
        <MapView
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onMapReady={() => {
            console.log("🧪 Map ready");
            setReady(true);
          }}
          cacheEnabled={Platform.OS === "android"} // helps on Android
          moveOnMarkerPress={false}
          toolbarEnabled={false}
        >
          {/* OSM tile overlay: proves rendering works even if Google tiles/key are unhappy */}
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Test pin"
          />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b1020", paddingTop: 24 },
  label: { color: "#fff", textAlign: "center", marginBottom: 8 },
  mapBox: {
    height: 320,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1f2937",
  },
});
