// screens/ProviderProfile.js

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import api from "../api/client";
import * as Linking from "expo-linking";

const SERVICE_TYPES = [
  "Electrician",
  "HVAC",
  "Plumbing",
  "Roofing",
  "Cleaning",
  "Handyman",
  "Odd_Jobs",
];

export default function ProviderProfile() {
  const nav = useNavigation();
  const [profile, setProfile] = useState({
    aboutMe: "",
    yearsExperience: "",
    serviceType: "",
    serviceCost: "350",
    businessName: "",
    address: "",
    zipcode: "",
    serviceZipcode: "",
  });
  const [files, setFiles] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    contractorAgreement: null,
  });
  const [existing, setExisting] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    contractorAgreement: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        setProfile({
          aboutMe: data.aboutMe || "",
          yearsExperience: String(data.yearsExperience || ""),
          serviceType: data.serviceType || "",
        //   serviceCost: String(data.serviceCost || 350),
          businessName: data.businessName || "",
          address: data.address || "",
          zipcode: data.zipcode || "",
          serviceZipcode: data.serviceZipcode || "",
        });
        setExisting({
          w9: data.w9Url || null,
          businessLicense: data.businessLicenseUrl || null,
          proofOfInsurance: data.proofOfInsuranceUrl || null,
          contractorAgreement: data.contractorAgreementUrl || null,
        });
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickFile = async (key) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });
      if (res.type === "success") {
        setFiles((f) => ({ ...f, [key]: res }));
        setExisting((e) => ({ ...e, [key]: null }));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "File selection failed.");
    }
  };

  const handleAddressBlur = async () => {
    if (!profile.address) return;
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          profile.address
        )}&key=${Constants.expoConfig.extra.googleMapsKey}`
      );
      const { results } = await resp.json();
      const comp =
        results?.[0]?.address_components.find((c) =>
          c.types.includes("postal_code")
        ) || null;
      if (comp) {
        setProfile((p) => ({ ...p, zipcode: comp.long_name }));
      }
    } catch {
      // silent
    }
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, f]) => {
      if (f) {
        fd.append(
          k,
          Platform.OS === "web"
            ? { uri: f.uri, name: f.name, type: f.mimeType }
            : {
                uri: f.uri,
                name: f.name,
                type: f.mimeType || "application/octet-stream",
              }
        );
      }
    });

    try {
      setLoading(true);
      await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Profile updated!");
      nav.replace("ServiceProviderDashboard");
    } catch (err) {
      console.error(err.response || err);
      Alert.alert("Error", "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const renderLink = (label, url) => {
    if (!url) return null;
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(url)}
        style={{ marginTop: 4 }}
      >
        <Text style={{ color: "#0066cc" }}>Download current {label}</Text>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.header}>Complete Your Profile</Text>

      <Text style={s.label}>About Me</Text>
      <TextInput
        style={s.input}
        multiline
        value={profile.aboutMe}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, aboutMe: t }))
        }
      />

      <Text style={s.label}>Years of Experience</Text>
      <TextInput
        style={s.input}
        keyboardType="number-pad"
        value={profile.yearsExperience}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, yearsExperience: t }))
        }
      />

      <Text style={s.label}>Service Type</Text>
      <View style={s.pickerWrap}>
        <Picker
          selectedValue={profile.serviceType}
          onValueChange={(v) =>
            setProfile((p) => ({ ...p, serviceType: v }))
          }
        >
          <Picker.Item label="Select…" value="" />
          {SERVICE_TYPES.map((t) => (
            <Picker.Item
              key={t}
              label={t.replace("_", " ")}
              value={t}
            />
          ))}
        </Picker>
      </View>

      <Text style={s.label}>Service Cost</Text>
      <TextInput
        style={s.input}
        keyboardType="number-pad"
        value={profile.serviceCost}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, serviceCost: t }))
        }
      />

      <Text style={s.label}>Business Name</Text>
      <TextInput
        style={s.input}
        value={profile.businessName}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, businessName: t }))
        }
      />

      <Text style={s.label}>Address</Text>
      <TextInput
        style={s.input}
        value={profile.address}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, address: t }))
        }
        onBlur={handleAddressBlur}
      />

      <Text style={s.label}>Extracted Zipcode</Text>
      <TextInput
        style={s.input}
        value={profile.zipcode}
        editable={false}
      />

      <Text style={s.label}>Service Coverage Zipcode</Text>
      <TextInput
        style={s.input}
        value={profile.serviceZipcode}
        onChangeText={(t) =>
          setProfile((p) => ({ ...p, serviceZipcode: t }))
        }
      />

      {renderLink("W-9", existing.w9)}
      <Button title="Upload W-9" onPress={() => pickFile("w9")} />
      {files.w9 && (
        <Text style={s.fileText}>Selected: {files.w9.name}</Text>
      )}

      {renderLink("Business License", existing.businessLicense)}
      <Button
        title="Upload Business License"
        onPress={() => pickFile("businessLicense")}
      />
      {files.businessLicense && (
        <Text style={s.fileText}>{files.businessLicense.name}</Text>
      )}

      {renderLink("Proof of Insurance", existing.proofOfInsurance)}
      <Button
        title="Upload Proof of Insurance"
        onPress={() => pickFile("proofOfInsurance")}
      />
      {files.proofOfInsurance && (
        <Text style={s.fileText}>{files.proofOfInsurance.name}</Text>
      )}

      {renderLink(
        "Contractor Agreement",
        existing.contractorAgreement
      )}
      <Button
        title="Upload Contractor Agreement"
        onPress={() => pickFile("contractorAgreement")}
      />
      {files.contractorAgreement && (
        <Text style={s.fileText}>
          {files.contractorAgreement.name}
        </Text>
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="Update Profile" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 50
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
  },
  fileText: {
    marginVertical: 4,
    fontStyle: "italic",
  },
});
