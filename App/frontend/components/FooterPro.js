// components/Footer.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LINKS = [
  { label: "Terms & Conditions", url: "ProviderTermsAndAgreement" },
  { label: "Privacy Policy",     url: "https://yourdomain.com/privacy" },
  { label: "Help",               url: "https://yourdomain.com/help" },
];

export default function FooterPro() {
  const navigation = useNavigation();

  const handlePress = async (url) => {
    // external
    if (url.startsWith("http")) {
      try {
        const ok = await Linking.canOpenURL(url);
        if (ok) {
          await Linking.openURL(url);
        } else {
          console.warn("Can't open URL:", url);
        }
      } catch (e) {
        console.error("Error opening URL:", url, e);
      }
    }
    // internal screen
    else {
      navigation.navigate(url);
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
      <Text style={styles.copy}>
        © {new Date().getFullYear()} BlinqFix
      </Text>
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
