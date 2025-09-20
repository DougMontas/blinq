import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";
import {
  ArrowLeft,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Award,
  Wrench,
  UploadCloud,
  FileText,
  CheckCircle,
  FileSignature,
  X,
  Download,
  Edit,
  ArrowRight,
  MessageSquare,
  Hash,
  ExternalLink,
  ShieldCheck,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

const SERVICE_TYPES = [
  "Electrician",
  "HVAC",
  "Plumbing",
  "Roofing",
  "Handyman",
];

// External links
const W9_URL = "https://www.irs.gov/forms-pubs/about-form-w-9";
// TODO: Replace with your preferred background-check vendor link (e.g., Checkr, GoodHire)
const BACKGROUND_CHECK_URL = "https://checkr.com/signup";

/* ------------------------------ utils ------------------------------ */
const present = (v) =>
  v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
const asString = (v) => (v === undefined || v === null ? "" : String(v));
const asBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }
  return false;
};

const pickAndCompressImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });
  if (!result.canceled && result.assets?.length > 0) {
    const image = result.assets[0];
    const manipulated = await ImageManipulator.manipulateAsync(
      image.uri,
      [{ resize: { width: 600 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return {
      uri: manipulated.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    };
  }
  return null;
};

/* ------------------------------ component ------------------------------ */

export default function ProviderProfile() {
  const nav = useNavigation();

  const [profile, setProfile] = useState({
    aboutMe: "",
    yearsExperience: "",
    serviceType: "",
    serviceCost: "350",
    businessName: "",
    address: "",
    zipcode: "", // single input; backend stores array – server can coerce
    serviceZipcode: "",
    profilePicture: null, // local file to upload (object with uri/name/type)
    email: "",
    phoneNumber: "",
  });

  const [files, setFiles] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    // NEW uploads:
    governmentId: null, // Driver’s License / Federal ID
    backgroundCheck: null, // Uploaded proof/receipt
  });

  const [existing, setExisting] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    profilePictureUrl: null,
    icaString: null, // independentContractorAgreement (string)
    // NEW existing docs if API returns them:
    governmentId: null,
    backgroundCheck: null,
  });

  const [loading, setLoading] = useState(true);
  const [contractorAgreementChecked, setContractorAgreementChecked] =
    useState(false); // acceptedICA
  const [icaViewed, setIcaViewed] = useState(false); // for independentContractorAgreement string
  const [optInSms, setOptInSms] = useState(false); // backend: optInSms
  const [modalVisible, setModalVisible] = useState(false);

  const hydrateFromMe = useCallback((raw) => {
    const me = raw?.user ?? raw ?? null;
    if (!me) return;

    const patch = {};
    if (present(me.aboutMe)) patch.aboutMe = asString(me.aboutMe);
    if (present(me.yearsExperience))
      patch.yearsExperience = asString(me.yearsExperience);
    if (present(me.serviceType)) patch.serviceType = asString(me.serviceType);
    if (present(me.businessName))
      patch.businessName = asString(me.businessName);
    if (present(me.address)) patch.address = asString(me.address);
    if (present(me.email)) patch.email = asString(me.email).toLowerCase();
    if (present(me.phoneNumber)) patch.phoneNumber = asString(me.phoneNumber);

    // zipcode is stored as array – take first if present
    if (Array.isArray(me.zipcode) && present(me.zipcode[0])) {
      patch.zipcode = asString(me.zipcode[0]);
    } else if (present(me.zipcode)) {
      patch.zipcode = asString(me.zipcode);
    }

    // Only local selection belongs in profile.profilePicture; server blob goes in existing.profilePictureUrl
    setProfile((prev) => ({ ...prev, ...patch, profilePicture: null }));

    // Flags from slim /users/me
    setContractorAgreementChecked(asBool(me.acceptedICA));
    setOptInSms(asBool(me.optInSms));
    // backend now exposes inferred icaViewed boolean in /users/me
    if (typeof me.icaViewed !== "undefined") {
      setIcaViewed(!!me.icaViewed);
    }

    console.log("✅ Hydrated basics from /users/me", {
      email: patch.email,
      phoneNumber: patch.phoneNumber,
      optInSms: asBool(me.optInSms),
      icaViewed: !!me.icaViewed,
      acceptedICA: asBool(me.acceptedICA),
    });
  }, []);

  // Fetch raw docs and profile picture separately
  const hydrateDocsAndPicture = useCallback(async (userId) => {
    try {
      const [docsRes, fullRes] = await Promise.all([
        api.get("/users/me/documents").catch((e) => {
          console.log(
            "⚠️ /users/me/documents failed:",
            e?.response?.data || e?.message
          );
          return null;
        }),
        userId
          ? api.get(`/users/${userId}`).catch((e) => {
              console.log(
                "⚠️ /users/:id failed:",
                e?.response?.data || e?.message
              );
              return null;
            })
          : Promise.resolve(null),
      ]);

      const docs = docsRes?.data ?? {};
      const profilePictureUrl = fullRes?.data?.profilePicture ?? null;

      setExisting((prev) => ({
        ...prev,
        w9: docs.w9 || null,
        businessLicense: docs.businessLicense || null,
        proofOfInsurance: docs.proofOfInsurance || null,
        icaString: docs.independentContractorAgreement || null,
        profilePictureUrl: profilePictureUrl || prev.profilePictureUrl || null,

        // NEW server keys (support either `governmentId` or `idDocument`)
        governmentId: docs.governmentId || docs.idDocument || null,
        backgroundCheck: docs.backgroundCheck || null,
      }));

      if (present(docs.independentContractorAgreement)) {
        setIcaViewed(true);
      }

      console.log("📥 Hydrated docs & picture", {
        w9: !!docs.w9,
        businessLicense: !!docs.businessLicense,
        proofOfInsurance: !!docs.proofOfInsurance,
        governmentId: !!(docs.governmentId || docs.idDocument),
        backgroundCheck: !!docs.backgroundCheck,
        profilePicture: !!profilePictureUrl,
      });
    } catch (e) {
      console.log(
        "❌ hydrateDocsAndPicture error:",
        e?.response?.data || e?.message
      );
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // 1) try cached /users/me for instant UI
      const cached = await AsyncStorage.getItem("me");
      if (cached) {
        try {
          hydrateFromMe(JSON.parse(cached));
        } catch {}
      }

      // 2) canonical /users/me
      const meRes = await api.get("/users/me");
      const me = meRes?.data?.user ?? meRes?.data ?? {};
      hydrateFromMe(me);
      await AsyncStorage.setItem("me", JSON.stringify(me));

      // 3) docs + profile picture (calls in parallel)
      await hydrateDocsAndPicture(me?._id);
    } catch (err) {
      console.error(
        "❌ Error loading profile:",
        err?.response?.data || err?.message
      );
      Alert.alert("Error", "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [hydrateFromMe, hydrateDocsAndPicture]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const pickFile = async (key) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (result?.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFiles((prev) => ({
          ...prev,
          [key]: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          },
        }));
      }
    } catch (err) {
      console.error("❌ File selection failed:", err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  const handleSubmit = async () => {
    if (!contractorAgreementChecked) {
      Alert.alert(
        "Required",
        "You must acknowledge the independent contractor agreement before submitting."
      );
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();

      // strings (only append non-empty)
      Object.entries(profile).forEach(([key, value]) => {
        if (present(value)) {
          if (key === "email") fd.append(key, asString(value).toLowerCase());
          else fd.append(key, asString(value));
        }
      });

      // normalize zipcode to a single string (server can coerce to array)
      if (present(profile.zipcode)) {
        fd.append("zipcode", asString(profile.zipcode));
      }

      // files
      Object.entries(files).forEach(([key, file]) => {
        if (file?.uri) {
          fd.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.type || "application/octet-stream",
          });
        }
      });

      if (profile.profilePicture?.uri) {
        fd.append("profilePicture", profile.profilePicture);
      }

      // canonical flags/fields expected by backend
      fd.append("optInSms", optInSms ? "true" : "false"); // <- SMS consent
      fd.append("acceptedICA", contractorAgreementChecked ? "true" : "false"); // <- agreed

      // Make sure ICA has a non-empty string when viewed/acknowledged
      const icaStringOut =
        existing.icaString ||
        (icaViewed ? `viewed@${new Date().toISOString()}` : "");
      if (icaStringOut) {
        fd.append("independentContractorAgreement", icaStringOut);
      }

      console.log("📤 PUT /users/profile (payload preview)", {
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        zipcode: profile.zipcode,
        optInSms,
        acceptedICA: contractorAgreementChecked,
        icaStringOut: !!icaStringOut,
        files: {
          w9: !!files.w9,
          businessLicense: !!files.businessLicense,
          proofOfInsurance: !!files.proofOfInsurance,
          governmentId: !!files.governmentId,
          backgroundCheck: !!files.backgroundCheck,
        },
      });

      await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Re-hydrate from source of truth and cache
      const meRes = await api.get("/users/me");
      const me = meRes?.data?.user ?? meRes?.data ?? {};
      hydrateFromMe(me);
      await AsyncStorage.setItem("me", JSON.stringify(me));

      await hydrateDocsAndPicture(me?._id);

      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => nav.navigate("ServiceProviderDashboard") },
      ]);
    } catch (err) {
      console.error("❌ Profile update error:", err?.response?.data || err);
      Alert.alert("Error", "Profile update failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const agreementText = `This Independent Contractor Agreement is made between BlinqFix ("Company") and ${
    profile.businessName || "[Contractor Name]"
  } ("Contractor") as of ${
    new Date().toISOString().split("T")[0]
  }. [Placeholder summary.] By checking the box, you acknowledge you have read, understood, and agreed to the full terms provided.`;

  const renderUploadSection = (label, key, icon) => (
    <View style={styles.uploadContainer}>
      <View style={styles.uploadInfo}>
        {icon}
        <View>
          <Text style={styles.uploadLabel}>{label}</Text>
          {files[key]?.name ? (
            <Text style={styles.fileSelectedText} numberOfLines={1}>
              {files[key].name}
            </Text>
          ) : existing[key] ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <CheckCircle color="#22c55e" size={14} />
              <Text style={styles.fileExistingText}>Document on File</Text>
            </View>
          ) : (
            <Text style={styles.fileMissingText}>No file uploaded</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => pickFile(key)}
      >
        <UploadCloud color="#60a5fa" size={20} />
      </TouchableOpacity>
    </View>
  );

  const renderTextInput = (
    label,
    value,
    onChange,
    placeholder,
    keyboardType = "default",
    icon
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          autoCapitalize={
            label.toLowerCase().includes("email") ? "none" : "sentences"
          }
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() =>
                  nav.canGoBack()
                    ? nav.goBack()
                    : nav.navigate("ServiceProviderDashboard")
                }
                style={styles.backButton}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Edit Profile</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            {/* Profile Picture Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Profile Picture</Text>
              <View style={styles.profilePicContainer}>
                {profile.profilePicture?.uri || existing.profilePictureUrl ? (
                  <Image
                    source={{
                      uri:
                        profile.profilePicture?.uri ||
                        existing.profilePictureUrl,
                    }}
                    style={styles.profilePic}
                  />
                ) : (
                  <View
                    style={[styles.profilePic, styles.profilePicPlaceholder]}
                  >
                    <User color="#94a3b8" size={60} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.profilePicButton}
                  onPress={async () => {
                    const compressed = await pickAndCompressImage();
                    if (compressed)
                      setProfile((prev) => ({
                        ...prev,
                        profilePicture: compressed,
                      }));
                  }}
                >
                  <Edit color="#fff" size={16} />
                  <Text style={styles.profilePicButtonText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Personal Details Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Details</Text>
              {renderTextInput(
                "About Me",
                profile.aboutMe,
                (t) => setProfile((p) => ({ ...p, aboutMe: t })),
                "Tell customers about your skills...",
                "default",
                <User color="#94a3b8" size={20} style={styles.inputIcon} />
              )}
              {renderTextInput(
                "Years of Experience",
                profile.yearsExperience,
                (t) => setProfile((p) => ({ ...p, yearsExperience: t })),
                "e.g., 10",
                "number-pad",
                <Award color="#94a3b8" size={20} style={styles.inputIcon} />
              )}
              {renderTextInput(
                "Email Address",
                profile.email,
                (t) => setProfile((p) => ({ ...p, email: t })),
                "your@email.com",
                "email-address",
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
              )}
              {renderTextInput(
                "Phone Number",
                profile.phoneNumber,
                (t) => setProfile((p) => ({ ...p, phoneNumber: t })),
                "(123) 456-7890",
                "phone-pad",
                <Phone color="#94a3b8" size={20} style={styles.inputIcon} />
              )}
              {renderTextInput(
                "Business Zip Code",
                profile.zipcode,
                (t) => setProfile((p) => ({ ...p, zipcode: t })),
                "e.g., 30301",
                "number-pad",
                <Hash color="#94a3b8" size={20} style={styles.inputIcon} />
              )}

              {/* SMS Consent */}
              <View style={styles.checkboxRow}>
                <Checkbox
                  style={styles.checkbox}
                  value={optInSms}
                  onValueChange={setOptInSms}
                  color={optInSms ? "#22c55e" : "#fff"}
                />
                <MessageSquare
                  color="#94a3b8"
                  size={18}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.checkboxLabel}>
                  I agree to receive SMS job alerts and updates.
                </Text>
              </View>
            </View>

            {/* Business Details Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Business & Service Details</Text>
              {renderTextInput(
                "Business Name",
                profile.businessName,
                (t) => setProfile((p) => ({ ...p, businessName: t })),
                "Your Company LLC",
                "default",
                <Briefcase color="#94a3b8" size={20} style={styles.inputIcon} />
              )}
              {renderTextInput(
                "Business Address",
                profile.address,
                (t) => setProfile((p) => ({ ...p, address: t })),
                "123 Main St, Anytown, USA",
                "default",
                <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Primary Service</Text>
                <View style={styles.chipsContainer}>
                  {SERVICE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        profile.serviceType === type && styles.chipSelected,
                      ]}
                      onPress={() =>
                        setProfile((p) => ({ ...p, serviceType: type }))
                      }
                    >
                      <Wrench
                        color={
                          profile.serviceType === type ? "#fff" : "#60a5fa"
                        }
                        size={14}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          profile.serviceType === type &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Documents Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Required Documents</Text>

              {/* W-9 with link */}
              {renderUploadSection(
                "W-9 Form",
                "w9",
                <FileText color="#94a3b8" size={24} />
              )}
              <View style={styles.inlineLinksRow}>
                <TouchableOpacity
                  onPress={() => Linking.openURL(W9_URL)}
                  style={styles.linkBtn}
                >
                  <ExternalLink color="#60a5fa" size={16} />
                  <Text style={styles.linkText}>Complete W-9 online</Text>
                </TouchableOpacity>
              </View>

              {/* NEW: Government ID */}
              {renderUploadSection(
                "Government ID (Driver’s License / Federal ID)",
                "governmentId",
                <FileText color="#94a3b8" size={24} />
              )}
              <Text style={styles.helperNote}>
                Upload a clear photo or PDF of your Driver’s License or federal
                ID. We use this only for identity verification and do not share
                it publicly.
              </Text>

              {/* Existing docs */}
              {renderUploadSection(
                "Business License",
                "businessLicense",
                <FileText color="#94a3b8" size={24} />
              )}
              {renderUploadSection(
                "Proof of Insurance",
                "proofOfInsurance",
                <FileText color="#94a3b8" size={24} />
              )}

              {/* NEW: Background Check with link + note */}
              {renderUploadSection(
                "Background Check (PDF/Image)",
                "backgroundCheck",
                <ShieldCheck
                  color="#94a3b8"
                  size={24}
                  style={{ marginTop: 12 }}
                />
              )}
              <View style={styles.inlineLinksRow}>
                <TouchableOpacity
                  onPress={() => Linking.openURL(BACKGROUND_CHECK_URL)}
                  style={styles.linkBtn}
                >
                  <ExternalLink color="#60a5fa" size={16} />
                  <Text style={styles.linkText}>Start Background Check</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperNote}>
                Complete your background check online.{" "}
                <Text style={{ fontWeight: "700" }}>
                  The fee will be reimbursed after your first job.
                </Text>{" "}
                Upload the background check here once finished.
              </Text>
            </View>

            {/* Agreement Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Independent Contractor Agreement
              </Text>
              <TouchableOpacity
                style={styles.agreementContainer}
                onPress={() => {
                  setModalVisible(true);
                }}
              >
                <FileSignature
                  color="#60a5fa"
                  size={24}
                  style={{ marginRight: 16 }}
                />
                <Text style={styles.agreementText}>View Agreement</Text>
                <ArrowRight color="#60a5fa" size={20} />
              </TouchableOpacity>
              <View style={styles.checkboxRow}>
                <Checkbox
                  style={styles.checkbox}
                  value={contractorAgreementChecked}
                  onValueChange={setContractorAgreementChecked}
                  color={contractorAgreementChecked ? "#22c55e" : "#fff"}
                />
                <Text style={styles.checkboxLabel}>
                  I have read and agree to the terms.
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={
                  loading ? ["#6b7280", "#4b5563"] : ["#22c55e", "#16a34a"]
                }
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <CheckCircle color="#fff" size={20} />
                    <Text style={styles.submitButtonText}>Update Profile</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ICA Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Independent Contractor Agreement
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X color="#94a3b8" size={24} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalAgreementText}>
                {`INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is made and entered into as of ${
                  new Date().toISOString().split("T")[0]
                } by and between:

BlinqFix
("BlinqFix" or "Company")

and

${profile.businessName || "[Contractor Name]"}
Address: ${profile.address || "[Contractor Address]"}
("Contractor").

1. ENGAGEMENT OF SERVICES
   1.1 Services. BlinqFix hereby engages Contractor, and Contractor agrees to provide the following services ("Services"):
       (a) Emergency repair and maintenance services.
       (b) Contractor shall perform the Services in a professional and workmanlike manner in accordance with industry standards.

   1.2 Independent Contractor Status. Contractor is engaged as an independent contractor. Nothing in this Agreement shall be construed as creating an employer–employee relationship, a partnership, or a joint venture. Contractor is solely responsible for payment of all federal, state, and local taxes and for any benefits, insurance, or other expenses.

2. TERM
   This Agreement shall commence on the Effective Date and continue until terminated by either party as provided herein.

3. COMPENSATION
   3.1 Fees. In consideration for the performance of the Services, BlinqFix shall pay Contractor as follows:
       (a) A fee per job/project, payable upon completion.
       (b) Reimbursement for pre-approved expenses incurred in connection with the Services.

   3.2 Invoices. Contractor shall submit invoices detailing the Services performed and expenses incurred. Payment shall be due within 30 days of receipt of each invoice.

4. EQUIPMENT AND MATERIALS
   Contractor shall supply all tools, equipment, and materials necessary to perform the Services unless otherwise agreed by the parties.

5. CONFIDENTIALITY
   Contractor agrees not to disclose or use any Confidential Information except as necessary for the performance of the Services.

6. INTELLECTUAL PROPERTY
   6.1 Work Product. Any work product created by Contractor in connection with the Services shall be the exclusive property of BlinqFix.
   6.2 License. Contractor grants BlinqFix a non-exclusive, royalty-free, perpetual license to use any pre-existing intellectual property incorporated in the Work Product.

7. TERMINATION
   Either party may terminate this Agreement at any time by providing 14 days' written notice.

8. INDEMNIFICATION
   Contractor agrees to indemnify and hold harmless BlinqFix and its agents from any claims or liabilities arising from the Contractor’s services.

9. LIMITATION OF LIABILITY
   In no event shall either party be liable for any indirect or punitive damages arising under this Agreement.

10. GOVERNING LAW
    This Agreement shall be governed by the laws of the United States of America.

11. ENTIRE AGREEMENT
    This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions.

By checking the box, you acknowledge you have read, understood, and agreed to the full terms provided.`}
              </Text>

              <View style={styles.modalCheckboxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={contractorAgreementChecked}
                  onValueChange={setContractorAgreementChecked}
                  color={contractorAgreementChecked ? "#22c55e" : "#fff"}
                />
                <Text style={styles.checkboxLabel}>
                  I have read and agree to the terms.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalDownloadButton}
                  onPress={async () => {
                    const fileUri =
                      FileSystem.documentDirectory + "Contractor_Agreement.txt";
                    await FileSystem.writeAsStringAsync(fileUri, agreementText);
                    await Sharing.shareAsync(fileUri);
                  }}
                >
                  <Download color="#fff" size={18} />
                  <Text style={styles.modalActionButtonText}>
                    Save or Print
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setIcaViewed(true);
                    setModalVisible(false);
                  }}
                >
                  <CheckCircle color="#fff" size={18} />
                  <Text style={styles.modalActionButtonText}>
                    Acknowledge & Close
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  profilePicContainer: { alignItems: "center", gap: 16 },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(96, 165, 250, 0.5)",
  },
  profilePicPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  profilePicButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(96, 165, 250, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  profilePicButtonText: { color: "#fff", fontWeight: "600" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", color: "#e0e7ff", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputIcon: { paddingHorizontal: 16 },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: "#fff",
  },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
    flexDirection: "row",
    alignItems: "center",
  },
  chipSelected: { backgroundColor: "#60a5fa", borderColor: "#60a5fa" },
  chipText: { color: "#60a5fa", fontWeight: "600" },
  chipTextSelected: { color: "#fff" },

  uploadContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  uploadInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  uploadLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  fileSelectedText: { color: "#22c55e", fontSize: 12, marginTop: 2 },
  fileExistingText: { color: "#22c55e", fontSize: 12, fontWeight: "500" },
  fileMissingText: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  uploadButton: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    padding: 10,
    borderRadius: 8,
  },

  inlineLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: -4,
  },
  linkBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "rgba(96,165,250,0.16)",
    borderColor: "rgba(96,165,250,0.4)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  linkText: { color: "#93c5fd", fontWeight: "700" },
  helperNote: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },

  agreementContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  agreementText: { color: "#fff", flex: 1, fontWeight: "600", fontSize: 16 },

  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkbox: { margin: 8, width: 20, height: 20, borderRadius: 4 },
  checkboxLabel: { color: "#e0e7ff", flex: 1, marginLeft: 4 },

  submitButton: { marginTop: 12, borderRadius: 16, overflow: "hidden" },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    width: "100%",
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modalScroll: { padding: 24 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", flex: 1 },
  closeButton: { padding: 8 },
  modalAgreementText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 8,
  },
  modalActions: { gap: 12 },
  modalDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 12,
  },
  modalCloseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
  },
  modalActionButtonText: { color: "#fff", fontWeight: "600" },
});
