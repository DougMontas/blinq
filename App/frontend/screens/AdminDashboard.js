//previous
// screens/AdminDashboard.js
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
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import LogoutButton from "../components/LogoutButton";

// export default function AdminDashboard() {
//   const navigation = useNavigation();

//   const [users, setUsers] = useState([]);
//   const [providers, setProviders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [selectedProviderId, setSelectedProviderId] = useState(null);
//   const [zipCodesInput, setZipCodesInput] = useState("");

//   const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
//   const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [jobCounts, setJobCounts] = useState({
//     completed: 0,
//     pending: 0,
//     invited: 0,
//     canceled: 0,
//     cancelled_by_provider: 0,
//   });

//   // 1) fetch all users
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await api.get("/admin/users");
//         // console.log("⚙️  /admin/users response:", res.data);
//         const list = Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data.users)
//           ? res.data.users
//           : [];
//         setUsers(list);
//         setProviders(list.filter((u) => u.role === "serviceProvider"));
//         setCustomers(list.filter((u) => u.role === "customer"));
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       }
//     };
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await api.get("/admin/users");
//         const list = Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data.users)
//           ? res.data.users
//           : [];
//         console.log("🧾 Admin users received:", list.map(u => ({ id: u._id, role: u.role })));
//         setUsers(list);
//         setProviders(list.filter((u) => u.role === "serviceProvider"));
//         setCustomers(list.filter((u) => u.role === "customer"));
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // 2) fetch convenience fees
//   useEffect(() => {
//     const fetchFees = async () => {
//       try {
//         const res = await api.get("/admin/convenience-fees");
//         // console.log("⚙️  /admin/convenience-fees response:", res.data);
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

//   // 3) fetch config
//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await api.get("/admin/configuration");
//         // console.log("⚙️  /admin/configuration response:", res.data);
//         setHardcodedEnabled(Boolean(res.data.hardcodedEnabled));
//       } catch (err) {
//         console.error("Error fetching configuration:", err);
//       }
//     };
//     fetchConfig();
//   }, []);

//   // 4) fetch job statuses, now handles 500 by zeroing out
//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/admin/jobs");
//         // console.log("⚙️  /admin/jobs response:", res.data);
//         const jobs = Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data.jobs)
//           ? res.data.jobs
//           : [];
//         const counts = jobs.reduce(
//           (acc, job) => {
//             const s = (job.status || "").toLowerCase();
//             if (acc[s] !== undefined) acc[s]++;
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
//         // if server threw a 500, just reset counts
//         if (err.response?.status === 500) {
//           console.error("Server error fetching jobs:", err);
//           setJobCounts({
//             completed: 0,
//             pending: 0,
//             invited: 0,
//             canceled: 0,
//             cancelled_by_provider: 0,
//           });
//         } else {
//           console.error("Error fetching jobs:", err);
//         }
//       }
//     };
//     fetchJobs();
//     const id = setInterval(fetchJobs, 10000);
//     return () => clearInterval(id);
//   }, []);

//   // toggle provider active
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

//   // select provider to update zip codes
//   const handleSelectProvider = (providerId) => {
//     setSelectedProviderId(providerId);
//     setZipCodesInput("");
//   };

//   // update provider’s zip codes
//   const updateZipCodes = async () => {
//     if (!selectedProviderId) return;
//     const zips = zipCodesInput
//       .split(",")
//       .map((z) => z.trim())
//       .filter(Boolean);
//     try {
//       // note plural "providers" & payload key "zipCodes"
//       await api.put(`/admin/provider/${selectedProviderId}/zipcodes`, {
//         zipCodes: zips,
//       });
//       Alert.alert("Success", "ZIP codes updated!");
//     } catch (err) {
//       console.error("Error updating ZIP codes:", err);
//       Alert.alert("Error", "Failed to update ZIP codes");
//     }
//   };

//   // handle config toggle
//   const handleConfigToggle = async (newValue) => {
//     setHardcodedEnabled(newValue);
//     try {
//       await api.put("/admin/configuration", { hardcodedEnabled: newValue });
//     } catch (err) {
//       console.error("Error updating configuration:", err);
//       Alert.alert("Error", "Failed to update configuration");
//     }
//   };

//   const filteredProviders = providers.filter((p) => {
//     const q = searchTerm.toLowerCase();
//     return (
//       p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
//     );
//   });

//   return (
//     <ScrollView style={styles.container}>
//       <LogoutButton />

//       <Text style={styles.title}>Admin Dashboard</Text>

//       {/* Overview Cards */}
//       <View style={styles.cardRow}>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Customers</Text>
//           <Text style={styles.cardValue}>{customers.length}</Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Providers</Text>
//           <Text style={styles.cardValue}>{providers.length}</Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>YTD Fees</Text>
//           <Text style={styles.cardValue}>${feesData.ytdTotal.toFixed(2)}</Text>
//         </View>
//       </View>

//       {/* Monthly breakdown */}
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

//       {/* Global Config */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Global Config</Text>
//         <View style={styles.switchRow}>
//           <Text style={{ marginRight: 8 }}>Hardcoded Providers Enabled:</Text>
//           <Switch value={hardcodedEnabled} onValueChange={handleConfigToggle} />
//         </View>
//       </View>

//       {/* Job Status Cards */}
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

//       {/* Service Providers w/ search */}
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

//       {/* ZIP code update for selected provider */}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", padding: 16, marginVertical: 22 },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginVertical: 8,
//     textAlign: "center",
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../api/client";
import LogoutButton from "../components/LogoutButton";

export default function AdminDashboard() {
  const navigation = useNavigation();

  const [providerCount, setProviderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [zipCodesInput, setZipCodesInput] = useState("");

  const [feesData, setFeesData] = useState({ monthlyFees: [], ytdTotal: 0 });
  const [hardcodedEnabled, setHardcodedEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [jobCounts, setJobCounts] = useState({
    completed: 0,
    pending: 0,
    invited: 0,
    canceled: 0,
    cancelled_by_provider: 0,
  });

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await api.get("/admin/users");
  //       const users = Array.isArray(res.data)
  //         ? res.data
  //         : Array.isArray(res.data.users)
  //         ? res.data.users
  //         : [];
  
  //       const customers = users.filter((user) => user.role === "customer");
  //       const providers = users.filter((user) => user.role === "serviceProvider");
  
  //       setCustomerCount(customers.length);
  //       setProviderCount(providers.length);
  //       setProviders(providers);
  //     } catch (err) {
  //       console.error("Error fetching users:", err);
  //     }
  //   };
  //   fetchUsers();
  // }, []);
  

  // useEffect(() => {
  //   const fetchCounts = async () => {
  //     try {
  //       const { data } = await api.get("/admin/users/counts");
  //       setProviderCount(data.providers || 0);
  //       setCustomerCount(data.customers || 0);
  //     } catch (err) {
  //       console.error("Error fetching user counts:", err);
  //     }
  //   };
  //   fetchCounts();
  // }, []);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await api.get("/admin/users");
  //       const list = Array.isArray(res.data)
  //         ? res.data
  //         : Array.isArray(res.data.users)
  //         ? res.data.users
  //         : [];
  //       setProviders(list.filter((u) => u.role === "serviceProvider"));
  //     } catch (err) {
  //       console.error("Error fetching users:", err);
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  // useEffect(() => {
  //   const fetchProviders = async () => {
  //     try {
  //       const res = await api.get("/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive");
  //       const list = Array.isArray(res.data)
  //         ? res.data
  //         : Array.isArray(res.data.users)
  //         ? res.data.users
  //         : [];
  //       setProviders(list);
  //     } catch (err) {
  //       console.error("Error fetching providers:", err);
  //     }
  //   };
  //   fetchProviders();
  // }, []);

  // useEffect(() => {
  //   const fetchUserStats = async () => {
  //     try {
  //       const res = await api.get("/admin/stats");
  //       setCustomers(Array(res.data.totalCustomers).fill({}));  // Just for count
  //       setProviders(Array(res.data.totalProviders).fill({}));
  //     } catch (err) {
  //       console.error("Error fetching user stats:", err);
  //     }
  //   };
  //   fetchUserStats();
  // }, []);

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
        const res = await api.get("/admin/jobs");
        const jobs = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.jobs)
          ? res.data.jobs
          : [];
        const counts = jobs.reduce(
          (acc, job) => {
            const s = (job.status || "").toLowerCase();
            if (acc[s] !== undefined) acc[s]++;
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
        if (err.response?.status === 500) {
          console.error("Server error fetching jobs:", err);
          setJobCounts({
            completed: 0,
            pending: 0,
            invited: 0,
            canceled: 0,
            cancelled_by_provider: 0,
          });
        } else {
          console.error("Error fetching jobs:", err);
        }
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
        "/admin/users?role=serviceProvider&fields=_id,name,email,role,serviceType,isActive,billingTier"
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

//   const handleConfigToggle = async (newValue) => {
//     setHardcodedEnabled(newValue);
//     try {
//       await api.put("/admin/configuration", { hardcodedEnabled: newValue });
//     } catch (err) {
//       console.error("Error updating configuration:", err);
//       Alert.alert("Error", "Failed to update configuration");
//     }
//   };

//   const filteredProviders = providers.filter((p) =>
//   p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   p.email.toLowerCase().includes(searchTerm.toLowerCase())
// );
  // const filteredProviders = providers.filter((p) => {
  //   const q = searchTerm.toLowerCase();
  //   return (
  //     p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  //   );
  // });

  return (
    <ScrollView style={styles.container}>
      <LogoutButton />
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Customers</Text>
          <Text style={styles.cardValue}>{customerCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Providers</Text>
          <Text style={styles.cardValue}>{providerCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YTD Fees</Text>
          <Text style={styles.cardValue}>${feesData.ytdTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Fees Breakdown</Text>
        {feesData.monthlyFees.length > 0 ? (
          feesData.monthlyFees.map((fee, idx) => (
            <Text key={idx}>
              Month {fee._id.month}/{fee._id.year}: $
              {(fee.totalConvenienceFee || 0).toFixed(2)}
            </Text>
          ))
        ) : (
          <Text>No convenience fees found.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Global Config</Text>
        <View style={styles.switchRow}>
          <Text style={{ marginRight: 8 }}>Hardcoded Providers Enabled:</Text>
          <Switch value={hardcodedEnabled} onValueChange={handleToggleActive} />
        </View>
      </View>

      <Text style={styles.subtitle}>Job Status Overview</Text>
      <View style={styles.cardRow}>
        {["completed", "pending", "invited"].map((key) => (
          <View key={key} style={styles.card}>
            <Text style={styles.cardTitle}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Text style={styles.cardValue}>{jobCounts[key]}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cardRow}>
        {["canceled", "cancelled_by_provider"].map((key) => (
          <View key={key} style={styles.card}>
            <Text style={styles.cardTitle}>
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text style={styles.cardValue}>{jobCounts[key]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Providers</Text>
        <TextInput
          style={styles.input}
          placeholder="Search providers"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {filteredProviders.map((provider) => (
          <View key={provider._id} style={styles.providerRow}>
            <TouchableOpacity
              style={styles.providerLabel}
              onPress={() => handleSelectProvider(provider._id)}
            >
              <Text>
                {provider.name} ({provider.email}) 
              </Text>
              <Text>
                {provider.billingTier}
              </Text>
              <Text>
                Service: {provider.serviceType} • Active:{" "}
                {provider.isActive ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
            <Switch
              value={provider.isActive}
              onValueChange={() =>
                handleToggleActive(provider._id, provider.isActive)
              }
            />
          </View>
        ))}
      </View>

      {selectedProviderId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Update ZIP Codes for {selectedProviderId}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ZIP Codes (comma separated)"
            value={zipCodesInput}
            onChangeText={setZipCodesInput}
          />
          <TouchableOpacity style={styles.updateBtn} onPress={updateZipCodes}>
            <Text style={styles.updateBtnText}>Save ZIP Codes</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, marginVertical: 45 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
  },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    flex: 1,
    marginRight: 8,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  cardValue: { fontSize: 20, fontWeight: "600" },
  switchRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  providerLabel: { flex: 1, marginRight: 10 },
  updateBtn: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#1976d2",
    borderRadius: 6,
    alignItems: "center",
  },
  updateBtnText: { color: "#fff", fontWeight: "600" },
});
