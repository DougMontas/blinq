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
//   Pressable,
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

// const SERVICE_TYPES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];

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
//   const [contractorAgreementChecked, setContractorAgreementChecked] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);

//   const effectiveDate = new Date().toISOString().split("T")[0];
//   const contractorName = profile.businessName || "[Contractor Name]";
//   const contractorAddress = profile.address || "[Contractor Address]";

//   const agreementText = `INDEPENDENT CONTRACTOR AGREEMENT

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

// _______________________________        _______________________________
// BlinqFix (Company)                        ${contractorName} (Contractor)
// Date: ________________________           Date: ________________________`;

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
//           zipcode: Array.isArray(data.zipcode) ? data.zipcode[0] : data.zipcode || "",
//           serviceZipcode: Array.isArray(data.serviceZipcode) ? data.serviceZipcode[0]?.toString() || "" : data.serviceZipcode?.toString() || "",
//           ssnLast4: data.ssnLast4 || "",
//           dob: data.dob || "",
//           profilePicture: null,
//         });
//         setExisting({
//           w9: data.w9 || null,
//           businessLicense: data.businessLicense || null,
//           proofOfInsurance: data.proofOfInsurance || null,
//           independentContractorAgreement: data.independentContractorAgreement || null,
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
//       Alert.alert("Required", "You must acknowledge the contractor agreement before submitting.");
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
//             type: file.mimeType || "application/octet-stream",
//           });
//         }
//       });
//       if (profile.profilePicture?.uri) {
//         fd.append("profilePicture", profile.profilePicture);
//       }
//       fd.append("acceptedICA", contractorAgreementChecked ? "true" : "false");
//       await api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
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
//     <ScrollView contentContainerStyle={s.container}>
//       <BackButton />
//       <Text style={s.header}>Complete Your Profile</Text>

//       <Text style={s.label}>About Me</Text>
// <TextInput
//   style={s.input}
//   multiline
//   value={profile.aboutMe}
//   onChangeText={(t) => setProfile((p) => ({ ...p, aboutMe: t }))}
// />

// <Text style={s.label}>Years of Experience</Text>
// <TextInput
//   style={s.input}
//   keyboardType="number-pad"
//   value={profile.yearsExperience}
//   onChangeText={(t) => setProfile((p) => ({ ...p, yearsExperience: t }))}
// />

// <Text style={s.label}>Service Type</Text>
// <View style={s.pickerWrap}>
//   <Picker
//     selectedValue={profile.serviceType}
//     onValueChange={(v) => setProfile((p) => ({ ...p, serviceType: v }))}
//   >
//     <Picker.Item label="Select…" value="" />
//     {SERVICE_TYPES.map((t) => (
//       <Picker.Item key={t} label={t.replace("_", " ")} value={t} />
//     ))}
//   </Picker>
// </View>

// <Text style={s.label}>Business Name</Text>
// <TextInput
//   style={s.input}
//   value={profile.businessName}
//   onChangeText={(t) => setProfile((p) => ({ ...p, businessName: t }))}
// />

// <Text style={s.label}>Address</Text>
// <TextInput
//   style={s.input}
//   value={profile.address}
//   onChangeText={(t) => setProfile((p) => ({ ...p, address: t }))}
// />

// <Text style={s.label}>Extracted Zipcode</Text>
// <TextInput style={s.input} value={profile.zipcode} editable={false} />

// <Text style={s.label}>Service Coverage Zipcode</Text>
// <TextInput
//   style={s.input}
//   value={profile.serviceZipcode}
//   onChangeText={(t) => setProfile((p) => ({ ...p, serviceZipcode: t }))}
// />

// <Text style={s.label}>Last 4 of SSN</Text>
// <TextInput
//   style={s.input}
//   keyboardType="number-pad"
//   maxLength={4}
//   value={profile.ssnLast4}
//   onChangeText={(t) => setProfile((p) => ({ ...p, ssnLast4: t }))}
// />

// <Text style={s.label}>Date of Birth (YYYY-MM-DD)</Text>
// <TextInput
//   style={s.input}
//   placeholder="e.g. 1985-04-17"
//   value={profile.dob}
//   onChangeText={(t) => setProfile((p) => ({ ...p, dob: t }))}
// />

// <Text style={s.label}>Profile Photo</Text>
// {profile.profilePicture?.uri || existing.profilePictureUrl ? (
//   <Image
//     source={{ uri: profile.profilePicture?.uri || existing.profilePictureUrl }}
//     style={s.imagePreview}
//   />
// ) : null}
// <TouchableOpacity style={s.uploadBtn} onPress={async () => {
//   const compressed = await pickAndCompressImage();
//   if (compressed) {
//     setProfile((prev) => ({ ...prev, profilePicture: compressed }));
//   }
// }}>
//   <Text style={s.uploadBtnText}>Upload Profile Photo</Text>
// </TouchableOpacity>

// {renderUploadSection("W-9", "w9")}
// {renderUploadSection("Business License", "businessLicense")}
// {renderUploadSection("Proof of Insurance", "proofOfInsurance")}
// {/* 
// {renderUploadSection("W-9", "w9")}
// {renderUploadSection("Business License", "businessLicense")}
// {renderUploadSection("Proof of Insurance", "proofOfInsurance")} */}

//       <View style={{ marginTop: 20 }}>
//         <TouchableOpacity style={s.downloadBtn} onPress={() => setModalVisible(true)}>
//           <Text style={s.downloadBtnText}>View Contractor Agreement</Text>
//         </TouchableOpacity>

//         <Modal visible={modalVisible} animationType="slide">
//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>
//               Independent Contractor Agreement
//             </Text>
//             <Text style={{ marginBottom: 20, lineHeight: 22 }}>{agreementText}</Text>
//             <View style={s.checkboxRow}>
//               <Checkbox value={contractorAgreementChecked} onValueChange={setContractorAgreementChecked} />
//               <Text style={s.checkboxLabel}>I agree to the above terms</Text>
//             </View>
//             <View style={{ marginTop: 20 }}>
//               <TouchableOpacity
//                 style={s.downloadBtn}
//                 onPress={async () => {
//                   const fileUri = FileSystem.documentDirectory + "Contractor_Agreement.txt";
//                   await FileSystem.writeAsStringAsync(fileUri, agreementText);
//                   await Sharing.shareAsync(fileUri);
//                 }}>
//                 <Text style={s.downloadBtnText}>Save or Print Agreement</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => setModalVisible(false)}
//                 style={[s.submitBtn, { marginTop: 20 }]}
//               >
//                 <Text style={s.submitBtnText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </Modal>
//       </View>

//       <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
//         <Text style={s.submitBtnText}>Update Profile</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const s = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", marginTop: 0 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
//   label: { marginTop: 12, fontWeight: "600" },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginTop: 4 },
//   fileText: { marginVertical: 4, fontStyle: "italic" },
//   uploadBtn: { backgroundColor: "#1976d2", borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, marginTop: 8, alignItems: "center" },
//   uploadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
//   downloadBtn: { backgroundColor: "#444", borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
//   downloadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
//   submitBtn: { backgroundColor: "green", borderRadius: 6, paddingVertical: 14, paddingHorizontal: 24, alignItems: "center", marginTop: 20 },
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
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import api from "../api/client";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import BackButton from "../components/BackButton";
import Checkbox from "expo-checkbox";
import ScreenWrapper from "../components/ScreenWrapper";

const SERVICE_TYPES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];

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
  const [contractorAgreementChecked, setContractorAgreementChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const effectiveDate = new Date().toISOString().split("T")[0];
  const contractorName = profile.businessName || "[Contractor Name]";
  const contractorAddress = profile.address || "[Contractor Address]";

  const agreementText = `

This Independent Contractor Agreement (\"Agreement\") is made and entered into as of ${effectiveDate} by and between:

BlinqFix
(\"BlinqFix\" or \"Company\")

and

${contractorName}
Address: ${contractorAddress}
(\"Contractor\").

1. ENGAGEMENT OF SERVICES
   1.1 Services. BlinqFix hereby engages Contractor, and Contractor agrees to provide the following services (\"Services\"):
       (a) Emergency repair services, installation, maintenance, etc.
       (b) Contractor shall perform the Services in a professional and workmanlike manner in accordance with industry standards.

   1.2 Independent Contractor Status. Contractor is engaged as an independent contractor. Nothing in this Agreement shall be construed as creating an employer–employee relationship, a partnership, or a joint venture. Contractor is solely responsible for payment of all federal, state, and local taxes and for any benefits, insurance, or other expenses.

2. TERM
   This Agreement shall commence on the Effective Date and continue until terminated by either party as provided herein.

3. COMPENSATION
   3.1 Fees. In consideration for the performance of the Services, BlinqFix shall pay Contractor as follows:
       (a) A fee of [Fee Amount] per [hour/job/project], payable [weekly/monthly/upon completion].
       (b) Reimbursement for pre-approved expenses incurred in connection with the Services.

   3.2 Invoices. Contractor shall submit invoices detailing the Services performed and expenses incurred. Payment shall be due within [number] days of receipt of each invoice.

4. EQUIPMENT AND MATERIALS
   Contractor shall supply all tools, equipment, and materials necessary to perform the Services unless otherwise agreed by the parties. BlinqFix will provide access to its premises or systems as required.

5. CONFIDENTIALITY
   5.1 Confidential Information. In the course of performing the Services, Contractor may have access to confidential and proprietary information (\"Confidential Information\"). Contractor agrees not to disclose or use any Confidential Information except as necessary for the performance of the Services.
   5.2 Return of Materials. Upon termination of this Agreement, Contractor shall promptly return or destroy all Confidential Information and related materials.

6. INTELLECTUAL PROPERTY
   6.1 Work Product. Any work product, invention, improvement, or development created by Contractor in connection with the Services (\"Work Product\") shall be the exclusive property of BlinqFix. Contractor hereby assigns all rights, title, and interest in and to the Work Product to BlinqFix.
   6.2 License. Contractor grants BlinqFix a non-exclusive, royalty-free, perpetual license to use any pre-existing intellectual property incorporated in the Work Product.

7. TERMINATION
   7.1 Termination for Convenience. Either party may terminate this Agreement at any time by providing [number] days' written notice to the other party.
   7.2 Termination for Cause. Either party may terminate this Agreement immediately upon written notice if the other party materially breaches any term or condition of this Agreement and fails to cure such breach within [number] days of notice.

8. INDEMNIFICATION
   Contractor agrees to indemnify, defend, and hold harmless BlinqFix, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, or liabilities (including reasonable attorneys' fees) arising out of or in connection with Contractor’s performance of the Services or breach of this Agreement.

9. LIMITATION OF LIABILITY
   In no event shall either party be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to this Agreement, even if advised of the possibility of such damages. BlinqFix's total liability for any claim arising under this Agreement shall not exceed the total fees paid by BlinqFix to Contractor.

10. GOVERNING LAW
    This Agreement shall be governed by and construed in accordance with the laws of the United States of America. The parties agree that any disputes arising under or in connection with this Agreement shall be resolved in the federal courts of the United States, with any applicable state law provisions considered as necessary.

11. ENTIRE AGREEMENT
    This Agreement constitutes the entire agreement between the parties regarding the subject matter herein and supersedes all prior discussions, negotiations, and agreements (whether written or oral). Any modifications or amendments must be in writing and signed by both parties.

12. SEVERABILITY
    If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

13. NOTICES
    All notices under this Agreement shall be in writing and delivered personally or sent by certified mail, return receipt requested, to the addresses provided above or to any other address that either party may designate in writing.

IN WITNESS WHEREOF, the parties hereto have executed this Independent Contractor Agreement as of the Effective Date.

// _______________________________        _______________________________
// BlinqFix (Company)                        ${contractorName} (Contractor)
// Date: ________________________           Date: ________________________
`;

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
          zipcode: Array.isArray(data.zipcode) ? data.zipcode[0] : data.zipcode || "",
          serviceZipcode: Array.isArray(data.serviceZipcode) ? data.serviceZipcode[0]?.toString() || "" : data.serviceZipcode?.toString() || "",
          ssnLast4: data.ssnLast4 || "",
          dob: data.dob || "",
          profilePicture: null,
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
        });
        setExisting({
          w9: data.w9 || null,
          businessLicense: data.businessLicense || null,
          proofOfInsurance: data.proofOfInsurance || null,
          independentContractorAgreement: data.independentContractorAgreement || null,
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

  const handleSubmit = async () => {
    if (!contractorAgreementChecked) {
      Alert.alert("Required", "You must acknowledge the contractor agreement before submitting.");
      return;
    }
    try {
      setLoading(true);
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
            type: file.mimeType || "application/octet-stream",
          });
        }
      });
      if (profile.profilePicture?.uri) {
        fd.append("profilePicture", profile.profilePicture);
      }
      fd.append("acceptedICA", contractorAgreementChecked ? "true" : "false");
      await api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("Success", "Profile updated!");
      nav.replace("ServiceProviderDashboard");
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err);
      Alert.alert("Error", "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const renderUploadSection = (label, key) => (
    <View style={{ marginTop: 12 }}>
      <TouchableOpacity style={s.uploadBtn} onPress={() => pickFile(key)}>
        <Text style={s.uploadBtnText}>Upload {label}</Text>
      </TouchableOpacity>
      {files[key]?.name && <Text style={s.fileText}>✅ {files[key].name}</Text>}
    </View>
  );
  

  return (
    <ScreenWrapper>
    <ScrollView contentContainerStyle={s.container}>
      <BackButton />
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
<Text style={s.label}>Email</Text>
      <TextInput
        style={s.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={profile.email}
        onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
      />

      <Text style={s.label}>Phone Number</Text>
      <TextInput
        style={s.input}
        keyboardType="phone-pad"
        value={profile.phoneNumber}
        onChangeText={(t) => setProfile((p) => ({ ...p, phoneNumber: t }))}
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

<Text style={s.label}>Last 4 of SSN</Text>
<TextInput
  style={s.input}
  keyboardType="number-pad"
  maxLength={4}
  value={profile.ssnLast4}
  onChangeText={(t) => setProfile((p) => ({ ...p, ssnLast4: t }))}
/>

<Text style={s.label}>Date of Birth (YYYY-MM-DD)</Text>
<TextInput
  style={s.input}
  placeholder="e.g. 1985-04-17"
  value={profile.dob}
  onChangeText={(t) => setProfile((p) => ({ ...p, dob: t }))}
/>

<Text style={s.label}>Profile Photo</Text>
{profile.profilePicture?.uri || existing.profilePictureUrl ? (
  <Image
    source={{ uri: profile.profilePicture?.uri || existing.profilePictureUrl }}
    style={s.imagePreview}
  />
) : null}
<TouchableOpacity style={s.uploadBtn} onPress={async () => {
  const compressed = await pickAndCompressImage();
  if (compressed) {
    setProfile((prev) => ({ ...prev, profilePicture: compressed }));
  }
}}>
  <Text style={s.uploadBtnText}>Upload Profile Photo</Text>
</TouchableOpacity>

{renderUploadSection("W-9", "w9")}
{renderUploadSection("Business License", "businessLicense")}
{renderUploadSection("Proof of Insurance", "proofOfInsurance")}
{/* 
{renderUploadSection("W-9", "w9")}
{renderUploadSection("Business License", "businessLicense")}
{renderUploadSection("Proof of Insurance", "proofOfInsurance")} */}

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={s.downloadBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.downloadBtnText}>View Contractor Agreement</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide">
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>
              Independent Contractor Agreement
            </Text>
            <Text style={{ marginBottom: 20, lineHeight: 22 }}>{agreementText}</Text>
            <View style={s.checkboxRow}>
              <Checkbox value={contractorAgreementChecked} onValueChange={setContractorAgreementChecked} />
              <Text style={s.checkboxLabel}>I agree to the above terms</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                style={s.downloadBtn}
                onPress={async () => {
                  const fileUri = FileSystem.documentDirectory + "Contractor_Agreement.txt";
                  await FileSystem.writeAsStringAsync(fileUri, agreementText);
                  await Sharing.shareAsync(fileUri);
                }}>
                <Text style={s.downloadBtnText}>Save or Print Agreement</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[s.submitBtn, { marginTop: 20 }]}
              >
                <Text style={s.submitBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </View>

      <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
        <Text style={s.submitBtnText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", marginTop: 0 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, marginVertical: 100 },
  label: { marginTop: 12, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginTop: 4 },
  fileText: { marginVertical: 4, fontStyle: "italic" },
  uploadBtn: { backgroundColor: "#1976d2", borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, marginTop: 8, alignItems: "center" },
  uploadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  downloadBtn: { backgroundColor: "#444", borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
  downloadBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  submitBtn: { backgroundColor: "green", borderRadius: 6, paddingVertical: 14, paddingHorizontal: 24, alignItems: "center", marginTop: 20 },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: "#0066cc", marginBottom: 4 },
  imagePreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkboxLabel: { marginLeft: 8, flex: 1 },
});
