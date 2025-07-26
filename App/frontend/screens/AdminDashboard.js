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
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import LogoutButton from "../components/LogoutButton";

export default function AdminDashboard() {
  const navigation = useNavigation();

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

  const [jobCounts, setJobCounts] = useState({
    completed: 0,
    pending: 0,
    invited: 0,
    canceled: 0,
    cancelled_by_provider: 0,
  });

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

  // useEffect(() => {
  //   const fetchJobs = async () => {
  //     try {
  //       const res = await api.get("/admin/jobs");
  //       const jobs = Array.isArray(res.data) ? res.data : res.data.jobs || [];
  //       const counts = jobs.reduce(
  //         (acc, job) => {
  //           const s = (job.status || "").toLowerCase();
  //           if (acc[s] !== undefined) acc[s]++;
  //           return acc;
  //         },
  //         {
  //           completed: 0,
  //           pending: 0,
  //           invited: 0,
  //           canceled: 0,
  //           cancelled_by_provider: 0,
  //         }
  //       );
  //       setJobCounts(counts);
  //     } catch (err) {
  //       console.error("Error fetching jobs:", err);
  //     }
  //   };
  //   fetchJobs();
  //   const id = setInterval(fetchJobs, 10000);
  //   return () => clearInterval(id);
  // }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
  
        if (!jobs.length) {
          console.warn("ℹ️ No jobs found.");
          setJobCounts({
            completed: 0,
            pending: 0,
            invited: 0,
            canceled: 0,
            cancelled_by_provider: 0,
          });
          return;
        }
  
        const counts = jobs.reduce(
          (acc, job) => {
            const status = (job.status || "").toLowerCase();
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
        console.error("❌ Error fetching jobs:", err?.response?.data || err.message);
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

        // console.log("p>>>>", JSON.stringify(p));
        if (!isHybrid || !matchesService) continue;

        const z = p.serviceZipcode;
        let zipMatch = false;

        if (typeof z === "string" || typeof z === "number") {
          zipMatch = String(z).trim() === normalizedZip;
        } else if (Array.isArray(z)) {
          zipMatch = z.some((item) => String(item).trim() === normalizedZip);
        }

        if (zipMatch) {
          count++;
          // console.log(`✅ Match: ${p.name} | ZIP: ${normalizedZip}`);
        } else {
          // console.log(`❌ No Match for ZIP: ${normalizedZip} in`, z);
        }
      }

      const available = Math.max(0, 7 - count);
      // console.log("ZIP:", normalizedZip);
      // console.log("Service Type:", normalizedServiceType);
      // console.log("Hybrid Providers Found:", count);
      // console.log("Available Slots:", available);

      setZipProCount(`${count} / 7 — ${available} slots available`);
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

      <TouchableOpacity style={styles.updateBtn} onPress={cancelStaleJobs}>
        <Text style={styles.updateBtnText}>Cancel All Stale Jobs</Text>
      </TouchableOpacity>

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
              <Text>{provider.billingTier}</Text>
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
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check ZIP Code Capacity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter ZIP code"
          value={zipSearch}
          onChangeText={setZipSearch}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Service Type"
          value={serviceTypeSearch}
          onChangeText={setServiceTypeSearch}
        />
        <TouchableOpacity style={styles.updateBtn} onPress={handleZipSearch}>
          <Text style={styles.updateBtnText}>
            Search ZIP Code + Service Type
          </Text>
        </TouchableOpacity>
        {zipProCount !== null && (
          <Text style={{ marginTop: 10 }}>
            Hybrid pros in {zipSearch} for {serviceTypeSearch}: {zipProCount}
          </Text>
        )}
      </View>
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
