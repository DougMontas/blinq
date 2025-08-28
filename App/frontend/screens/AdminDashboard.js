// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   Switch,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import { useNavigation } from "@react-navigation/native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import api from "../api/client";
// // import LogoutButton from "../components/LogoutButton";

// // export default function AdminDashboard() {
// //   const navigation = useNavigation();

// //   const [providerCount, setProviderCount] = useState(0);
// //   const [customerCount, setCustomerCount] = useState(0);
// //   const [providers, setProviders] = useState([]);
// //   const [selectedProviderId, setSelectedProviderId] = useState(null);
// //   const [zipCodesInput, setZipCodesInput] = useState("");
// //   const [zipSearch, setZipSearch] = useState("");
// //   const [zipProCount, setZipProCount] = useState(null);
// //   const [serviceTypeSearch, setServiceTypeSearch] = useState("");

// //   const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
// //   const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [readyProviders, setReadyProviders] = useState([]);
// //   const SERVICE_TYPES = [
// //     "Electrician",
// //     "HVAC",
// //     "Plumbing",
// //     "Roofing",
// //     "Handyman",
// //   ];

// //   const [jobCounts, setJobCounts] = useState({
// //     completed: 0,
// //     pending: 0,
// //     invited: 0,
// //     canceled: 0,
// //     cancelled_by_provider: 0,
// //   });

// //   const [mediaQuery, setMediaQuery] = useState({ jobId: "", address: "" });
// //   const [mediaResults, setMediaResults] = useState([]);
// //   const [mediaLoading, setMediaLoading] = useState(false);

// //   useEffect(() => {
// //     const fetchStats = async () => {
// //       try {
// //         const res = await api.get("/admin/admin/stats");
// //         setCustomerCount(res.data.totalCustomers || 0);
// //         setProviderCount(res.data.totalProviders || 0);
// //       } catch (err) {
// //         console.error("Error fetching stats:", err);
// //       }
// //     };
// //     fetchStats();
// //   }, []);

// //   useEffect(() => {
// //     const fetchFees = async () => {
// //       try {
// //         const res = await api.get("/admin/convenience-fees");
// //         const payload = res.data.data || res.data || {};
// //         setFeesData({
// //           monthlyFees: Array.isArray(payload.monthlyFees)
// //             ? payload.monthlyFees
// //             : [],
// //           ytdTotal: typeof payload.ytdTotal === "number" ? payload.ytdTotal : 0,
// //         });
// //       } catch (err) {
// //         console.error("Error fetching convenience fees:", err);
// //       }
// //     };
// //     fetchFees();
// //     const id = setInterval(fetchFees, 25000);
// //     return () => clearInterval(id);
// //   }, []);

// //   useEffect(() => {
// //     const fetchConfig = async () => {
// //       try {
// //         const res = await api.get("/admin/configuration");
// //         setHardcodedEnabled(Boolean(res.data.hardcodedEnabled));
// //       } catch (err) {
// //         console.error("Error fetching configuration:", err);
// //       }
// //     };
// //     fetchConfig();
// //   }, []);

// //   useEffect(() => {
// //     const fetchJobs = async () => {
// //       try {
// //         const token = await AsyncStorage.getItem("token");
// //         // console.log("🔐 Token fetched:", token);

// //         const res = await api.get("/admin/jobs", {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });

// //         // console.log("📥 Jobs response:", res.data);

// //         const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];

// //         const counts = jobs.reduce(
// //           (acc, job) => {
// //             let status = (job.status || "").toLowerCase();

// //             if (status.startsWith("cancelled-by")) {
// //               status = "cancelled_by_provider";
// //             } else if (status === "cancelled-auto") {
// //               status = "canceled";
// //             }

// //             if (acc[status] !== undefined) acc[status]++;
// //             return acc;
// //           },
// //           {
// //             completed: 0,
// //             pending: 0,
// //             invited: 0,
// //             canceled: 0,
// //             cancelled_by_provider: 0,
// //           }
// //         );

// //         console.log("📊 Computed job counts:", counts);
// //         setJobCounts(counts);
// //       } catch (err) {
// //         console.error(
// //           "❌ Error fetching jobs:",
// //           err?.response?.data || err.message
// //         );
// //       }
// //     };

// //     fetchJobs();
// //     const id = setInterval(fetchJobs, 10000);
// //     return () => clearInterval(id);
// //   }, []);

// //   useEffect(() => {
// //     const fetchProviders = async () => {
// //       try {
// //         const res = await api.get(
// //           "/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive,billingTier,zipCodes"
// //         );
// //         const list = Array.isArray(res.data.providers)
// //           ? res.data.providers
// //           : [];
// //         setProviders(list);
// //       } catch (err) {
// //         console.error("Error fetching providers:", err);
// //       }
// //     };
// //     fetchProviders();
// //   }, []);

// //   const fetchCompleteProviders = async () => {
// //     try {
// //       const res = await api.get("/admin/complete-providers");
// //       const list = res.data.providers || [];
// //       if (list.length === 0) {
// //         Alert.alert("None Found", "No ready-to-activate providers.");
// //       }
// //       setReadyProviders(list);
// //     } catch (err) {
// //       console.error("❌ Failed to fetch complete providers:", err);
// //       Alert.alert("Error", "Could not fetch provider list.");
// //     }
// //   };

// //   const activateAllProviders = async () => {
// //     try {
// //       const results = [];
// //       for (let provider of readyProviders) {
// //         const res = await api.put(`/admin/provider/${provider._id}/activate`);
// //         results.push(res.data.user);
// //       }
// //       Alert.alert("Success", `${results.length} providers activated.`);
// //       setReadyProviders([]);
// //     } catch (err) {
// //       console.error("❌ Failed to activate all:", err);
// //       Alert.alert("Error", "Failed to activate some users.");
// //     }
// //   };

// //   const activateOneProvider = async (providerId) => {
// //     try {
// //       await api.put(`/admin/provider/${providerId}/activate`);
// //       setReadyProviders((prev) => prev.filter((p) => p._id !== providerId));
// //       Alert.alert("Activated", "Provider marked active.");
// //     } catch (err) {
// //       console.error("❌ Error activating provider:", err);
// //       Alert.alert("Error", "Failed to activate this provider.");
// //     }
// //   };

// //   const handleToggleActive = async (providerId, currentValue) => {
// //     try {
// //       const newValue = !currentValue;
// //       await api.put(`/admin/provider/${providerId}/active`, {
// //         isActive: newValue,
// //       });
// //       setProviders((prev) =>
// //         prev.map((p) =>
// //           p._id === providerId ? { ...p, isActive: newValue } : p
// //         )
// //       );
// //     } catch (err) {
// //       console.error("Error updating provider status:", err);
// //       Alert.alert("Error", "Failed to update provider status");
// //     }
// //   };

// //   const handleSelectProvider = (providerId) => {
// //     setSelectedProviderId(providerId);
// //     setZipCodesInput("");
// //   };

// //   const updateZipCodes = async () => {
// //     if (!selectedProviderId) return;
// //     const zips = zipCodesInput
// //       .split(",")
// //       .map((z) => z.trim())
// //       .filter(Boolean);
// //     try {
// //       await api.put(`/admin/provider/${selectedProviderId}/zipcodes`, {
// //         zipCodes: zips,
// //       });
// //       Alert.alert("Success", "ZIP codes updated!");
// //     } catch (err) {
// //       console.error("Error updating ZIP codes:", err);
// //       Alert.alert("Error", "Failed to update ZIP codes");
// //     }
// //   };

// //   const filteredProviders = providers.filter((p) => {
// //     const q = searchTerm.toLowerCase();
// //     return (
// //       p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
// //     );
// //   });

// //   const handleZipSearch = async () => {
// //     try {
// //       const res = await api.get(
// //         "/admin/users?role=serviceProvider&fields=_id,billingTier,serviceZipcode,serviceType"
// //       );
// //       const allProviders = Array.isArray(res.data.providers)
// //         ? res.data.providers
// //         : [];

// //       const normalizedZip = zipSearch.trim();
// //       const normalizedServiceType = serviceTypeSearch.trim().toLowerCase();
// //       let count = 0;

// //       for (const p of allProviders) {
// //         const isHybrid = p.billingTier === "hybrid";
// //         const matchesService =
// //           (p.serviceType || "").toLowerCase() === normalizedServiceType;

// //         // console.log("p>>>>", JSON.stringify(p));
// //         if (!isHybrid || !matchesService) continue;

// //         const z = p.serviceZipcode;
// //         let zipMatch = false;

// //         if (typeof z === "string" || typeof z === "number") {
// //           zipMatch = String(z).trim() === normalizedZip;
// //         } else if (Array.isArray(z)) {
// //           zipMatch = z.some((item) => String(item).trim() === normalizedZip);
// //         }

// //         if (zipMatch) {
// //           count++;
// //           // console.log(`✅ Match: ${p.name} | ZIP: ${normalizedZip}`);
// //         } else {
// //           // console.log(`❌ No Match for ZIP: ${normalizedZip} in`, z);
// //         }
// //       }

// //       const available = Math.max(0, 7 - count);
// //       // console.log("ZIP:", normalizedZip);
// //       // console.log("Service Type:", normalizedServiceType);
// //       // console.log("Hybrid Providers Found:", count);
// //       // console.log("Available Slots:", available);

// //       setZipProCount(
// //         `${count} taken / out of 7 = ${available} slots available`
// //       );
// //     } catch (err) {
// //       console.error("Error during ZIP search:", err);
// //       setZipProCount("Error fetching data");
// //     }
// //   };

// //   const cancelStaleJobs = async () => {
// //     try {
// //       const res = await api.put("/admin/jobs/cancel-stale");
// //       Alert.alert("Success", res.data?.message || "Pending jobs cancelled.");
// //     } catch (err) {
// //       console.error("Error cancelling jobs:", err);
// //       Alert.alert("Error", "Failed to cancel pending jobs.");
// //     }
// //   };

// //   const fetchJobMedia = async () => {
// //     try {
// //       setMediaLoading(true);
// //       const params = {};
// //       if (mediaQuery.jobId.trim()) params.jobId = mediaQuery.jobId.trim();
// //       if (mediaQuery.address.trim()) params.address = mediaQuery.address.trim();
// //       if (!params.jobId && !params.address) {
// //         Alert.alert("Enter Job ID or Address");
// //         return;
// //       }

// //       const res = await api.get("/admin/job-media", { params });
// //       setMediaResults(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
// //       if (!res.data?.jobs?.length) {
// //         Alert.alert("No Results", "No jobs or images found for your query.");
// //       }
// //     } catch (err) {
// //       console.error("❌ fetchJobMedia error:", err?.response?.data || err.message);
// //       Alert.alert("Error", err?.response?.data?.msg || "Failed to fetch media.");
// //     } finally {
// //       setMediaLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container}>
// //       <LogoutButton />
// //       <Text style={styles.title}>Admin Dashboard</Text>

// //       <View style={styles.cardRow}>
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>Total Customers</Text>
// //           <Text style={styles.cardValue}>{customerCount}</Text>
// //         </View>
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>Total Providers</Text>
// //           <Text style={styles.cardValue}>{providerCount}</Text>
// //         </View>
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>YTD Fees</Text>
// //           <Text style={styles.cardValue}>${feesData.ytdTotal.toFixed(2)}</Text>
// //         </View>
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Monthly Fees Breakdown</Text>
// //         {feesData.monthlyFees.length > 0 ? (
// //           feesData.monthlyFees.map((fee, idx) => (
// //             <Text key={idx}>
// //               Month {fee._id.month}/{fee._id.year}: $
// //               {(fee.totalConvenienceFee || 0).toFixed(2)}
// //             </Text>
// //           ))
// //         ) : (
// //           <Text>No convenience fees found.</Text>
// //         )}
// //       </View>

// //       <TouchableOpacity style={styles.updateBtn} onPress={cancelStaleJobs}>
// //         <Text style={styles.updateBtnText}>Cancel All Stale Jobs</Text>
// //       </TouchableOpacity>

// //       <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Global Config</Text>
// //         <View style={styles.switchRow}>
// //           <Text style={{ marginRight: 8 }}>Hardcoded Providers Enabled:</Text>
// //           <Switch value={hardcodedEnabled} onValueChange={handleToggleActive} />
// //         </View>
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Ready-to-Activate Providers</Text>
// //         <TouchableOpacity
// //           style={styles.updateBtn}
// //           onPress={fetchCompleteProviders}
// //         >
// //           <Text style={styles.updateBtnText}>Load Ready Providers</Text>
// //         </TouchableOpacity>

// //         {readyProviders.length > 0 && (
// //           <>
// //             {readyProviders.map((p) => (
// //               <View key={p._id} style={styles.providerRow}>
// //                 <Text style={styles.providerLabel}>{p.name}</Text>
// //                 <TouchableOpacity
// //                   style={[styles.updateBtn, { padding: 6 }]}
// //                   onPress={() => activateOneProvider(p._id)}
// //                 >
// //                   <Text style={{ color: "#fff" }}>Activate</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             ))}
// //             <TouchableOpacity
// //               style={styles.updateBtn}
// //               onPress={activateAllProviders}
// //             >
// //               <Text style={styles.updateBtnText}>Activate All</Text>
// //             </TouchableOpacity>
// //           </>
// //         )}
// //       </View>

// //       {/* <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Ready-to-Activate Providers</Text>
// //         <TouchableOpacity
// //           style={styles.updateBtn}
// //           onPress={async () => {
// //             try {
// //               const res = await api.get("/admin/complete-providers");
// //               const list = res.data.providers || [];
// //               if (list.length === 0) {
// //                 Alert.alert("None Found", "No ready-to-activate providers.");
// //               } else {
// //                 const names = list
// //                   .map((p) => `• ${p.name} (${p._id})`)
// //                   .join("\n");
// //                 Alert.alert("Ready to Activate", names);
// //               }
// //             } catch (err) {
// //               console.error("❌ Failed to fetch complete providers:", err);
// //               Alert.alert("Error", "Could not fetch provider list.");
// //             }
// //           }}
// //         >
// //           <Text style={styles.updateBtnText}>Show Ready Providers</Text>
// //         </TouchableOpacity>
// //       </View> */}

// //       <Text style={styles.subtitle}>Job Status Overview</Text>
// //       <View style={styles.cardRow}>
// //         {["completed", "pending", "invited"].map((key) => (
// //           <View key={key} style={styles.card}>
// //             <Text style={styles.cardTitle}>
// //               {key.charAt(0).toUpperCase() + key.slice(1)}
// //             </Text>
// //             <Text style={styles.cardValue}>{jobCounts[key]}</Text>
// //           </View>
// //         ))}
// //       </View>
// //       <View style={styles.cardRow}>
// //         {["canceled", "cancelled_by_provider"].map((key) => (
// //           <View key={key} style={styles.card}>
// //             <Text style={styles.cardTitle}>
// //               {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
// //             </Text>
// //             <Text style={styles.cardValue}>{jobCounts[key]}</Text>
// //           </View>
// //         ))}
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Service Providers</Text>
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Search providers"
// //           value={searchTerm}
// //           onChangeText={setSearchTerm}
// //         />
// //         {filteredProviders.map((provider) => (
// //           <View key={provider._id} style={styles.providerRow}>
// //             <TouchableOpacity
// //               style={styles.providerLabel}
// //               onPress={() => handleSelectProvider(provider._id)}
// //             >
// //               <Text>
// //                 {provider.name} ({provider.email})
// //               </Text>
// //               <Text>{provider.billingTier}</Text>
// //               <Text>
// //                 Service: {provider.serviceType} • Active:{" "}
// //                 {provider.isActive ? "Yes" : "No"}
// //               </Text>
// //             </TouchableOpacity>
// //             <Switch
// //               value={provider.isActive}
// //               onValueChange={() =>
// //                 handleToggleActive(provider._id, provider.isActive)
// //               }
// //             />
// //           </View>
// //         ))}
// //       </View>

// //       {selectedProviderId && (
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>
// //             Update ZIP Codes for {selectedProviderId}
// //           </Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="ZIP Codes (comma separated)"
// //             value={zipCodesInput}
// //             onChangeText={setZipCodesInput}
// //           />
// //           <TouchableOpacity style={styles.updateBtn} onPress={updateZipCodes}>
// //             <Text style={styles.updateBtnText}>Save ZIP Codes</Text>
// //           </TouchableOpacity>
// //         </View>
// //       )}
// //       <View style={styles.card}>
// //         <Text style={styles.cardTitle}>Check ZIP Code Capacity</Text>
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Enter ZIP code"
// //           value={zipSearch}
// //           onChangeText={setZipSearch}
// //         />
// //         {/* <TextInput
// //           style={styles.input}
// //           placeholder="Enter Service Type"
// //           value={serviceTypeSearch}
// //           onChangeText={setServiceTypeSearch}
// //         /> */}
// //         <Text style={styles.label}>Select Service Type</Text>
// //         <View style={styles.selectRow}>
// //           {SERVICE_TYPES.map((type) => (
// //             <TouchableOpacity
// //               key={type}
// //               style={[
// //                 styles.buttonOption,
// //                 serviceTypeSearch === type && styles.buttonSelected,
// //               ]}
// //               onPress={() => setServiceTypeSearch(type)}
// //             >
// //               <Text
// //                 style={[
// //                   styles.buttonText,
// //                   serviceTypeSearch === type && styles.buttonTextSelected,
// //                 ]}
// //               >
// //                 {type}
// //               </Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>

// //         <TouchableOpacity style={styles.updateBtn} onPress={handleZipSearch}>
// //           <Text style={styles.updateBtnText}>
// //             Search ZIP Code + Service Type
// //           </Text>
// //         </TouchableOpacity>
// //         {zipProCount !== null && (
// //           <Text style={{ marginTop: 10, fontSize: 20 }}>
// //             Hybrid pros in {zipSearch} for {serviceTypeSearch}: {zipProCount}
// //           </Text>
// //         )}
// //       </View>

// //       <View style={styles.card}>
// //   <Text style={styles.cardTitle}>Job Media Lookup</Text>

// //   <TextInput
// //     style={styles.input}
// //     placeholder="Job ID"
// //     value={mediaQuery.jobId}
// //     onChangeText={(t) => setMediaQuery((q) => ({ ...q, jobId: t }))}
// //   />
// //   <Text style={{ textAlign: "center", marginVertical: 4 }}>— or —</Text>
// //   <TextInput
// //     style={styles.input}
// //     placeholder="Address (starts with...)"
// //     value={mediaQuery.address}
// //     onChangeText={(t) => setMediaQuery((q) => ({ ...q, address: t }))}
// //   />

// //   <TouchableOpacity style={styles.updateBtn} onPress={fetchJobMedia} disabled={mediaLoading}>
// //     <Text style={styles.updateBtnText}>
// //       {mediaLoading ? "Searching…" : "Search Media"}
// //     </Text>
// //   </TouchableOpacity>

// //   {mediaResults.map((job) => (
// //     <View key={job.jobId} style={{ marginTop: 12 }}>
// //       <Text style={{ fontWeight: "600" }}>
// //         {job.address || "(no address)"} — {job.jobId}
// //       </Text>
// //       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
// //         {job.images.map((img, idx) => (
// //           <View key={`${job.jobId}-${idx}`} style={{ marginRight: 8, alignItems: "center" }}>
// //             <Image
// //               source={{ uri: img.src }} // data:image/...;base64,...
// //               style={{ width: 120, height: 120, borderRadius: 6, backgroundColor: "#eaeaea" }}
// //               resizeMode="cover"
// //             />
// //             <Text style={{ fontSize: 12, marginTop: 4 }}>{img.kind}</Text>
// //           </View>
// //         ))}
// //       </ScrollView>
// //       {!job.images.length && <Text style={{ color: "#777", marginTop: 6 }}>No images</Text>}
// //     </View>
// //   ))}
// // </View>

// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", padding: 16, marginVertical: 45 },
// //   title: {
// //     fontSize: 22,
// //     fontWeight: "bold",
// //     marginVertical: 8,
// //     textAlign: "center",
// //     textShadowColor: "rgba(0,0,0,0.5)",
// //     textShadowOffset: { width: 1, height: 2 },
// //     textShadowRadius: 2,
// //   },
// //   subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
// //   cardRow: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     justifyContent: "space-between",
// //     marginBottom: 16,
// //   },
// //   card: {
// //     backgroundColor: "#f0f0f0",
// //     padding: 12,
// //     borderRadius: 6,
// //     marginBottom: 16,
// //     flex: 1,
// //     marginRight: 8,
// //   },
// //   cardTitle: { fontWeight: "bold", marginBottom: 6 },
// //   cardValue: { fontSize: 20, fontWeight: "600" },
// //   switchRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 6,
// //     padding: 8,
// //     marginVertical: 8,
// //   },
// //   providerRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 12,
// //   },
// //   providerLabel: { flex: 1, marginRight: 10 },
// //   updateBtn: {
// //     marginTop: 8,
// //     padding: 12,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center",
// //   },
// //   updateBtnText: { color: "#fff", fontWeight: "600" },
// //   buttonOption: {
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //     backgroundColor: "#f0f0f0",
// //     borderRadius: 6,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //   },

// //   buttonSelected: {
// //     backgroundColor: "#1976d2",
// //     borderColor: "#1976d2",
// //   },

// //   buttonText: {
// //     fontSize: 14,
// //     color: "#333",
// //     fontWeight: "500",
// //   },

// //   buttonTextSelected: {
// //     color: "#fff",
// //   },
// // });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Switch,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Image, // ✅ needed for rendering media
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import LogoutButton from "../components/LogoutButton";

// export default function AdminDashboard() {
//   const navigation = useNavigation();

//   const [providerCount, setProviderCount] = useState(0);
//   const [customerCount, setCustomerCount] = useState(0);
//   const [providers, setProviders] = useState([]);
//   const [selectedProviderId, setSelectedProviderId] = useState(null);
//   const [zipCodesInput, setZipCodesInput] = useState("");
//   const [zipSearch, setZipSearch] = useState("");
//   const [zipProCount, setZipProCount] = useState(null);
//   const [serviceTypeSearch, setServiceTypeSearch] = useState("");

//   const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
//   const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [readyProviders, setReadyProviders] = useState([]);

//   const SERVICE_TYPES = [
//     "Electrician",
//     "HVAC",
//     "Plumbing",
//     "Roofing",
//     "Handyman",
//   ];

//   const [jobCounts, setJobCounts] = useState({
//     completed: 0,
//     pending: 0,
//     invited: 0,
//     canceled: 0,
//     cancelled_by_provider: 0,
//   });

//   // ---- Media search state ----
//   const [mediaQuery, setMediaQuery] = useState({ jobId: "", address: "" });
//   const [mediaResults, setMediaResults] = useState([]);
//   const [mediaLoading, setMediaLoading] = useState(false);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get("/admin/admin/stats");
//         setCustomerCount(res.data.totalCustomers || 0);
//         setProviderCount(res.data.totalProviders || 0);
//       } catch (err) {
//         console.error("Error fetching stats:", err);
//       }
//     };
//     fetchStats();
//   }, []);

//   useEffect(() => {
//     const fetchFees = async () => {
//       try {
//         const res = await api.get("/admin/convenience-fees");
//         const payload = res.data.data || res.data || {};
//         setFeesData({
//           monthlyFees: Array.isArray(payload.monthlyFees)
//             ? payload.monthlyFees
//             : [],
//           ytdTotal: typeof payload.ytdTotal === "number" ? payload.ytdTotal : 0,
//         });
//       } catch (err) {
//         console.error("Error fetching convenience fees:", err);
//       }
//     };
//     fetchFees();
//     const id = setInterval(fetchFees, 25000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await api.get("/admin/configuration");
//         setHardcodedEnabled(Boolean(res.data.hardcodedEnabled));
//       } catch (err) {
//         console.error("Error fetching configuration:", err);
//       }
//     };
//     fetchConfig();
//   }, []);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");

//         const res = await api.get("/admin/jobs", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];

//         const counts = jobs.reduce(
//           (acc, job) => {
//             let status = (job.status || "").toLowerCase();

//             if (status.startsWith("cancelled-by")) {
//               status = "cancelled_by_provider";
//             } else if (status === "cancelled-auto") {
//               status = "canceled";
//             }

//             if (acc[status] !== undefined) acc[status]++;
//             return acc;
//           },
//           {
//             completed: 0,
//             pending: 0,
//             invited: 0,
//             canceled: 0,
//             cancelled_by_provider: 0,
//           }
//         );

//         setJobCounts(counts);
//       } catch (err) {
//         console.error("❌ Error fetching jobs:", err?.response?.data || err.message);
//       }
//     };

//     fetchJobs();
//     const id = setInterval(fetchJobs, 10000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const res = await api.get(
//           "/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive,billingTier,zipCodes"
//         );
//         const list = Array.isArray(res.data.providers)
//           ? res.data.providers
//           : [];
//         setProviders(list);
//       } catch (err) {
//         console.error("Error fetching providers:", err);
//       }
//     };
//     fetchProviders();
//   }, []);

//   const fetchCompleteProviders = async () => {
//     try {
//       const res = await api.get("/admin/complete-providers");
//       const list = res.data.providers || [];
//       if (list.length === 0) {
//         Alert.alert("None Found", "No ready-to-activate providers.");
//       }
//       setReadyProviders(list);
//     } catch (err) {
//       console.error("❌ Failed to fetch complete providers:", err);
//       Alert.alert("Error", "Could not fetch provider list.");
//     }
//   };

//   const activateAllProviders = async () => {
//     try {
//       const results = [];
//       for (let provider of readyProviders) {
//         const res = await api.put(`/admin/provider/${provider._id}/activate`);
//         results.push(res.data.user);
//       }
//       Alert.alert("Success", `${results.length} providers activated.`);
//       setReadyProviders([]);
//     } catch (err) {
//       console.error("❌ Failed to activate all:", err);
//       Alert.alert("Error", "Failed to activate some users.");
//     }
//   };

//   const activateOneProvider = async (providerId) => {
//     try {
//       await api.put(`/admin/provider/${providerId}/activate`);
//       setReadyProviders((prev) => prev.filter((p) => p._id !== providerId));
//       Alert.alert("Activated", "Provider marked active.");
//     } catch (err) {
//       console.error("❌ Error activating provider:", err);
//       Alert.alert("Error", "Failed to activate this provider.");
//     }
//   };

//   const handleToggleActive = async (providerId, currentValue) => {
//     try {
//       const newValue = !currentValue;
//       await api.put(`/admin/provider/${providerId}/active`, {
//         isActive: newValue,
//       });
//       setProviders((prev) =>
//         prev.map((p) =>
//           p._id === providerId ? { ...p, isActive: newValue } : p
//         )
//       );
//     } catch (err) {
//       console.error("Error updating provider status:", err);
//       Alert.alert("Error", "Failed to update provider status");
//     }
//   };

//   // ✅ correct handler for the global config toggle
//   const handleToggleHardcoded = async () => {
//     try {
//       const newValue = !hardcodedEnabled;
//       setHardcodedEnabled(newValue); // optimistic
//       await api.put("/admin/configuration", { hardcodedEnabled: newValue });
//     } catch (err) {
//       console.error("Error updating configuration:", err?.response?.data || err.message);
//       setHardcodedEnabled((v) => !v); // revert
//       Alert.alert("Error", "Failed to update configuration.");
//     }
//   };

//   const handleSelectProvider = (providerId) => {
//     setSelectedProviderId(providerId);
//     setZipCodesInput("");
//   };

//   const updateZipCodes = async () => {
//     if (!selectedProviderId) return;
//     const zips = zipCodesInput
//       .split(",")
//       .map((z) => z.trim())
//       .filter(Boolean);
//     try {
//       await api.put(`/admin/provider/${selectedProviderId}/zipcodes`, {
//         zipCodes: zips,
//       });
//       Alert.alert("Success", "ZIP codes updated!");
//     } catch (err) {
//       console.error("Error updating ZIP codes:", err);
//       Alert.alert("Error", "Failed to update ZIP codes");
//     }
//   };

//   const filteredProviders = providers.filter((p) => {
//     const q = searchTerm.toLowerCase();
//     return (
//       p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
//     );
//   });

//   const handleZipSearch = async () => {
//     try {
//       const res = await api.get(
//         "/admin/users?role=serviceProvider&fields=_id,billingTier,serviceZipcode,serviceType"
//       );
//       const allProviders = Array.isArray(res.data.providers)
//         ? res.data.providers
//         : [];

//       const normalizedZip = zipSearch.trim();
//       const normalizedServiceType = serviceTypeSearch.trim().toLowerCase();
//       let count = 0;

//       for (const p of allProviders) {
//         const isHybrid = p.billingTier === "hybrid";
//         const matchesService =
//           (p.serviceType || "").toLowerCase() === normalizedServiceType;

//         if (!isHybrid || !matchesService) continue;

//         const z = p.serviceZipcode;
//         let zipMatch = false;

//         if (typeof z === "string" || typeof z === "number") {
//           zipMatch = String(z).trim() === normalizedZip;
//         } else if (Array.isArray(z)) {
//           zipMatch = z.some((item) => String(item).trim() === normalizedZip);
//         }

//         if (zipMatch) count++;
//       }

//       const available = Math.max(0, 7 - count);
//       setZipProCount(`${count} taken / out of 7 = ${available} slots available`);
//     } catch (err) {
//       console.error("Error during ZIP search:", err);
//       setZipProCount("Error fetching data");
//     }
//   };

//   const cancelStaleJobs = async () => {
//     try {
//       const res = await api.put("/admin/jobs/cancel-stale");
//       Alert.alert("Success", res.data?.message || "Pending jobs cancelled.");
//     } catch (err) {
//       console.error("Error cancelling jobs:", err);
//       Alert.alert("Error", "Failed to cancel pending jobs.");
//     }
//   };

//   const fetchJobMedia = async () => {
//     try {
//       setMediaLoading(true);
//       const params = {};
//       if (mediaQuery.jobId.trim()) params.jobId = mediaQuery.jobId.trim();
//       if (mediaQuery.address.trim()) params.address = mediaQuery.address.trim();
//       if (!params.jobId && !params.address) {
//         Alert.alert("Enter Job ID or Address");
//         setMediaLoading(false); // ✅ prevent spinner from sticking
//         return;
//       }

//       const res = await api.get("/admin/job-media", { params });
//       setMediaResults(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
//       if (!res.data?.jobs?.length) {
//         Alert.alert("No Results", "No jobs or images found for your query.");
//       }
//     } catch (err) {
//       console.error("❌ fetchJobMedia error:", err?.response?.data || err.message);
//       Alert.alert("Error", err?.response?.data?.msg || "Failed to fetch media.");
//     } finally {
//       setMediaLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <LogoutButton />
//       <Text style={styles.title}>Admin Dashboard</Text>

//       <View style={styles.cardRow}>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Customers</Text>
//           <Text style={styles.cardValue}>{customerCount}</Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Providers</Text>
//           <Text style={styles.cardValue}>{providerCount}</Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>YTD Fees</Text>
//           <Text style={styles.cardValue}>${feesData.ytdTotal.toFixed(2)}</Text>
//         </View>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Monthly Fees Breakdown</Text>
//         {feesData.monthlyFees.length > 0 ? (
//           feesData.monthlyFees.map((fee, idx) => (
//             <Text key={idx}>
//               Month {fee._id.month}/{fee._id.year}: $
//               {(fee.totalConvenienceFee || 0).toFixed(2)}
//             </Text>
//           ))
//         ) : (
//           <Text>No convenience fees found.</Text>
//         )}
//       </View>

//       <TouchableOpacity style={styles.updateBtn} onPress={cancelStaleJobs}>
//         <Text style={styles.updateBtnText}>Cancel All Stale Jobs</Text>
//       </TouchableOpacity>

//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Global Config</Text>
//         <View style={styles.switchRow}>
//           <Text style={{ marginRight: 8 }}>Hardcoded Providers Enabled:</Text>
//           <Switch value={hardcodedEnabled} onValueChange={handleToggleHardcoded} />
//         </View>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Ready-to-Activate Providers</Text>
//         <TouchableOpacity
//           style={styles.updateBtn}
//           onPress={fetchCompleteProviders}
//         >
//           <Text style={styles.updateBtnText}>Load Ready Providers</Text>
//         </TouchableOpacity>

//         {readyProviders.length > 0 && (
//           <>
//             {readyProviders.map((p) => (
//               <View key={p._id} style={styles.providerRow}>
//                 <Text style={styles.providerLabel}>{p.name}</Text>
//                 <TouchableOpacity
//                   style={[styles.updateBtn, { padding: 6 }]}
//                   onPress={() => activateOneProvider(p._id)}
//                 >
//                   <Text style={{ color: "#fff" }}>Activate</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}
//             <TouchableOpacity
//               style={styles.updateBtn}
//               onPress={activateAllProviders}
//             >
//               <Text style={styles.updateBtnText}>Activate All</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>

//       <Text style={styles.subtitle}>Job Status Overview</Text>
//       <View style={styles.cardRow}>
//         {["completed", "pending", "invited"].map((key) => (
//           <View key={key} style={styles.card}>
//             <Text style={styles.cardTitle}>
//               {key.charAt(0).toUpperCase() + key.slice(1)}
//             </Text>
//             <Text style={styles.cardValue}>{jobCounts[key]}</Text>
//           </View>
//         ))}
//       </View>
//       <View style={styles.cardRow}>
//         {["canceled", "cancelled_by_provider"].map((key) => (
//           <View key={key} style={styles.card}>
//             <Text style={styles.cardTitle}>
//               {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//             </Text>
//             <Text style={styles.cardValue}>{jobCounts[key]}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Service Providers</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Search providers"
//           value={searchTerm}
//           onChangeText={setSearchTerm}
//         />
//         {filteredProviders.map((provider) => (
//           <View key={provider._id} style={styles.providerRow}>
//             <TouchableOpacity
//               style={styles.providerLabel}
//               onPress={() => handleSelectProvider(provider._id)}
//             >
//               <Text>
//                 {provider.name} ({provider.email})
//               </Text>
//               <Text>{provider.billingTier}</Text>
//               <Text>
//                 Service: {provider.serviceType} • Active:{" "}
//                 {provider.isActive ? "Yes" : "No"}
//               </Text>
//             </TouchableOpacity>
//             <Switch
//               value={provider.isActive}
//               onValueChange={() =>
//                 handleToggleActive(provider._id, provider.isActive)
//               }
//             />
//           </View>
//         ))}
//       </View>

//       {selectedProviderId && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>
//             Update ZIP Codes for {selectedProviderId}
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="ZIP Codes (comma separated)"
//             value={zipCodesInput}
//             onChangeText={setZipCodesInput}
//           />
//           <TouchableOpacity style={styles.updateBtn} onPress={updateZipCodes}>
//             <Text style={styles.updateBtnText}>Save ZIP Codes</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Check ZIP Code Capacity</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter ZIP code"
//           value={zipSearch}
//           onChangeText={setZipSearch}
//         />
//         <Text style={styles.label}>Select Service Type</Text>
//         <View style={styles.selectRow}>
//           {SERVICE_TYPES.map((type) => (
//             <TouchableOpacity
//               key={type}
//               style={[
//                 styles.buttonOption,
//                 serviceTypeSearch === type && styles.buttonSelected,
//               ]}
//               onPress={() => setServiceTypeSearch(type)}
//             >
//               <Text
//                 style={[
//                   styles.buttonText,
//                   serviceTypeSearch === type && styles.buttonTextSelected,
//                 ]}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity style={styles.updateBtn} onPress={handleZipSearch}>
//           <Text style={styles.updateBtnText}>
//             Search ZIP Code + Service Type
//           </Text>
//         </TouchableOpacity>
//         {zipProCount !== null && (
//           <Text style={{ marginTop: 10, fontSize: 20 }}>
//             Hybrid pros in {zipSearch} for {serviceTypeSearch}: {zipProCount}
//           </Text>
//         )}
//       </View>

//       {/* ---- Media Search UI ---- */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Job Media Lookup</Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Job ID"
//           value={mediaQuery.jobId}
//           onChangeText={(t) => setMediaQuery((q) => ({ ...q, jobId: t }))}
//         />
//         <Text style={{ textAlign: "center", marginVertical: 4 }}>— or —</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Address (starts with...)"
//           value={mediaQuery.address}
//           onChangeText={(t) => setMediaQuery((q) => ({ ...q, address: t }))}
//         />

//         <TouchableOpacity
//           style={styles.updateBtn}
//           onPress={fetchJobMedia}
//           disabled={mediaLoading}
//         >
//           <Text style={styles.updateBtnText}>
//             {mediaLoading ? "Searching…" : "Search Media"}
//           </Text>
//         </TouchableOpacity>

//         {mediaResults.map((job) => {
//           const imgs = job.images || []; // ✅ safeguard
//           return (
//             <View key={job.jobId} style={{ marginTop: 12 }}>
//               <Text style={{ fontWeight: "600" }}>
//                 {job.address || "(no address)"} — {job.jobId}
//               </Text>
//               {imgs.length === 0 ? (
//                 <Text style={{ color: "#777", marginTop: 6 }}>No images</Text>
//               ) : (
//                 <ScrollView
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   style={{ marginTop: 8 }}
//                 >
//                   {imgs.map((img, idx) => (
//                     <View
//                       key={`${job.jobId}-${img.kind}-${idx}`}
//                       style={{ marginRight: 8, alignItems: "center" }}
//                     >
//                       <Image
//                         source={{ uri: img.src }} // ✅ correct field
//                         style={{
//                           width: 120,
//                           height: 120,
//                           borderRadius: 6,
//                           backgroundColor: "#eaeaea",
//                         }}
//                         resizeMode="cover"
//                       />
//                       <Text style={{ fontSize: 12, marginTop: 4 }}>
//                         {img.kind}
//                       </Text>
//                     </View>
//                   ))}
//                 </ScrollView>
//               )}
//             </View>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", padding: 16, marginVertical: 45 },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginVertical: 8,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
//   cardRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 16,
//     flex: 1,
//     marginRight: 8,
//   },
//   cardTitle: { fontWeight: "bold", marginBottom: 6 },
//   cardValue: { fontSize: 20, fontWeight: "600" },
//   switchRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 8,
//     marginVertical: 8,
//   },
//   providerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   providerLabel: { flex: 1, marginRight: 10 },
//   updateBtn: {
//     marginTop: 8,
//     padding: 12,
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   updateBtnText: { color: "#fff", fontWeight: "600" },
//   buttonOption: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 6,
//     marginRight: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   buttonSelected: {
//     backgroundColor: "#1976d2",
//     borderColor: "#1976d2",
//   },
//   buttonText: {
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "500",
//   },
//   buttonTextSelected: {
//     color: "#fff",
//   },
// });

// //latest
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Switch,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Image,
//   SafeAreaView,
//   ActivityIndicator,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   Users,
//   DollarSign,
//   Settings,
//   UserCheck,
//   Search,
//   MapPin,
//   Image as ImageIcon,
//   BarChart3,
//   Shield,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Eye,
//   Zap,
//   FileText,
// } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import LogoutButton from "../components/LogoutButton";

// const StatCard = ({ icon: Icon, title, value, color }) => (
//   <View style={styles.statCard}>
//     <LinearGradient
//       colors={[`${color}20`, `${color}10`]}
//       style={styles.statGradient}
//     >
//       <Icon color={color} size={24} />
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statTitle}>{title}</Text>
//     </LinearGradient>
//   </View>
// );

// const SectionCard = ({ title, icon: Icon, children }) => (
//   <View style={styles.sectionCard}>
//     <LinearGradient
//       colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//       style={styles.sectionGradient}
//     >
//       <View style={styles.sectionHeader}>
//         <Icon color="#60a5fa" size={20} />
//         <Text style={styles.sectionTitle}>{title}</Text>
//       </View>
//       {children}
//     </LinearGradient>
//   </View>
// );

// const ActionButton = ({ title, onPress, disabled = false, loading = false, variant = 'primary' }) => (
//   <TouchableOpacity
//     style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
//     onPress={onPress}
//     disabled={disabled}
//   >
//     <LinearGradient
//       colors={variant === 'primary' ? ['#22c55e', '#16a34a'] : ['#60a5fa', '#3b82f6']}
//       style={styles.actionButtonGradient}
//     >
//       {loading ? (
//         <ActivityIndicator color="#fff" size="small" />
//       ) : (
//         <Text style={styles.actionButtonText}>{title}</Text>
//       )}
//     </LinearGradient>
//   </TouchableOpacity>
// );

// export default function AdminDashboard() {
//   const navigation = useNavigation();

//   // Keep ALL original state exactly the same
//   const [providerCount, setProviderCount] = useState(0);
//   const [customerCount, setCustomerCount] = useState(0);
//   const [providers, setProviders] = useState([]);
//   const [selectedProviderId, setSelectedProviderId] = useState(null);
//   const [zipCodesInput, setZipCodesInput] = useState("");
//   const [zipSearch, setZipSearch] = useState("");
//   const [zipProCount, setZipProCount] = useState(null);
//   const [serviceTypeSearch, setServiceTypeSearch] = useState("");

//   const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
//   const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [readyProviders, setReadyProviders] = useState([]);

//   const SERVICE_TYPES = [
//     "Electrician",
//     "HVAC",
//     "Plumbing",
//     "Roofing",
//     "Handyman",
//   ];

//   const [jobCounts, setJobCounts] = useState({
//     completed: 0,
//     pending: 0,
//     invited: 0,
//     canceled: 0,
//     cancelled_by_provider: 0,
//   });

//   const [mediaQuery, setMediaQuery] = useState({ jobId: "", address: "" });
//   const [mediaResults, setMediaResults] = useState([]);
//   const [mediaLoading, setMediaLoading] = useState(false);

//   // Keep ALL original useEffect hooks exactly the same
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get("/admin/admin/stats");
//         setCustomerCount(res.data.totalCustomers || 0);
//         setProviderCount(res.data.totalProviders || 0);
//       } catch (err) {
//         console.error("Error fetching stats:", err);
//       }
//     };
//     fetchStats();
//   }, []);

//   useEffect(() => {
//     const fetchFees = async () => {
//       try {
//         const res = await api.get("/admin/convenience-fees");
//         const payload = res.data.data || res.data || {};
//         setFeesData({
//           monthlyFees: Array.isArray(payload.monthlyFees)
//             ? payload.monthlyFees
//             : [],
//           ytdTotal: typeof payload.ytdTotal === "number" ? payload.ytdTotal : 0,
//         });
//       } catch (err) {
//         console.error("Error fetching convenience fees:", err);
//       }
//     };
//     fetchFees();
//     const id = setInterval(fetchFees, 25000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await api.get("/admin/configuration");
//         setHardcodedEnabled(Boolean(res.data.hardcodedEnabled));
//       } catch (err) {
//         console.error("Error fetching configuration:", err);
//       }
//     };
//     fetchConfig();
//   }, []);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");

//         const res = await api.get("/admin/jobs", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];

//         const counts = jobs.reduce(
//           (acc, job) => {
//             let status = (job.status || "").toLowerCase();

//             if (status.startsWith("cancelled-by")) {
//               status = "cancelled_by_provider";
//             } else if (status === "cancelled-auto") {
//               status = "canceled";
//             }

//             if (acc[status] !== undefined) acc[status]++;
//             return acc;
//           },
//           {
//             completed: 0,
//             pending: 0,
//             invited: 0,
//             canceled: 0,
//             cancelled_by_provider: 0,
//           }
//         );

//         setJobCounts(counts);
//       } catch (err) {
//         console.error("❌ Error fetching jobs:", err?.response?.data || err.message);
//       }
//     };

//     fetchJobs();
//     const id = setInterval(fetchJobs, 10000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const res = await api.get(
//           "/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive,billingTier,zipCodes"
//         );
//         const list = Array.isArray(res.data.providers)
//           ? res.data.providers
//           : [];
//         setProviders(list);
//       } catch (err) {
//         console.error("Error fetching providers:", err);
//       }
//     };
//     fetchProviders();
//   }, []);

//   // Keep ALL original functions exactly the same
//   const fetchCompleteProviders = async () => {
//     try {
//       const res = await api.get("/admin/complete-providers");
//       const list = res.data.providers || [];
//       if (list.length === 0) {
//         Alert.alert("None Found", "No ready-to-activate providers.");
//       }
//       setReadyProviders(list);
//     } catch (err) {
//       console.error("❌ Failed to fetch complete providers:", err);
//       Alert.alert("Error", "Could not fetch provider list.");
//     }
//   };

//   const activateAllProviders = async () => {
//     try {
//       const results = [];
//       for (let provider of readyProviders) {
//         const res = await api.put(`/admin/provider/${provider._id}/activate`);
//         results.push(res.data.user);
//       }
//       Alert.alert("Success", `${results.length} providers activated.`);
//       setReadyProviders([]);
//     } catch (err) {
//       console.error("❌ Failed to activate all:", err);
//       Alert.alert("Error", "Failed to activate some users.");
//     }
//   };

//   const activateOneProvider = async (providerId) => {
//     try {
//       await api.put(`/admin/provider/${providerId}/activate`);
//       setReadyProviders((prev) => prev.filter((p) => p._id !== providerId));
//       Alert.alert("Activated", "Provider marked active.");
//     } catch (err) {
//       console.error("❌ Error activating provider:", err);
//       Alert.alert("Error", "Failed to activate this provider.");
//     }
//   };

//   const handleToggleActive = async (providerId, currentValue) => {
//     try {
//       const newValue = !currentValue;
//       await api.put(`/admin/provider/${providerId}/active`, {
//         isActive: newValue,
//       });
//       setProviders((prev) =>
//         prev.map((p) =>
//           p._id === providerId ? { ...p, isActive: newValue } : p
//         )
//       );
//     } catch (err) {
//       console.error("Error updating provider status:", err);
//       Alert.alert("Error", "Failed to update provider status");
//     }
//   };

//   const handleToggleHardcoded = async () => {
//     try {
//       const newValue = !hardcodedEnabled;
//       setHardcodedEnabled(newValue);
//       await api.put("/admin/configuration", { hardcodedEnabled: newValue });
//     } catch (err) {
//       console.error("Error updating configuration:", err?.response?.data || err.message);
//       setHardcodedEnabled((v) => !v);
//       Alert.alert("Error", "Failed to update configuration.");
//     }
//   };

//   const handleSelectProvider = (providerId) => {
//     setSelectedProviderId(providerId);
//     setZipCodesInput("");
//   };

//   const updateZipCodes = async () => {
//     if (!selectedProviderId) return;
//     const zips = zipCodesInput
//       .split(",")
//       .map((z) => z.trim())
//       .filter(Boolean);
//     try {
//       await api.put(`/admin/provider/${selectedProviderId}/zipcodes`, {
//         zipCodes: zips,
//       });
//       Alert.alert("Success", "ZIP codes updated!");
//     } catch (err) {
//       console.error("Error updating ZIP codes:", err);
//       Alert.alert("Error", "Failed to update ZIP codes");
//     }
//   };

//   const filteredProviders = providers.filter((p) => {
//     const q = searchTerm.toLowerCase();
//     return (
//       p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
//     );
//   });

//   const handleZipSearch = async () => {
//     try {
//       const res = await api.get(
//         "/admin/users?role=serviceProvider&fields=_id,billingTier,serviceZipcode,serviceType"
//       );
//       const allProviders = Array.isArray(res.data.providers)
//         ? res.data.providers
//         : [];

//       const normalizedZip = zipSearch.trim();
//       const normalizedServiceType = serviceTypeSearch.trim().toLowerCase();
//       let count = 0;

//       for (const p of allProviders) {
//         const isHybrid = p.billingTier === "hybrid";
//         const matchesService =
//           (p.serviceType || "").toLowerCase() === normalizedServiceType;

//         if (!isHybrid || !matchesService) continue;

//         const z = p.serviceZipcode;
//         let zipMatch = false;

//         if (typeof z === "string" || typeof z === "number") {
//           zipMatch = String(z).trim() === normalizedZip;
//         } else if (Array.isArray(z)) {
//           zipMatch = z.some((item) => String(item).trim() === normalizedZip);
//         }

//         if (zipMatch) count++;
//       }

//       const available = Math.max(0, 7 - count);
//       setZipProCount(`${count} taken / out of 7 = ${available} slots available`);
//     } catch (err) {
//       console.error("Error during ZIP search:", err);
//       setZipProCount("Error fetching data");
//     }
//   };

//   const cancelStaleJobs = async () => {
//     try {
//       const res = await api.put("/admin/jobs/cancel-stale");
//       Alert.alert("Success", res.data?.message || "Pending jobs cancelled.");
//     } catch (err) {
//       console.error("Error cancelling jobs:", err);
//       Alert.alert("Error", "Failed to cancel pending jobs.");
//     }
//   };

//   const fetchJobMedia = async () => {
//     try {
//       setMediaLoading(true);
//       const params = {};
//       if (mediaQuery.jobId.trim()) params.jobId = mediaQuery.jobId.trim();
//       if (mediaQuery.address.trim()) params.address = mediaQuery.address.trim();
//       if (!params.jobId && !params.address) {
//         Alert.alert("Enter Job ID or Address");
//         setMediaLoading(false);
//         return;
//       }

//       const res = await api.get("/admin/job-media", { params });
//       setMediaResults(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
//       if (!res.data?.jobs?.length) {
//         Alert.alert("No Results", "No jobs or images found for your query.");
//       }
//     } catch (err) {
//       console.error("❌ fetchJobMedia error:", err?.response?.data || err.message);
//       Alert.alert("Error", err?.response?.data?.msg || "Failed to fetch media.");
//     } finally {
//       setMediaLoading(false);
//     }
//   };

//   return (
//     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <LogoutButton />
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <Shield color="#22c55e" size={16} />
//                 <Text style={styles.headerBadgeText}>Admin Panel</Text>
//               </View>
//               <Text style={styles.headerTitle}>BlinqFix Dashboard</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Stats Overview */}
//           <View style={styles.statsGrid}>
//             <StatCard
//               icon={Users}
//               title="Total Customers"
//               value={customerCount.toString()}
//               color="#60a5fa"
//             />
//             <StatCard
//               icon={UserCheck}
//               title="Total Providers"
//               value={providerCount.toString()}
//               color="#22c55e"
//             />
//             <StatCard
//               icon={DollarSign}
//               title="YTD Fees"
//               value={`$${feesData.ytdTotal.toFixed(2)}`}
//               color="#f59e0b"
//             />
//           </View>

//           {/* Monthly Fees */}
//           <SectionCard title="Monthly Fees Breakdown" icon={BarChart3}>
//             {feesData.monthlyFees.length > 0 ? (
//               feesData.monthlyFees.map((fee, idx) => (
//                 <View key={idx} style={styles.feeRow}>
//                   <Text style={styles.feeText}>
//                     Month {fee._id.month}/{fee._id.year}:
//                   </Text>
//                   <Text style={styles.feeAmount}>
//                     ${(fee.totalConvenienceFee || 0).toFixed(2)}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.noDataText}>No convenience fees found.</Text>
//             )}
//           </SectionCard>

//           {/* Quick Actions */}
//           <SectionCard title="Quick Actions" icon={Zap}>
//             <ActionButton
//               title="Cancel All Stale Jobs"
//               onPress={cancelStaleJobs}
//             />
//           </SectionCard>

//           {/* Global Config */}
//           <SectionCard title="Global Configuration" icon={Settings}>
//             <View style={styles.configRow}>
//               <Text style={styles.configLabel}>Hardcoded Providers Enabled:</Text>
//               <Switch
//                 value={hardcodedEnabled}
//                 onValueChange={handleToggleHardcoded}
//                 trackColor={{ false: "#767577", true: "#22c55e" }}
//                 thumbColor={hardcodedEnabled ? "#f4f3f4" : "#f4f3f4"}
//               />
//             </View>
//           </SectionCard>

//           {/* Ready Providers */}
//           <SectionCard title="Ready-to-Activate Providers" icon={UserCheck}>
//             <ActionButton
//               title="Load Ready Providers"
//               onPress={fetchCompleteProviders}
//               variant="secondary"
//             />

//             {readyProviders.length > 0 && (
//               <View style={styles.readyProvidersContainer}>
//                 {readyProviders.map((p) => (
//                   <View key={p._id} style={styles.providerActionRow}>
//                     <Text style={styles.providerName}>{p.name}</Text>
//                     <TouchableOpacity
//                       style={styles.activateButton}
//                       onPress={() => activateOneProvider(p._id)}
//                     >
//                       <Text style={styles.activateButtonText}>Activate</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//                 <ActionButton
//                   title="Activate All"
//                   onPress={activateAllProviders}
//                 />
//               </View>
//             )}
//           </SectionCard>

//           {/* Job Status Overview */}
//           <View style={styles.jobStatsHeader}>
//             <Text style={styles.sectionHeaderText}>Job Status Overview</Text>
//           </View>
//           <View style={styles.jobStatsGrid}>
//             <StatCard
//               icon={CheckCircle}
//               title="Completed"
//               value={jobCounts.completed.toString()}
//               color="#22c55e"
//             />
//             <StatCard
//               icon={Clock}
//               title="Pending"
//               value={jobCounts.pending.toString()}
//               color="#f59e0b"
//             />
//             <StatCard
//               icon={Eye}
//               title="Invited"
//               value={jobCounts.invited.toString()}
//               color="#60a5fa"
//             />
//           </View>
//           <View style={styles.jobStatsGrid}>
//             <StatCard
//               icon={XCircle}
//               title="Canceled"
//               value={jobCounts.canceled.toString()}
//               color="#ef4444"
//             />
//             <StatCard
//               icon={XCircle}
//               title="Cancelled By Provider"
//               value={jobCounts.cancelled_by_provider.toString()}
//               color="#dc2626"
//             />
//           </View>

//           {/* Service Providers Management */}
//           <SectionCard title="Service Providers" icon={Users}>
//             <View style={styles.searchContainer}>
//               <Search color="#94a3b8" size={20} style={styles.searchIcon} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search providers..."
//                 placeholderTextColor="#94a3b8"
//                 value={searchTerm}
//                 onChangeText={setSearchTerm}
//               />
//             </View>

//             {filteredProviders.map((provider) => (
//               <TouchableOpacity
//                 key={provider._id}
//                 style={styles.providerCard}
//                 onPress={() => handleSelectProvider(provider._id)}
//               >
//                 <LinearGradient
//                   colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
//                   style={styles.providerGradient}
//                 >
//                   <View style={styles.providerInfo}>
//                     <Text style={styles.providerNameLarge}>{provider.name}</Text>
//                     <Text style={styles.providerEmail}>({provider.email})</Text>
//                     <Text style={styles.providerDetails}>
//                       {provider.billingTier} • {provider.serviceType}
//                     </Text>
//                   </View>
//                   <View style={styles.providerControls}>
//                     <Text style={[styles.statusText, provider.isActive ? styles.activeText : styles.inactiveText]}>
//                       {provider.isActive ? 'Active' : 'Inactive'}
//                     </Text>
//                     <Switch
//                       value={provider.isActive}
//                       onValueChange={() => handleToggleActive(provider._id, provider.isActive)}
//                       trackColor={{ false: "#767577", true: "#22c55e" }}
//                       thumbColor={provider.isActive ? "#f4f3f4" : "#f4f3f4"}
//                     />
//                   </View>
//                 </LinearGradient>
//               </TouchableOpacity>
//             ))}
//           </SectionCard>

//           {/* ZIP Code Management */}
//           {selectedProviderId && (
//             <SectionCard title={`Update ZIP Codes for ${selectedProviderId}`} icon={MapPin}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="ZIP Codes (comma separated)"
//                 placeholderTextColor="#94a3b8"
//                 value={zipCodesInput}
//                 onChangeText={setZipCodesInput}
//               />
//               <ActionButton
//                 title="Save ZIP Codes"
//                 onPress={updateZipCodes}
//               />
//             </SectionCard>
//           )}

//           {/* ZIP Code Capacity Check */}
//           <SectionCard title="Check ZIP Code Capacity" icon={Search}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter ZIP code"
//               placeholderTextColor="#94a3b8"
//               value={zipSearch}
//               onChangeText={setZipSearch}
//             />

//             <Text style={styles.inputLabel}>Select Service Type</Text>
//             <View style={styles.serviceTypeGrid}>
//               {SERVICE_TYPES.map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[
//                     styles.serviceTypeButton,
//                     serviceTypeSearch === type && styles.serviceTypeButtonSelected,
//                   ]}
//                   onPress={() => setServiceTypeSearch(type)}
//                 >
//                   <Text
//                     style={[
//                       styles.serviceTypeButtonText,
//                       serviceTypeSearch === type && styles.serviceTypeButtonTextSelected,
//                     ]}
//                   >
//                     {type}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <ActionButton
//               title="Search ZIP Code + Service Type"
//               onPress={handleZipSearch}
//               variant="secondary"
//             />

//             {zipProCount !== null && (
//               <View style={styles.zipResultContainer}>
//                 <Text style={styles.zipResultText}>
//                   Hybrid pros in {zipSearch} for {serviceTypeSearch}:
//                 </Text>
//                 <Text style={styles.zipResultValue}>{zipProCount}</Text>
//               </View>
//             )}
//           </SectionCard>

//           {/* Media Lookup */}
//           <SectionCard title="Job Media Lookup" icon={ImageIcon}>
//             <TextInput
//               style={styles.input}
//               placeholder="Job ID"
//               placeholderTextColor="#94a3b8"
//               value={mediaQuery.jobId}
//               onChangeText={(t) => setMediaQuery((q) => ({ ...q, jobId: t }))}
//             />
//             <Text style={styles.orText}>— or —</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Address (starts with...)"
//               placeholderTextColor="#94a3b8"
//               value={mediaQuery.address}
//               onChangeText={(t) => setMediaQuery((q) => ({ ...q, address: t }))}
//             />

//             <ActionButton
//               title="Search Media"
//               onPress={fetchJobMedia}
//               disabled={mediaLoading}
//               loading={mediaLoading}
//               variant="secondary"
//             />

//             {mediaResults.map((job) => {
//               const imgs = job.images || [];
//               return (
//                 <View key={job.jobId} style={styles.mediaResultCard}>
//                   <Text style={styles.mediaJobTitle}>
//                     {job.address || "(no address)"} — {job.jobId}
//                   </Text>
//                   {imgs.length === 0 ? (
//                     <Text style={styles.noImagesText}>No images</Text>
//                   ) : (
//                     <ScrollView
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       style={styles.mediaScrollView}
//                     >
//                       {imgs.map((img, idx) => (
//                         <View
//                           key={`${job.jobId}-${img.kind}-${idx}`}
//                           style={styles.mediaImageContainer}
//                         >
//                           <Image
//                             source={{ uri: img.src }}
//                             style={styles.mediaImage}
//                             resizeMode="cover"
//                           />
//                           <Text style={styles.mediaImageLabel}>{img.kind}</Text>
//                         </View>
//                       ))}
//                     </ScrollView>
//                   )}
//                 </View>
//               );
//             })}
//           </SectionCard>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//     marginTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   headerCenter: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   headerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(34, 197, 94, 0.15)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(34, 197, 94, 0.3)',
//   },
//   headerBadgeText: {
//     color: '#22c55e',
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     gap: 12,
//   },
//   statCard: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   statGradient: {
//     padding: 16,
//     alignItems: 'center',
//     gap: 8,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   statTitle: {
//     fontSize: 12,
//     color: '#e0e7ff',
//     textAlign: 'center',
//   },
//   sectionCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   sectionGradient: {
//     padding: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12,
//   },
//   feeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   feeText: {
//     color: '#e0e7ff',
//     fontSize: 14,
//   },
//   feeAmount: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   noDataText: {
//     color: '#94a3b8',
//     fontStyle: 'italic',
//   },
//   configRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   configLabel: {
//     color: '#e0e7ff',
//     fontSize: 16,
//   },
//   actionButton: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginTop: 8,
//   },
//   actionButtonDisabled: {
//     opacity: 0.6,
//   },
//   actionButtonGradient: {
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   readyProvidersContainer: {
//     marginTop: 16,
//     gap: 8,
//   },
//   providerActionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   providerName: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   activateButton: {
//     backgroundColor: '#22c55e',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   activateButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   sectionHeaderText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   jobStatsHeader: {
//     marginBottom: 16,
//   },
//   jobStatsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     gap: 8,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     marginBottom: 16,
//   },
//   searchIcon: {
//     paddingHorizontal: 16,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: '#fff',
//   },
//   providerCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   providerGradient: {
//     padding: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   providerInfo: {
//     flex: 1,
//   },
//   providerNameLarge: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   providerEmail: {
//     color: '#94a3b8',
//     fontSize: 14,
//     marginTop: 2,
//   },
//   providerDetails: {
//     color: '#e0e7ff',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   providerControls: {
//     alignItems: 'center',
//     gap: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   activeText: {
//     color: '#22c55e',
//   },
//   inactiveText: {
//     color: '#f87171',
//   },
//   input: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     fontSize: 16,
//     color: '#fff',
//   },
//   inputLabel: {
//     color: '#e0e7ff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   serviceTypeGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 16,
//   },
//   serviceTypeButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   serviceTypeButtonSelected: {
//     backgroundColor: '#60a5fa',
//     borderColor: '#60a5fa',
//   },
//   serviceTypeButtonText: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     fontWeight: '500',
//   },
//   serviceTypeButtonTextSelected: {
//     color: '#fff',
//   },
//   zipResultContainer: {
//     marginTop: 16,
//     backgroundColor: 'rgba(96, 165, 250, 0.1)',
//     padding: 16,
//     borderRadius: 12,
//   },
//   zipResultText: {
//     color: '#e0e7ff',
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   zipResultValue: {
//     color: '#60a5fa',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   orText: {
//     textAlign: 'center',
//     color: '#94a3b8',
//     marginVertical: 8,
//     fontStyle: 'italic',
//   },
//   mediaResultCard: {
//     marginTop: 16,
//     backgroundColor: 'rgba(255,255,255,0.03)',
//     padding: 16,
//     borderRadius: 12,
//   },
//   mediaJobTitle: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   noImagesText: {
//     color: '#94a3b8',
//     fontStyle: 'italic',
//   },
//   mediaScrollView: {
//     marginTop: 8,
//   },
//   mediaImageContainer: {
//     marginRight: 12,
//     alignItems: 'center',
//   },
//   mediaImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: '#374151',
//   },
//   mediaImageLabel: {
//     fontSize: 12,
//     color: '#e0e7ff',
//     marginTop: 6,
//     textAlign: 'center',
//   },
// });



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  DollarSign,
  Settings,
  UserCheck,
  Search,
  MapPin,
  Image as ImageIcon,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  FileText,
  Mail,
  Download,
  ExternalLink,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import LogoutButton from "../components/LogoutButton";

const StatCard = ({ icon: Icon, title, value, color }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={[`${color}20`, `${color}10`]}
      style={styles.statGradient}
    >
      <Icon color={color} size={24} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <View style={styles.sectionCard}>
    <LinearGradient
      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Icon color="#60a5fa" size={20} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const ActionButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  leftIcon: LeftIcon,
}) => (
  <TouchableOpacity
    style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <LinearGradient
      colors={
        variant === "primary" ? ["#22c55e", "#16a34a"] : ["#60a5fa", "#3b82f6"]
      }
      style={styles.actionButtonGradient}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {LeftIcon ? <LeftIcon color="#fff" size={18} /> : null}
          <Text style={styles.actionButtonText}>{title}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const navigation = useNavigation();

  // ---- Original state ----
  const [providerCount, setProviderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [zipCodesInput, setZipCodesInput] = useState("");
  const [zipSearch, setZipSearch] = useState("");
  const [zipProCount, setZipProCount] = useState(null);
  const [serviceTypeSearch, setServiceTypeSearch] = useState("");

  const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
  const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [readyProviders, setReadyProviders] = useState([]);

  const SERVICE_TYPES = [
    "Electrician",
    "HVAC",
    "Plumbing",
    "Roofing",
    "Handyman",
  ];

  const [jobCounts, setJobCounts] = useState({
    completed: 0,
    pending: 0,
    invited: 0,
    canceled: 0,
    cancelled_by_provider: 0,
  });

  const [mediaQuery, setMediaQuery] = useState({ jobId: "", address: "" });
  const [mediaResults, setMediaResults] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // ---- NEW: provider documents state ----
  const [docsVisible, setDocsVisible] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsProvider, setDocsProvider] = useState(null); // provider object
  const [docs, setDocs] = useState([]); // [{type, filename, url, uploadedAt}]

  // ---- Effects (unchanged) ----
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/admin/stats");
        setCustomerCount(res.data.totalCustomers || 0);
        setProviderCount(res.data.totalProviders || 0);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get("/admin/convenience-fees");
        const payload = res.data.data || res.data || {};
        setFeesData({
          monthlyFees: Array.isArray(payload.monthlyFees)
            ? payload.monthlyFees
            : [],
          ytdTotal: typeof payload.ytdTotal === "number" ? payload.ytdTotal : 0,
        });
      } catch (err) {
        console.error("Error fetching convenience fees:", err);
      }
    };
    fetchFees();
    const id = setInterval(fetchFees, 25000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/admin/configuration");
        setHardcodedEnabled(Boolean(res.data.hardcodedEnabled));
      } catch (err) {
        console.error("Error fetching configuration:", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
        const counts = jobs.reduce(
          (acc, job) => {
            let status = (job.status || "").toLowerCase();
            if (status.startsWith("cancelled-by")) {
              status = "cancelled_by_provider";
            } else if (status === "cancelled-auto") {
              status = "canceled";
            }
            if (acc[status] !== undefined) acc[status]++;
            return acc;
          },
          {
            completed: 0,
            pending: 0,
            invited: 0,
            canceled: 0,
            cancelled_by_provider: 0,
          }
        );
        setJobCounts(counts);
      } catch (err) {
        console.error(
          "❌ Error fetching jobs:",
          err?.response?.data || err.message
        );
      }
    };
    fetchJobs();
    const id = setInterval(fetchJobs, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get(
          "/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive,billingTier,zipCodes"
        );
        const list = Array.isArray(res.data.providers)
          ? res.data.providers
          : [];
        setProviders(list);
      } catch (err) {
        console.error("Error fetching providers:", err);
      }
    };
    fetchProviders();
  }, []);

  // ---- Original helpers (unchanged) ----
  const fetchCompleteProviders = async () => {
    try {
      const res = await api.get("/admin/complete-providers");
      const list = res.data.providers || [];
      if (list.length === 0) {
        Alert.alert("None Found", "No ready-to-activate providers.");
      }
      setReadyProviders(list);
    } catch (err) {
      console.error("❌ Failed to fetch complete providers:", err);
      Alert.alert("Error", "Could not fetch provider list.");
    }
  };

  const activateAllProviders = async () => {
    try {
      const results = [];
      for (let provider of readyProviders) {
        const res = await api.put(`/admin/provider/${provider._id}/activate`);
        results.push(res.data.user);
      }
      Alert.alert("Success", `${results.length} providers activated.`);
      setReadyProviders([]);
    } catch (err) {
      console.error("❌ Failed to activate all:", err);
      Alert.alert("Error", "Failed to activate some users.");
    }
  };

  const activateOneProvider = async (providerId) => {
    try {
      await api.put(`/admin/provider/${providerId}/activate`);
      setReadyProviders((prev) => prev.filter((p) => p._id !== providerId));
      Alert.alert("Activated", "Provider marked active.");
    } catch (err) {
      console.error("❌ Error activating provider:", err);
      Alert.alert("Error", "Failed to activate this provider.");
    }
  };

  const handleToggleActive = async (providerId, currentValue) => {
    try {
      const newValue = !currentValue;
      await api.put(`/admin/provider/${providerId}/active`, {
        isActive: newValue,
      });
      setProviders((prev) =>
        prev.map((p) =>
          p._id === providerId ? { ...p, isActive: newValue } : p
        )
      );
    } catch (err) {
      console.error("Error updating provider status:", err);
      Alert.alert("Error", "Failed to update provider status");
    }
  };

  const handleToggleHardcoded = async () => {
    try {
      const newValue = !hardcodedEnabled;
      setHardcodedEnabled(newValue);
      await api.put("/admin/configuration", { hardcodedEnabled: newValue });
    } catch (err) {
      console.error(
        "Error updating configuration:",
        err?.response?.data || err.message
      );
      setHardcodedEnabled((v) => !v);
      Alert.alert("Error", "Failed to update configuration.");
    }
  };

  const handleSelectProvider = (providerId) => {
    setSelectedProviderId(providerId);
    setZipCodesInput("");
  };

  const updateZipCodes = async () => {
    if (!selectedProviderId) return;
    const zips = zipCodesInput
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);
    try {
      await api.put(`/admin/provider/${selectedProviderId}/zipcodes`, {
        zipCodes: zips,
      });
      Alert.alert("Success", "ZIP codes updated!");
    } catch (err) {
      console.error("Error updating ZIP codes:", err);
      Alert.alert("Error", "Failed to update ZIP codes");
    }
  };

  const filteredProviders = providers.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  });

  const handleZipSearch = async () => {
    try {
      const res = await api.get(
        "/admin/users?role=serviceProvider&fields=_id,billingTier,serviceZipcode,serviceType"
      );
      const allProviders = Array.isArray(res.data.providers)
        ? res.data.providers
        : [];

      const normalizedZip = zipSearch.trim();
      const normalizedServiceType = serviceTypeSearch.trim().toLowerCase();
      let count = 0;

      for (const p of allProviders) {
        const isHybrid = p.billingTier === "hybrid";
        const matchesService =
          (p.serviceType || "").toLowerCase() === normalizedServiceType;
        if (!isHybrid || !matchesService) continue;
        const z = p.serviceZipcode;
        let zipMatch = false;
        if (typeof z === "string" || typeof z === "number") {
          zipMatch = String(z).trim() === normalizedZip;
        } else if (Array.isArray(z)) {
          zipMatch = z.some((item) => String(item).trim() === normalizedZip);
        }
        if (zipMatch) count++;
      }

      const available = Math.max(0, 7 - count);
      setZipProCount(
        `${count} taken / out of 7 = ${available} slots available`
      );
    } catch (err) {
      console.error("Error during ZIP search:", err);
      setZipProCount("Error fetching data");
    }
  };

  const cancelStaleJobs = async () => {
    try {
      const res = await api.put("/admin/jobs/cancel-stale");
      Alert.alert("Success", res.data?.message || "Pending jobs cancelled.");
    } catch (err) {
      console.error("Error cancelling jobs:", err);
      Alert.alert("Error", "Failed to cancel pending jobs.");
    }
  };

  const fetchJobMedia = async () => {
    try {
      setMediaLoading(true);
      const params = {};
      if (mediaQuery.jobId.trim()) params.jobId = mediaQuery.jobId.trim();
      if (mediaQuery.address.trim()) params.address = mediaQuery.address.trim();
      if (!params.jobId && !params.address) {
        Alert.alert("Enter Job ID or Address");
        setMediaLoading(false);
        return;
      }
      const res = await api.get("/admin/job-media", { params });
      setMediaResults(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
      if (!res.data?.jobs?.length) {
        Alert.alert("No Results", "No jobs or images found for your query.");
      }
    } catch (err) {
      console.error(
        "❌ fetchJobMedia error:",
        err?.response?.data || err.message
      );
      Alert.alert(
        "Error",
        err?.response?.data?.msg || "Failed to fetch media."
      );
    } finally {
      setMediaLoading(false);
    }
  };

  // ---- NEW: Provider documents helpers ----
  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Cannot open", url);
    } catch (e) {
      Alert.alert("Open failed", "Could not open the file link.");
    }
  };

  const loadProviderDocs = async (provider) => {
    setDocsProvider(provider);
    setDocsVisible(true);
    setDocs([]);
    setDocsLoading(true);
    try {
      // Expected response shape:
      // { ok: true, documents: [{ type: 'id'|'w9'|'license'|'insurance'|'background'|'ica', filename, url, uploadedAt }] }
      const { data } = await api.get(
        `/admin/provider/${provider._id}/documents`
      );
      const list = Array.isArray(data?.documents) ? data.documents : [];
      // Normalize labels
      const prettyType = (t) => {
        switch ((t || "").toLowerCase()) {
          case "id":
            return "Government ID";
          case "w9":
            return "W‑9";
          case "license":
          case "business_license":
            return "Business License";
          case "insurance":
            return "Insurance";
          case "background":
          case "background_check":
            return "Background Check";
          case "ica":
          case "independent_contractor_agreement":
            return "Independent Contractor Agreement";
          default:
            return t || "Document";
        }
      };
      setDocs(
        list.map((d, i) => ({
          key: `${d.type || "doc"}-${i}`,
          type: prettyType(d.type),
          filename: d.filename || "file",
          url: d.url,
          uploadedAt: d.uploadedAt || null,
        }))
      );
    } catch (err) {
      console.error(
        "loadProviderDocs error",
        err?.response?.data || err.message
      );
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Failed to load documents."
      );
    } finally {
      setDocsLoading(false);
    }
  };

  const emailAllDocs = async () => {
    if (!docsProvider) return;
    try {
      Alert.alert("Sending…", "Preparing email with all documents.");
      // Back-end will bundle links or attachments and email to admin/user as defined server‑side
      const { data } = await api.post(
        `/admin/provider/${docsProvider._id}/documents/email`
      );
      if (data?.ok) Alert.alert("Sent", data?.message || "Documents emailed.");
      else Alert.alert("Error", data?.error || "Email failed.");
    } catch (err) {
      console.error("emailAllDocs error", err?.response?.data || err.message);
      Alert.alert("Error", err?.response?.data?.error || "Email failed.");
    }
  };


  // const emailOneDoc = async (key = "w9", mode = "link") => {
  //   if (!docsProvider) {
  //     Alert.alert("Pick a provider", "Please select a provider first.");
  //     return;
  //   }
  //   try {
  //     Alert.alert("Sending…", `Sending a ${mode === "attachment" ? "single attachment" : "single link"} for: ${key}`);
  //     const { data } = await api.post(
  //       `/admin/provider/${docsProvider._id}/documents/email-one`,
  //       { key, mode }  // mode: "link" or "attachment"
  //     );
  //     if (data?.ok) {
  //       Alert.alert(
  //         "Sent",
  //         `${data.message}\nRID: ${data.rid || "-"}`
  //       );
  //     } else {
  //       console.error("[email-one] server error", data);
  //       Alert.alert("Error", `${data?.error || "Email failed."}\nRID: ${data?.rid || "-"}`);
  //     }
  //   } catch (err) {
  //     const payload = err?.response?.data;
  //     console.error("[email-one] error", payload || err.message);
  //     Alert.alert(
  //       "Error",
  //       [
  //         payload?.error || "Email failed.",
  //         payload?.rid ? `RID: ${payload.rid}` : "",
  //         payload?.meta?.code ? `Code: ${payload.meta.code}` : "",
  //         payload?.meta?.responseCode ? `ResponseCode: ${payload.meta.responseCode}` : "",
  //         payload?.meta?.command ? `Cmd: ${payload.meta.command}` : "",
  //       ].filter(Boolean).join("\n")
  //     );
  //   }
  // };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <LogoutButton />
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <Shield color="#22c55e" size={16} />
                <Text style={styles.headerBadgeText}>Admin Panel</Text>
              </View>
              <Text style={styles.headerTitle}>BlinqFix Dashboard</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <StatCard
              icon={Users}
              title="Total Customers"
              value={customerCount.toString()}
              color="#60a5fa"
            />
            <StatCard
              icon={UserCheck}
              title="Total Providers"
              value={providerCount.toString()}
              color="#22c55e"
            />
            <StatCard
              icon={DollarSign}
              title="YTD Fees"
              value={`$${feesData.ytdTotal.toFixed(2)}`}
              color="#f59e0b"
            />
          </View>

          {/* Monthly Fees */}
          <SectionCard title="Monthly Fees Breakdown" icon={BarChart3}>
            {feesData.monthlyFees.length > 0 ? (
              feesData.monthlyFees.map((fee, idx) => (
                <View key={idx} style={styles.feeRow}>
                  <Text style={styles.feeText}>
                    Month {fee._id.month}/{fee._id.year}:
                  </Text>
                  <Text style={styles.feeAmount}>
                    ${(fee.totalConvenienceFee || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No convenience fees found.</Text>
            )}
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon={Zap}>
            <ActionButton
              title="Cancel All Stale Jobs"
              onPress={cancelStaleJobs}
            />
          </SectionCard>

          {/* Global Config */}
          <SectionCard title="Global Configuration" icon={Settings}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>
                Hardcoded Providers Enabled:
              </Text>
              <Switch
                value={hardcodedEnabled}
                onValueChange={handleToggleHardcoded}
                trackColor={{ false: "#767577", true: "#22c55e" }}
                thumbColor={hardcodedEnabled ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </SectionCard>

          {/* Ready Providers */}
          <SectionCard title="Ready-to-Activate Providers" icon={UserCheck}>
            <ActionButton
              title="Load Ready Providers"
              onPress={fetchCompleteProviders}
              variant="secondary"
            />
            {readyProviders.length > 0 && (
              <View style={styles.readyProvidersContainer}>
                {readyProviders.map((p) => (
                  <View key={p._id} style={styles.providerActionRow}>
                    <Text style={styles.providerName}>{p.name}</Text>
                    <TouchableOpacity
                      style={styles.activateButton}
                      onPress={() => activateOneProvider(p._id)}
                    >
                      <Text style={styles.activateButtonText}>Activate</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <ActionButton
                  title="Activate All"
                  onPress={activateAllProviders}
                />
              </View>
            )}
          </SectionCard>

          {/* Job Status Overview */}
          <View style={styles.jobStatsHeader}>
            <Text style={styles.sectionHeaderText}>Job Status Overview</Text>
          </View>
          <View style={styles.jobStatsGrid}>
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={jobCounts.completed.toString()}
              color="#22c55e"
            />
            <StatCard
              icon={Clock}
              title="Pending"
              value={jobCounts.pending.toString()}
              color="#f59e0b"
            />
            <StatCard
              icon={Eye}
              title="Invited"
              value={jobCounts.invited.toString()}
              color="#60a5fa"
            />
          </View>
          <View style={styles.jobStatsGrid}>
            <StatCard
              icon={XCircle}
              title="Canceled"
              value={jobCounts.canceled.toString()}
              color="#ef4444"
            />
            <StatCard
              icon={XCircle}
              title="Cancelled By Provider"
              value={jobCounts.cancelled_by_provider.toString()}
              color="#dc2626"
            />
          </View>

          {/* Service Providers Management */}
          <SectionCard title="Service Providers" icon={Users}>
            <View style={styles.searchContainer}>
              <Search color="#94a3b8" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search providers..."
                placeholderTextColor="#94a3b8"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {filteredProviders.map((provider) => (
              <View key={provider._id} style={styles.providerCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]}
                  style={styles.providerGradient}
                >
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerNameLarge}>
                      {provider.name}
                    </Text>
                    <Text style={styles.providerEmail}>({provider.email})</Text>
                    <Text style={styles.providerDetails}>
                      {provider.billingTier} • {provider.serviceType}
                    </Text>
                  </View>

                  <View style={styles.providerControls}>
                    <Text
                      style={[
                        styles.statusText,
                        provider.isActive
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {provider.isActive ? "Active" : "Inactive"}
                    </Text>
                    <Switch
                      value={provider.isActive}
                      onValueChange={() =>
                        handleToggleActive(provider._id, provider.isActive)
                      }
                      trackColor={{ false: "#767577", true: "#22c55e" }}
                      thumbColor={provider.isActive ? "#f4f3f4" : "#f4f3f4"}
                    />

                    {/* NEW: Docs button */}
                    <TouchableOpacity
                      style={styles.docsButton}
                      onPress={() => loadProviderDocs(provider)}
                    >
                      <FileText color="#93c5fd" size={18} />
                      <Text style={styles.docsButtonText}>Docs</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </SectionCard>

          {/* ZIP Code Management */}
          {selectedProviderId && (
            <SectionCard
              title={`Update ZIP Codes for ${selectedProviderId}`}
              icon={MapPin}
            >
              <TextInput
                style={styles.input}
                placeholder="ZIP Codes (comma separated)"
                placeholderTextColor="#94a3b8"
                value={zipCodesInput}
                onChangeText={setZipCodesInput}
              />
              <ActionButton title="Save ZIP Codes" onPress={updateZipCodes} />
            </SectionCard>
          )}

          {/* ZIP Code Capacity Check */}
          <SectionCard title="Check ZIP Code Capacity" icon={Search}>
            <TextInput
              style={styles.input}
              placeholder="Enter ZIP code"
              placeholderTextColor="#94a3b8"
              value={zipSearch}
              onChangeText={setZipSearch}
            />
            <Text style={styles.inputLabel}>Select Service Type</Text>
            <View style={styles.serviceTypeGrid}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.serviceTypeButton,
                    serviceTypeSearch === type &&
                      styles.serviceTypeButtonSelected,
                  ]}
                  onPress={() => setServiceTypeSearch(type)}
                >
                  <Text
                    style={[
                      styles.serviceTypeButtonText,
                      serviceTypeSearch === type &&
                        styles.serviceTypeButtonTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <ActionButton
              title="Search ZIP Code + Service Type"
              onPress={handleZipSearch}
              variant="secondary"
            />
            {zipProCount !== null && (
              <View style={styles.zipResultContainer}>
                <Text style={styles.zipResultText}>
                  Hybrid pros in {zipSearch} for {serviceTypeSearch}:
                </Text>
                <Text style={styles.zipResultValue}>{zipProCount}</Text>
              </View>
            )}
          </SectionCard>

          {/* Media Lookup */}
          <SectionCard title="Job Media Lookup" icon={ImageIcon}>
            <TextInput
              style={styles.input}
              placeholder="Job ID"
              placeholderTextColor="#94a3b8"
              value={mediaQuery.jobId}
              onChangeText={(t) => setMediaQuery((q) => ({ ...q, jobId: t }))}
            />
            <Text style={styles.orText}>— or —</Text>
            <TextInput
              style={styles.input}
              placeholder="Address (starts with...)"
              placeholderTextColor="#94a3b8"
              value={mediaQuery.address}
              onChangeText={(t) => setMediaQuery((q) => ({ ...q, address: t }))}
            />
            <ActionButton
              title="Search Media"
              onPress={fetchJobMedia}
              disabled={mediaLoading}
              loading={mediaLoading}
              variant="secondary"
            />
            {mediaResults.map((job) => {
              const imgs = job.images || [];
              return (
                <View key={job.jobId} style={styles.mediaResultCard}>
                  <Text style={styles.mediaJobTitle}>
                    {job.address || "(no address)"} — {job.jobId}
                  </Text>
                  {imgs.length === 0 ? (
                    <Text style={styles.noImagesText}>No images</Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.mediaScrollView}
                    >
                      {imgs.map((img, idx) => (
                        <View
                          key={`${job.jobId}-${img.kind}-${idx}`}
                          style={styles.mediaImageContainer}
                        >
                          <Image
                            source={{ uri: img.src }}
                            style={styles.mediaImage}
                            resizeMode="cover"
                          />
                          <Text style={styles.mediaImageLabel}>{img.kind}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              );
            })}
          </SectionCard>
        </ScrollView>

        {/* NEW: Documents Modal */}
        <Modal
          visible={docsVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setDocsVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <FileText color="#93c5fd" size={18} />
                  <Text style={styles.modalTitle}>
                    {docsProvider
                      ? `${docsProvider.name}'s Documents`
                      : "Documents"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDocsVisible(false)}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>

              {docsLoading ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : docs.length === 0 ? (
                <Text style={styles.noDataText}>No documents uploaded.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 360 }}>
                  {docs.map((d) => (
                    <View key={d.key} style={styles.docRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docTitle}>{d.type}</Text>
                        <Text style={styles.docMeta} numberOfLines={1}>
                          {d.filename}
                        </Text>
                        {d.uploadedAt ? (
                          <Text style={styles.docMetaSmall}>
                            Uploaded: {new Date(d.uploadedAt).toLocaleString()}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.docActions}>
                        <TouchableOpacity
                          style={styles.docActionBtn}
                          onPress={() => openUrl(d.url)}
                        >
                          <ExternalLink color="#fff" size={16} />
                          <Text style={styles.docActionText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.docActionBtn}
                          onPress={() => openUrl(d.url)}
                        >
                          <Download color="#fff" size={16} />
                          <Text style={styles.docActionText}>Download</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <ActionButton
                title="Email All Documents"
                onPress={emailAllDocs}
                variant="secondary"
                leftIcon={Mail}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  headerBadgeText: {
    color: "#22c55e",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: { flex: 1, borderRadius: 16, overflow: "hidden" },
  statGradient: { padding: 16, alignItems: "center", gap: 8 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  statTitle: { fontSize: 12, color: "#e0e7ff", textAlign: "center" },
  sectionCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  sectionGradient: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  feeText: { color: "#e0e7ff", fontSize: 14 },
  feeAmount: { color: "#fff", fontSize: 14, fontWeight: "600" },
  noDataText: { color: "#94a3b8", fontStyle: "italic" },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  configLabel: { color: "#e0e7ff", fontSize: 16 },
  actionButton: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  readyProvidersContainer: { marginTop: 16, gap: 8 },
  providerActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  providerName: { color: "#fff", fontSize: 16 },
  activateButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activateButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  jobStatsHeader: { marginBottom: 16 },
  jobStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  searchIcon: { paddingHorizontal: 16 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#fff" },
  providerCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  providerGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  providerInfo: { flex: 1 },
  providerNameLarge: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  providerEmail: { color: "#94a3b8", fontSize: 14, marginTop: 2 },
  providerDetails: { color: "#e0e7ff", fontSize: 14, marginTop: 4 },
  providerControls: { alignItems: "center", gap: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  activeText: { color: "#22c55e" },
  inactiveText: { color: "#f87171" },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: "#fff",
  },
  inputLabel: {
    color: "#e0e7ff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  serviceTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  serviceTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  serviceTypeButtonSelected: {
    backgroundColor: "#60a5fa",
    borderColor: "#60a5fa",
  },
  serviceTypeButtonText: { fontSize: 14, color: "#e0e7ff", fontWeight: "500" },
  serviceTypeButtonTextSelected: { color: "#fff" },
  zipResultContainer: {
    marginTop: 16,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    padding: 16,
    borderRadius: 12,
  },
  zipResultText: { color: "#e0e7ff", fontSize: 16, marginBottom: 8 },
  zipResultValue: { color: "#60a5fa", fontSize: 18, fontWeight: "bold" },
  orText: {
    textAlign: "center",
    color: "#94a3b8",
    marginVertical: 8,
    fontStyle: "italic",
  },
  mediaResultCard: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
  },
  mediaJobTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noImagesText: { color: "#94a3b8", fontStyle: "italic" },
  mediaScrollView: { marginTop: 8 },
  mediaImageContainer: { marginRight: 12, alignItems: "center" },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  mediaImageLabel: {
    fontSize: 12,
    color: "#e0e7ff",
    marginTop: 6,
    textAlign: "center",
  },
  // --- Docs modal ---
  docsButton: { marginTop: 8, alignItems: "center" },
  docsButtonText: { color: "#93c5fd", fontSize: 12, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: { backgroundColor: "#111827", borderRadius: 16, padding: 16 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalClose: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#374151",
  },
  docTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  docMeta: { color: "#9ca3af", fontSize: 13, marginTop: 2, maxWidth: 220 },
  docMetaSmall: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  docActions: { flexDirection: "row", gap: 8 },
  docActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  docActionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
