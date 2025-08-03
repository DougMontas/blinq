import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StarRating({ rating = 0, max = 5 }) {
  const safeRating = Number(rating ?? 0); // ✅ Ensure rating is always a number
  const fullStars = Math.floor(safeRating);
  const hasHalfStar =
    safeRating - fullStars >= 0.25 && safeRating - fullStars < 0.75;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push("★");
  }

  if (hasHalfStar) {
    stars.push("⋆");
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push("☆");
  }

  return (
    <View style={styles.starContainer}>
      {stars.map((s, i) => (
        <Text key={i} style={styles.star}>
          {s}
        </Text>
      ))}
      {/* ✅ Safely render rating value */}
      <Text style={styles.text}>({safeRating.toFixed(1)})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 20,
    color: "#000", // or use gold: "#FFD700"
    marginRight: 2,
  },
  text: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
});
