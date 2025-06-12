import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LINKS = [
  { label: "Terms & Conditions", url: "TermsAndConditions" },
  { label: "Privacy Policy", url: "PrivacyPolicy" },
  {
    label: "Help",
    url: "mailto:support@blinqfix.com?subject=Need%20Help&body=Hi,%20I%20need%20assistance%20with...",
  },
  { label: "FAQ", url: "CustomerFAQScreen" },
];

export default function Footer() {
  const navigation = useNavigation();

  const handlePress = async (url) => {
    try {
      // If it's an external link (http, https, or mailto)
      if (url.startsWith("http") || url.startsWith("mailto:")) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open the link.");
        }
      } else {
        // It's a route name for internal navigation
        navigation.navigate(url);
      }
    } catch (e) {
      console.error("Error handling link:", url, e);
    }
  };

  return (
    <View style={styles.footer}>
      {LINKS.map((l) => (
        <TouchableOpacity
          key={l.url}
          onPress={() => handlePress(l.url)}
          style={styles.link}
        >
          <Text style={styles.linkText}>{l.label}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.copy}>© {new Date().getFullYear()} BlinqFix</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginVertical: 50,
  },
  link: {
    marginVertical: 4,
  },
  linkText: {
    color: "#1976d2",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  copy: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
});
