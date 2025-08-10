// import React, { useState, useEffect } from "react";
// import {
//   View,
//   ScrollView,
//   Text,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   Platform,
//   Image,
//   Modal,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import * as DocumentPicker from "expo-document-picker";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import BackButton from "../components/BackButton";
// import Checkbox from "expo-checkbox";
// import ScreenWrapper from "../components/ScreenWrapper";

// const SERVICE_TYPES = [
//   "Electrician",
//   "HVAC",
//   "Plumbing",
//   "Roofing",
//   "Handyman",
// ];

// const pickAndCompressImage = async () => {
//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     allowsEditing: true,
//     quality: 1,
//   });
//   if (!result.canceled && result.assets?.length > 0) {
//     const image = result.assets[0];
//     const manipulated = await ImageManipulator.manipulateAsync(
//       image.uri,
//       [{ resize: { width: 600 } }],
//       { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
//     );
//     return {
//       uri: manipulated.uri,
//       name: "profile.jpg",
//       type: "image/jpeg",
//     };
//   }
//   return null;
// };

// export default function ProviderProfile() {
//   const nav = useNavigation();
//   const [profile, setProfile] = useState({
//     aboutMe: "",
//     yearsExperience: "",
//     serviceType: "",
//     serviceCost: "350",
//     businessName: "",
//     address: "",
//     zipcode: "",
//     serviceZipcode: "",
//     ssnLast4: "",
//     dob: "",
//     profilePicture: null,
//     email: "",
//     phoneNumber: "",
//   });
//   const [files, setFiles] = useState({
//     w9: null,
//     businessLicense: null,
//     proofOfInsurance: null,
//     independentContractorAgreement: null,
//   });
//   const [existing, setExisting] = useState({
//     w9: null,
//     businessLicense: null,
//     proofOfInsurance: null,
//     independentContractorAgreement: null,
//     profilePictureUrl: null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [contractorAgreementChecked, setContractorAgreementChecked] =
//     useState(false);
//   const [modalVisible, setModalVisible] = useState(false);

//   const pickFile = async (key) => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         copyToCacheDirectory: true,
//         multiple: false,
//       });
//       if (result?.assets && result.assets.length > 0) {
//         const file = result.assets[0];
//         setFiles((prev) => ({
//           ...prev,
//           [key]: {
//             uri: file.uri,
//             name: file.name,
//             type: file.mimeType || "application/octet-stream",
//           },
//         }));
//       }
//     } catch (err) {
//       console.error("❌ File selection failed:", err);
//       Alert.alert("Error", "Failed to pick a file.");
//     }
//   };

//   const effectiveDate = new Date().toISOString().split("T")[0];
//   const contractorName = profile.businessName || "[Contractor Name]";
//   const contractorAddress = profile.address || "[Contractor Address]";

//   const agreementText = `

// This Independent Contractor Agreement (\"Agreement\") is made and entered into as of ${effectiveDate} by and between:

// BlinqFix
// (\"BlinqFix\" or \"Company\")

// and

// ${contractorName}
// Address: ${contractorAddress}
// (\"Contractor\").

// 1. ENGAGEMENT OF SERVICES
//    1.1 Services. BlinqFix hereby engages Contractor, and Contractor agrees to provide the following services (\"Services\"):
//        (a) Emergency repair services, installation, maintenance, etc.
//        (b) Contractor shall perform the Services in a professional and workmanlike manner in accordance with industry standards.

//    1.2 Independent Contractor Status. Contractor is engaged as an independent contractor. Nothing in this Agreement shall be construed as creating an employer–employee relationship, a partnership, or a joint venture. Contractor is solely responsible for payment of all federal, state, and local taxes and for any benefits, insurance, or other expenses.

// 2. TERM
//    This Agreement shall commence on the Effective Date and continue until terminated by either party as provided herein.

// 3. COMPENSATION
//    3.1 Fees. In consideration for the performance of the Services, BlinqFix shall pay Contractor as follows:
//        (a) A fee of [Fee Amount] per [hour/job/project], payable [weekly/monthly/upon completion].
//        (b) Reimbursement for pre-approved expenses incurred in connection with the Services.

//    3.2 Invoices. Contractor shall submit invoices detailing the Services performed and expenses incurred. Payment shall be due within [number] days of receipt of each invoice.

// 4. EQUIPMENT AND MATERIALS
//    Contractor shall supply all tools, equipment, and materials necessary to perform the Services unless otherwise agreed by the parties. BlinqFix will provide access to its premises or systems as required.

// 5. CONFIDENTIALITY
//    5.1 Confidential Information. In the course of performing the Services, Contractor may have access to confidential and proprietary information (\"Confidential Information\"). Contractor agrees not to disclose or use any Confidential Information except as necessary for the performance of the Services.
//    5.2 Return of Materials. Upon termination of this Agreement, Contractor shall promptly return or destroy all Confidential Information and related materials.

// 6. INTELLECTUAL PROPERTY
//    6.1 Work Product. Any work product, invention, improvement, or development created by Contractor in connection with the Services (\"Work Product\") shall be the exclusive property of BlinqFix. Contractor hereby assigns all rights, title, and interest in and to the Work Product to BlinqFix.
//    6.2 License. Contractor grants BlinqFix a non-exclusive, royalty-free, perpetual license to use any pre-existing intellectual property incorporated in the Work Product.

// 7. TERMINATION
//    7.1 Termination for Convenience. Either party may terminate this Agreement at any time by providing [number] days' written notice to the other party.
//    7.2 Termination for Cause. Either party may terminate this Agreement immediately upon written notice if the other party materially breaches any term or condition of this Agreement and fails to cure such breach within [number] days of notice.

// 8. INDEMNIFICATION
//    Contractor agrees to indemnify, defend, and hold harmless BlinqFix, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, or liabilities (including reasonable attorneys' fees) arising out of or in connection with Contractor’s performance of the Services or breach of this Agreement.

// 9. LIMITATION OF LIABILITY
//    In no event shall either party be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to this Agreement, even if advised of the possibility of such damages. BlinqFix's total liability for any claim arising under this Agreement shall not exceed the total fees paid by BlinqFix to Contractor.

// 10. GOVERNING LAW
//     This Agreement shall be governed by and construed in accordance with the laws of the United States of America. The parties agree that any disputes arising under or in connection with this Agreement shall be resolved in the federal courts of the United States, with any applicable state law provisions considered as necessary.

// 11. ENTIRE AGREEMENT
//     This Agreement constitutes the entire agreement between the parties regarding the subject matter herein and supersedes all prior discussions, negotiations, and agreements (whether written or oral). Any modifications or amendments must be in writing and signed by both parties.

// 12. SEVERABILITY
//     If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

// 13. NOTICES
//     All notices under this Agreement shall be in writing and delivered personally or sent by certified mail, return receipt requested, to the addresses provided above or to any other address that either party may designate in writing.

// IN WITNESS WHEREOF, the parties hereto have executed this Independent Contractor Agreement as of the Effective Date.

// // _______________________________        _______________________________
// // BlinqFix (Company)                        ${contractorName} (Contractor)
// // Date: ________________________           Date: ________________________
// `;

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const { data } = await api.get("/users/me");
//         setProfile({
//           aboutMe: data.aboutMe || "",
//           yearsExperience: data.yearsExperience?.toString() || "",
//           serviceType: data.serviceType || "",
//           serviceCost: data.serviceCost?.toString() || "350",
//           businessName: data.businessName || "",
//           address: data.address || "",
//           zipcode: Array.isArray(data.zipcode)
//             ? data.zipcode[0]
//             : data.zipcode || "",
//           serviceZipcode: Array.isArray(data.serviceZipcode)
//             ? data.serviceZipcode[0]?.toString() || ""
//             : data.serviceZipcode?.toString() || "",
//           ssnLast4: data.ssnLast4 || "",
//           dob: data.dob || "",
//           profilePicture: null,
//           email: data.email || "",
//           phoneNumber: data.phoneNumber || "",
//         });
//         setExisting({
//           w9: data.w9 || null,
//           businessLicense: data.businessLicense || null,
//           proofOfInsurance: data.proofOfInsurance || null,
//           independentContractorAgreement:
//             data.independentContractorAgreement || null,
//           profilePictureUrl: data.profilePicture || null,
//         });
//       } catch (err) {
//         console.error("Error loading profile:", err);
//         Alert.alert("Error", "Could not load your profile.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, []);

//   const handleSubmit = async () => {
//     if (!contractorAgreementChecked) {
//       Alert.alert(
//         "Required",
//         "You must acknowledge the contractor agreement before submitting."
//       );
//       return;
//     }
//     try {
//       setLoading(true);
//       const fd = new FormData();
//       Object.entries(profile).forEach(([key, value]) => {
//         if (typeof value === "string" && value.trim() !== "") {
//           fd.append(key, value);
//         }
//       });
//       Object.entries(files).forEach(([key, file]) => {
//         if (file?.uri) {
//           fd.append(key, {
//             uri: file.uri,
//             name: file.name,
//             type: file.type || "application/octet-stream",
//           });
//         }
//       });
//       if (profile.profilePicture?.uri) {
//         fd.append("profilePicture", {
//           uri: profile.profilePicture.uri,
//           name: profile.profilePicture.name || "profile.jpg",
//           type: profile.profilePicture.type || "image/jpeg",
//         });
//       }
//       fd.append("acceptedICA", contractorAgreementChecked ? "true" : "false");

//       console.log("📦 FormData being sent:");
//       for (let pair of fd.entries()) {
//         console.log(`${pair[0]}:`, pair[1]);
//       }

//       await api.put("/users/profile", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       Alert.alert("Success", "Profile updated!");
//       nav.replace("ServiceProviderDashboard");
//     } catch (err) {
//       console.error("Profile update error:", err.response?.data || err);
//       Alert.alert("Error", "Profile update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderUploadSection = (label, key) => (
//     <View style={{ marginTop: 12 }}>
//       <TouchableOpacity style={s.uploadBtn} onPress={() => pickFile(key)}>
//         <Text style={s.uploadBtnText}>Upload {label}</Text>
//       </TouchableOpacity>
//       {files[key]?.name && <Text style={s.fileText}>✅ {files[key].name}</Text>}
//     </View>
//   );

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={s.container}>
//         <BackButton />
//         <Text style={s.header}>Complete Your Profile</Text>

//         <Text style={s.label}>About Me</Text>
//         <TextInput
//           style={s.input}
//           multiline
//           value={profile.aboutMe}
//           onChangeText={(t) => setProfile((p) => ({ ...p, aboutMe: t }))}
//         />

//         <Text style={s.label}>Years of Experience</Text>
//         <TextInput
//           style={s.input}
//           keyboardType="number-pad"
//           value={profile.yearsExperience}
//           onChangeText={(t) =>
//             setProfile((p) => ({ ...p, yearsExperience: t }))
//           }
//         />

//         <Text style={s.label}>Service Type</Text>
//         <View style={s.pickerWrap}>
//           <Picker
//             selectedValue={profile.serviceType}
//             onValueChange={(v) => setProfile((p) => ({ ...p, serviceType: v }))}
//           >
//             <Picker.Item label="Select…" value="" />
//             {SERVICE_TYPES.map((t) => (
//               <Picker.Item key={t} label={t.replace("_", " ")} value={t} />
//             ))}
//           </Picker>
//         </View>

//         <Text style={s.label}>Business Name</Text>
//         <TextInput
//           style={s.input}
//           value={profile.businessName}
//           onChangeText={(t) => setProfile((p) => ({ ...p, businessName: t }))}
//         />
//         <Text style={s.label}>Email</Text>
//         <TextInput
//           style={s.input}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           value={profile.email}
//           onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
//         />

//         <Text style={s.label}>Phone Number</Text>
//         <TextInput
//           style={s.input}
//           keyboardType="phone-pad"
//           value={profile.phoneNumber}
//           onChangeText={(t) => setProfile((p) => ({ ...p, phoneNumber: t }))}
//         />

//         <Text style={s.label}>Address</Text>
//         <TextInput
//           style={s.input}
//           value={profile.address}
//           onChangeText={(t) => setProfile((p) => ({ ...p, address: t }))}
//         />

//         <Text style={s.label}> Zipcode</Text>
//         <TextInput style={s.input} value={profile.zipcode} editable={false} />

//         <Text style={s.label}>Service Coverage Zipcode</Text>
//         <TextInput
//           style={s.input}
//           value={profile.serviceZipcode}
//           onChangeText={(t) => setProfile((p) => ({ ...p, serviceZipcode: t }))}
//         />

//         {/* <Text style={s.label}>Last 4 of SSN</Text>
//         <TextInput
//           style={s.input}
//           keyboardType="number-pad"
//           maxLength={4}
//           value={profile.ssnLast4}
//           onChangeText={(t) => setProfile((p) => ({ ...p, ssnLast4: t }))}
//         />

//         <Text style={s.label}>Date of Birth (YYYY-MM-DD)</Text>
//         <TextInput
//           style={s.input}
//           placeholder="e.g. 1985-04-17"
//           value={profile.dob}
//           onChangeText={(t) => setProfile((p) => ({ ...p, dob: t }))}
//         /> */}

//         <Text style={s.label}>Profile Photo</Text>
//         {profile.profilePicture?.uri || existing.profilePictureUrl ? (
//           <Image
//             source={{
//               uri: profile.profilePicture?.uri || existing.profilePictureUrl,
//             }}
//             style={s.imagePreview}
//           />
//         ) : null}
//         <TouchableOpacity
//           style={s.uploadBtn}
//           onPress={async () => {
//             const compressed = await pickAndCompressImage();
//             if (compressed) {
//               setProfile((prev) => ({ ...prev, profilePicture: compressed }));
//             }
//           }}
//         >
//           <Text style={s.uploadBtnText}>Upload Profile Photo</Text>
//         </TouchableOpacity>

//         {renderUploadSection("W-9", "w9")}
//         {renderUploadSection("Business License", "businessLicense")}
//         {renderUploadSection("Proof of Insurance", "proofOfInsurance")}

//         <View style={{ marginTop: 20 }}>
//           <TouchableOpacity
//             style={s.downloadBtn}
//             onPress={() => setModalVisible(true)}
//           >
//             <Text style={s.downloadBtnText}>View Contractor Agreement</Text>
//           </TouchableOpacity>

//           <Modal visible={modalVisible} animationType="slide">
//             <ScrollView contentContainerStyle={{ padding: 20 }}>
//               <Text
//                 style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}
//               >
//                 Independent Contractor Agreement
//               </Text>
//               <Text style={{ marginBottom: 20, lineHeight: 22 }}>
//                 {agreementText}
//               </Text>
//               <View style={s.checkboxRow}>
//                 <Checkbox
//                   value={contractorAgreementChecked}
//                   onValueChange={setContractorAgreementChecked}
//                 />
//                 <Text style={s.checkboxLabel}>I agree to the above terms</Text>
//               </View>
//               <View style={{ marginTop: 20 }}>
//                 <TouchableOpacity
//                   style={s.downloadBtn}
//                   onPress={async () => {
//                     const fileUri =
//                       FileSystem.documentDirectory + "Contractor_Agreement.txt";
//                     await FileSystem.writeAsStringAsync(fileUri, agreementText);
//                     await Sharing.shareAsync(fileUri);
//                   }}
//                 >
//                   <Text style={s.downloadBtnText}>Save or Print Agreement</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => setModalVisible(false)}
//                   style={[s.submitBtn, { marginTop: 20 }]}
//                 >
//                   <Text style={s.submitBtnText}>Close</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </Modal>
//         </View>

//         <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
//           <Text style={s.submitBtnText}>Update Profile</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const s = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", marginTop: 0 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//     marginVertical: 100,
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   label: { marginTop: 12, fontWeight: "600" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginTop: 4,
//   },
//   fileText: { marginVertical: 4, fontStyle: "italic" },
//   uploadBtn: {
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   uploadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
//   downloadBtn: {
//     backgroundColor: "#444",
//     borderRadius: 6,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     alignItems: "center",
//   },
//   downloadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
//   submitBtn: {
//     backgroundColor: "green",
//     borderRadius: 6,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   link: { color: "#0066cc", marginBottom: 4 },
//   imagePreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
//   checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
//   checkboxLabel: { marginLeft: 8, flex: 1 },
// });


import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView, // Added this import
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
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
  ArrowRight, // Already imported, but good to double check
} from "lucide-react-native";
import api from "../api/client";

const SERVICE_TYPES = [
  "Electrician",
  "HVAC",
  "Plumbing",
  "Roofing",
  "Handyman",
];

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
    ssnLast4: "",
    dob: "",
    profilePicture: null,
    email: "",
    phoneNumber: "",
  });
  const [files, setFiles] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
  });
  const [existing, setExisting] = useState({
    w9: null,
    businessLicense: null,
    proofOfInsurance: null,
    profilePictureUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [contractorAgreementChecked, setContractorAgreementChecked] =
    useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/me");
        setProfile({
          aboutMe: data.aboutMe || "",
          yearsExperience: data.yearsExperience?.toString() || "",
          serviceType: data.serviceType || "",
          businessName: data.businessName || "",
          address: data.address || "",
          zipcode: Array.isArray(data.zipcode) ? data.zipcode[0] : data.zipcode || "",
          serviceZipcode: Array.isArray(data.serviceZipcode) ? data.serviceZipcode[0]?.toString() || "" : data.serviceZipcode?.toString() || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          profilePicture: null,
        });
        setExisting({
          w9: data.w9 || null,
          businessLicense: data.businessLicense || null,
          proofOfInsurance: data.proofOfInsurance || null,
          profilePictureUrl: data.profilePicture || null,
        });
        setContractorAgreementChecked(data.acceptedICA || false);
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
        "You must acknowledge the contractor agreement before submitting."
      );
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() !== "") {
          fd.append(key, value);
        }
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file?.uri) {
          fd.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.type,
          });
        }
      });
      if (profile.profilePicture?.uri) {
        fd.append("profilePicture", profile.profilePicture);
      }
      fd.append("acceptedICA", contractorAgreementChecked ? "true" : "false");
      
      await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Profile updated!", [
          { text: "OK", onPress: () => nav.goBack() }
      ]);
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err);
      Alert.alert("Error", "Profile update failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const agreementText = `This Independent Contractor Agreement is made between BlinqFix ("Company") and ${profile.businessName || "[Contractor Name]"} ("Contractor") as of ${new Date().toISOString().split("T")[0]}. [For full legal text, please refer to a legal professional. This is a placeholder summary.] The contractor agrees to provide emergency repair services as an independent entity, responsible for their own taxes and insurance. The company agrees to facilitate job connections and payments. The agreement covers confidentiality, intellectual property, and terms of service. By checking the box, you acknowledge you have read, understood, and agreed to the full terms provided.`;

  const renderUploadSection = (label, key, icon) => (
    <View style={styles.uploadContainer}>
      <View style={styles.uploadInfo}>
        {icon}
        <View>
          <Text style={styles.uploadLabel}>{label}</Text>
          {files[key]?.name ? (
            <Text style={styles.fileSelectedText} numberOfLines={1}>{files[key].name}</Text>
          ) : existing[key] ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <CheckCircle color="#22c55e" size={14} />
                <Text style={styles.fileExistingText}>Document on File</Text>
            </View>
          ) : (
            <Text style={styles.fileMissingText}>No file uploaded</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.uploadButton} onPress={() => pickFile(key)}>
        <UploadCloud color="#60a5fa" size={20} />
      </TouchableOpacity>
    </View>
  );

  const renderTextInput = (label, value, onChange, placeholder, keyboardType = 'default', icon) => (
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
        />
      </View>
    </View>
  );

  if (loading) {
    return (
       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
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
                                    source={{ uri: profile.profilePicture?.uri || existing.profilePictureUrl }}
                                    style={styles.profilePic}
                                />
                            ) : (
                                <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
                                    <User color="#94a3b8" size={60} />
                                </View>
                            )}
                            <TouchableOpacity style={styles.profilePicButton} onPress={async () => {
                                const compressed = await pickAndCompressImage();
                                if (compressed) setProfile(prev => ({ ...prev, profilePicture: compressed }));
                            }}>
                                <Edit color="#fff" size={16} />
                                <Text style={styles.profilePicButtonText}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Personal Details Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Your Details</Text>
                        {renderTextInput("About Me", profile.aboutMe, (t) => setProfile(p => ({...p, aboutMe: t})), "Tell customers about your skills...", 'default', <User color="#94a3b8" size={20} style={styles.inputIcon} />)}
                        {renderTextInput("Years of Experience", profile.yearsExperience, (t) => setProfile(p => ({...p, yearsExperience: t})), "e.g., 10", 'number-pad', <Award color="#94a3b8" size={20} style={styles.inputIcon} />)}
                        {renderTextInput("Email Address", profile.email, (t) => setProfile(p => ({...p, email: t})), "your@email.com", 'email-address', <Mail color="#94a3b8" size={20} style={styles.inputIcon} />)}
                        {renderTextInput("Phone Number", profile.phoneNumber, (t) => setProfile(p => ({...p, phoneNumber: t})), "(123) 456-7890", 'phone-pad', <Phone color="#94a3b8" size={20} style={styles.inputIcon} />)}
                    </View>

                    {/* Business Details Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Business & Service Details</Text>
                        {renderTextInput("Business Name", profile.businessName, (t) => setProfile(p => ({...p, businessName: t})), "Your Company LLC", 'default', <Briefcase color="#94a3b8" size={20} style={styles.inputIcon} />)}
                        {renderTextInput("Business Address", profile.address, (t) => setProfile(p => ({...p, address: t})), "123 Main St, Anytown, USA", 'default', <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />)}
                        {renderTextInput("Service Coverage Zipcode", profile.serviceZipcode, (t) => setProfile(p => ({...p, serviceZipcode: t})), "Enter zip code for job alerts", 'number-pad', <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />)}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Primary Service</Text>
                            <View style={styles.chipsContainer}>
                            {SERVICE_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.chip, profile.serviceType === type && styles.chipSelected]}
                                    onPress={() => setProfile(p => ({ ...p, serviceType: type }))}
                                >
                                    <Wrench color={profile.serviceType === type ? '#fff' : '#60a5fa'} size={14} style={{marginRight: 6}} />
                                    <Text style={[styles.chipText, profile.serviceType === type && styles.chipTextSelected]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        </View>
                    </View>

                    {/* Documents Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Required Documents</Text>
                        {renderUploadSection("W-9 Form", "w9", <FileText color="#94a3b8" size={24} />)}
                        {renderUploadSection("Business License", "businessLicense", <FileText color="#94a3b8" size={24} />)}
                        {renderUploadSection("Proof of Insurance", "proofOfInsurance", <FileText color="#94a3b8" size={24} />)}
                    </View>

                    {/* Agreement Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Legal Agreement</Text>
                        <TouchableOpacity style={styles.agreementContainer} onPress={() => setModalVisible(true)}>
                            <FileSignature color="#60a5fa" size={24} style={{marginRight: 16}} />
                            <Text style={styles.agreementText}>View Independent Contractor Agreement</Text>
                            <ArrowRight color="#60a5fa" size={20} />
                        </TouchableOpacity>
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                style={styles.checkbox}
                                value={contractorAgreementChecked}
                                onValueChange={setContractorAgreementChecked}
                                color={contractorAgreementChecked ? '#22c55e' : '#fff'}
                            />
                            <Text style={styles.checkboxLabel}>I have read and agree to the terms.</Text>
                        </View>
                    </View>
                    
                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        <LinearGradient
                            colors={loading ? ['#6b7280', '#4b5563'] : ['#22c55e', '#16a34a']}
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

        <Modal visible={modalVisible} transparent={true} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Independent Contractor Agreement</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X color="#94a3b8" size={24} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalAgreementText}>{agreementText}</Text>
                        <View style={styles.modalCheckboxContainer}>
                           <Checkbox
                                style={styles.checkbox}
                                value={contractorAgreementChecked}
                                onValueChange={setContractorAgreementChecked}
                                color={contractorAgreementChecked ? '#22c55e' : '#fff'}
                            />
                            <Text style={styles.checkboxLabel}>I have read and agree to the terms.</Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalDownloadButton} onPress={async () => {
                                const fileUri = FileSystem.documentDirectory + "Contractor_Agreement.txt";
                                await FileSystem.writeAsStringAsync(fileUri, agreementText);
                                await Sharing.shareAsync(fileUri);
                            }}>
                                <Download color="#fff" size={18} />
                                <Text style={styles.modalActionButtonText}>Save or Print</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                                <CheckCircle color="#fff" size={18} />
                                <Text style={styles.modalActionButtonText}>Acknowledge & Close</Text>
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
  container: { 
    flex: 1 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  profilePicContainer: {
      alignItems: 'center',
      gap: 16
  },
  profilePic: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: 'rgba(96, 165, 250, 0.5)'
  },
  profilePicPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)'
  },
  profilePicButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(96, 165, 250, 0.8)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
  },
  profilePicButtonText: {
      color: '#fff',
      fontWeight: '600'
  },
  inputGroup: {
      marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    paddingHorizontal: 16
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#fff',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  chipSelected: {
    backgroundColor: '#60a5fa',
    borderColor: '#60a5fa'
  },
  chipText: {
    color: '#60a5fa',
    fontWeight: '600'
  },
  chipTextSelected: {
    color: '#fff'
  },
  uploadContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  uploadInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1
  },
  uploadLabel: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600'
  },
  fileSelectedText: {
      color: '#22c55e',
      fontSize: 12,
      marginTop: 2
  },
  fileExistingText: {
      color: '#22c55e',
      fontSize: 12,
      fontWeight: '500'
  },
  fileMissingText: {
      color: '#94a3b8',
      fontSize: 12,
      marginTop: 2
  },
  uploadButton: {
      backgroundColor: 'rgba(96, 165, 250, 0.2)',
      padding: 10,
      borderRadius: 8
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)'
  },
  agreementText: {
    color: '#fff',
    flex: 1,
    fontWeight: '600',
    fontSize: 16
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    margin: 8,
    width: 20,
    height: 20,
    borderRadius: 4
  },
  checkboxLabel: {
    color: '#e0e7ff',
    flex: 1,
    marginLeft: 8
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden'
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  // Modal Styles
  modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  modalContainer: {
      backgroundColor: '#1e293b',
      borderRadius: 16,
      width: '100%',
      maxHeight: '85%',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  modalScroll: {
      padding: 24,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      flex: 1
  },
  closeButton: {
      padding: 8,
  },
  modalAgreementText: {
      color: '#cbd5e1',
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 24
  },
  modalCheckboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: 'rgba(0,0,0,0.2)',
      padding: 12,
      borderRadius: 8
  },
  modalActions: {
      gap: 12
  },
  modalDownloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 14,
      borderRadius: 12
  },
  modalCloseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#22c55e',
      padding: 14,
      borderRadius: 12,
  },
  modalActionButtonText: {
      color: '#fff',
      fontWeight: '600'
  }
});
