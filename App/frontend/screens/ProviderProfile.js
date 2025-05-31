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
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import api from "../api/client";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";

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
    profilePicture: null,
  });

  const [files, setFiles] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    independentContractorAgreement: null,
  });

  const [existing, setExisting] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    independentContractorAgreement: null,
    profilePictureUrl: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/me");
        setProfile({
          aboutMe: data.aboutMe || "",
          yearsExperience: data.yearsExperience?.toString() || "",
          serviceType: data.serviceType || "",
          serviceCost: data.serviceCost?.toString() || "350",
          businessName: data.businessName || "",
          address: data.address || "",
          zipcode: Array.isArray(data.zipcode)
            ? data.zipcode[0]
            : data.zipcode || "",
          serviceZipcode: Array.isArray(data.serviceZipcode)
            ? data.serviceZipcode[0]?.toString() || ""
            : data.serviceZipcode?.toString() || "",
          profilePicture: null,
        });
        setExisting({
          w9: data.w9 || null,
          businessLicense: data.businessLicense || null,
          proofOfInsurance: data.proofOfInsurance || null,
          independentContractorAgreement:
            data.independentContractorAgreement || null,
          profilePictureUrl: data.profilePicture || null,
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        Alert.alert("Error", "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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

  const pickProfilePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setProfile((prev) => ({
          ...prev,
          profilePicture: {
            uri: asset.uri,
            name: asset.fileName || "profile.jpg",
            type: asset.mimeType || "image/jpeg",
          },
        }));
      }
    } catch (err) {
      console.error("ImagePicker error:", err);
      Alert.alert("Error", "Image selection failed.");
    }
  };

  const downloadAgreementFromAssets = async () => {
    try {
      const asset = Asset.fromModule(
        require("../assets/BlinqFix Indepent Contractor Agreement.pdf")
      );
      await asset.downloadAsync();
      const fileUri = `${FileSystem.cacheDirectory}${asset.name}`;
      await FileSystem.copyAsync({ from: asset.localUri, to: fileUri });
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Error", "Unable to open agreement PDF.");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const fd = new FormData();

      // ✅ Append profile fields
      Object.entries(profile).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() !== "") {
          fd.append(key, value);
        }
      });

      // ✅ Append documents (if any)
      Object.entries(files).forEach(([key, file]) => {
        if (file && file.uri) {
          fd.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          });
        }
      });

      // ✅ Append profile picture
      if (profile.profilePicture?.uri) {
        fd.append("profilePicture", {
          uri: profile.profilePicture.uri,
          name: profile.profilePicture.name || "profile.jpg",
          type: profile.profilePicture.type || "image/jpeg",
        });
      }

      // ✅ Axios will auto-set headers; do NOT manually set multipart Content-Type
      await api.put("/users/profile", fd, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data", // Axios handles boundary correctly
        },
        transformRequest: (data, headers) => {
          return data;
        },
      });

      Alert.alert("Success", "Profile updated!");
      nav.replace("ServiceProviderDashboard");
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err);
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
        onChangeText={(t) => setProfile((p) => ({ ...p, aboutMe: t }))}
      />
      <Text style={s.label}>Years of Experience</Text>
      <TextInput
        style={s.input}
        keyboardType="number-pad"
        value={profile.yearsExperience}
        onChangeText={(t) => setProfile((p) => ({ ...p, yearsExperience: t }))}
      />
      <Text style={s.label}>Service Type</Text>
      <View style={s.pickerWrap}>
        <Picker
          selectedValue={profile.serviceType}
          onValueChange={(v) => setProfile((p) => ({ ...p, serviceType: v }))}
        >
          <Picker.Item label="Select…" value="" />
          {SERVICE_TYPES.map((t) => (
            <Picker.Item key={t} label={t.replace("_", " ")} value={t} />
          ))}
        </Picker>
      </View>
      <Text style={s.label}>Business Name</Text>
      <TextInput
        style={s.input}
        value={profile.businessName}
        onChangeText={(t) => setProfile((p) => ({ ...p, businessName: t }))}
      />
      <Text style={s.label}>Address</Text>
      <TextInput
        style={s.input}
        value={profile.address}
        onChangeText={(t) => setProfile((p) => ({ ...p, address: t }))}
      />
      <Text style={s.label}>Extracted Zipcode</Text>
      <TextInput style={s.input} value={profile.zipcode} editable={false} />
      <Text style={s.label}>Service Coverage Zipcode</Text>
      <TextInput
        style={s.input}
        value={profile.serviceZipcode}
        onChangeText={(t) => setProfile((p) => ({ ...p, serviceZipcode: t }))}
      />
      <Text style={s.label}>Profile Photo</Text>
      {profile.profilePicture?.uri ? (
        <Image
          source={{ uri: profile.profilePicture.uri }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 10,
          }}
        />
      ) : existing.profilePictureUrl ? (
        <Image
          source={{ uri: existing.profilePictureUrl }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 10,
          }}
        />
      ) : null}
      <Button title="Upload Profile Photo" onPress={pickProfilePhoto} />
      {renderLink("W-9", existing.w9)}
      <Button title="Upload W-9" onPress={() => pickFile("w9")} />
      {files.w9 && <Text style={s.fileText}>Selected: {files.w9.name}</Text>}
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
        existing.independentContractorAgreement
      )}
      <Button
        title="Upload Contractor Agreement"
        onPress={() => pickFile("independentContractorAgreement")}
      />
      {files.independentContractorAgreement && (
        <Text style={s.fileText}>
          {files.independentContractorAgreement.name}
        </Text>
      )}
      <View style={{ marginTop: 12 }}>
        <Button
          title="Download Contractor Agreement Template"
          onPress={downloadAgreementFromAssets}
        />
      </View>
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
    marginTop: 50,
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
