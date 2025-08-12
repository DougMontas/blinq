// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job, onAccept, isTeaser = false }) {
//   const [showPhone, setShowPhone] = useState(false);
//   const [elapsedReady, setElapsedReady] = useState(false);

//   useEffect(() => {
//     if (!job?.acceptedAt) return;

//     const acceptedTime = new Date(job.acceptedAt).getTime();
//     const delay = Math.max(0, 0.2 * 60 * 1000 - (Date.now() - acceptedTime));

//     const timeout = setTimeout(() => {
//       setElapsedReady(true);
//       // console.log('phone button fired')
//     }, delay);

//     return () => clearTimeout(timeout);
//   }, [job?.acceptedAt]);

//   if (!job) {
//     return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
//   }

//   const {
//     customer,
//     serviceType,
//     status,
//     paymentStatus,
//     address,
//     serviceCity,
//     serviceZipcode,
//     phoneNumber,
//     baseAmount = 0,
//     adjustmentAmount = 0,
//     rushFee = 0,
//     additionalCharge = 0,
//     details = {},
//   } = job;

//   const subtotal =
//     baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
//   const convenienceFee = Number((subtotal * 0.07).toFixed(2));
//   const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

//   let entries = [];
//   try {
//     if (typeof details === "string") {
//       entries = Object.entries(JSON.parse(details));
//     } else if (typeof details === "object" && details !== null) {
//       entries = Object.entries(details);
//     }
//   } catch {
//     entries = [];
//   }

//   return (
//     <View style={styles.container}>
//       {/* <Text style={styles.bold}>Emergency Job Awarded. Customer has been notified you are in route shortly.</Text> */}
//       <Text></Text>
//       <Text style={styles.header}>Job Details</Text>
//       <Text>
//         <Text style={styles.bold}>Customer Name:</Text> {customer?.name}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Type:</Text> {serviceType}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Status:</Text> {status}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}
//       </Text>

//       <Text>
//         <Text style={styles.bold}>Service Address:</Text>{" "}
//         {isTeaser
//           ? "Gold members get priority. Check back in 15 mins **"
//           : address}
//       </Text>

//       <Text>
//         <Text style={styles.bold}>Service City:</Text> {serviceCity}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
//       </Text>

//       {elapsedReady && !showPhone && (
//         <Button
//           title="Reveal Customer Phone"
//           onPress={() => setShowPhone(true)}
//         />
//       )}
//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text
//           style={{
//             fontWeight: "700",
//             marginTop: 4,
//             fontSize: 22,
//             textAlign: "center",
//             textShadowColor: "rgba(0,0,0,0.5)",
//             textShadowOffset: { width: 1, height: 2 },
//             textShadowRadius: 2,
//           }}
//         >
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>
//       {entries.length > 0 && (
//         <View style={styles.qaContainer}>
//           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
//           {entries.map(([k, v], i) => (
//             <View key={k} style={styles.qaItem}>
//               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
//               <Text style={styles.a}>
//                 {Array.isArray(v) ? v.join(", ") : String(v)}
//               </Text>
//               {i < entries.length - 1 && <View style={styles.divider} />}
//             </View>
//           ))}
//         </View>
//       )}
//       {status === "invited" && onAccept && (
//         <Button title="Accept" onPress={onAccept} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   MapPin,
//   User,
//   Wrench,
//   CheckCircle,
//   DollarSign,
//   Phone,
//   MessageSquare,
//   FileText,
//   Clock,
//   Star,
// } from "lucide-react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// const InfoRow = ({ icon: Icon, label, value, isHighlight = false }) => (
//   <View style={[styles.infoRow, isHighlight && styles.highlightRow]}>
//     <Icon color={isHighlight ? "#22c55e" : "#60a5fa"} size={18} />
//     <Text style={[styles.infoLabel, isHighlight && styles.highlightLabel]}>{label}:</Text>
//     <Text style={[styles.infoValue, isHighlight && styles.highlightValue]}>{value}</Text>
//   </View>
// );

// const PriceRow = ({ label, value, isTotal = false }) => (
//   <View style={[styles.priceRow, isTotal && styles.totalRow]}>
//     <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>{label}:</Text>
//     <Text style={[styles.priceValue, isTotal && styles.totalValue]}>${value}</Text>
//   </View>
// );

// export default function JobDetails({ job, onAccept, isTeaser = false }) {
//   const [showPhone, setShowPhone] = useState(false);
//   const [elapsedReady, setElapsedReady] = useState(false);

//   // Keep all original backend logic exactly the same
//   useEffect(() => {
//     if (!job?.acceptedAt) return;

//     const acceptedTime = new Date(job.acceptedAt).getTime();
//     const delay = Math.max(0, 0.2 * 60 * 1000 - (Date.now() - acceptedTime));

//     const timeout = setTimeout(() => {
//       setElapsedReady(true);
//       // console.log('phone button fired')
//     }, delay);

//     return () => clearTimeout(timeout);
//   }, [job?.acceptedAt]);

//   if (!job) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LinearGradient
//           colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//           style={styles.loadingGradient}
//         >
//           <ActivityIndicator size="large" color="#60a5fa" />
//           <Text style={styles.loadingText}>Loading job details...</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   const {
//     customer,
//     serviceType,
//     status,
//     paymentStatus,
//     address,
//     serviceCity,
//     serviceZipcode,
//     phoneNumber,
//     baseAmount = 0,
//     adjustmentAmount = 0,
//     rushFee = 0,
//     additionalCharge = 0,
//     details = {},
//   } = job;

//   // Keep all original calculation logic exactly the same
//   const subtotal =
//     baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
//   const convenienceFee = Number((subtotal * 0.07).toFixed(2));
//   const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

//   let entries = [];
//   try {
//     if (typeof details === "string") {
//       entries = Object.entries(JSON.parse(details));
//     } else if (typeof details === "object" && details !== null) {
//       entries = Object.entries(details);
//     }
//   } catch {
//     entries = [];
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'invited': return '#facc15';
//       case 'accepted': return '#60a5fa';
//       case 'completed': return '#22c55e';
//       default: return '#94a3b8';
//     }
//   };

//   const getPaymentStatusColor = (paymentStatus) => {
//     switch (paymentStatus) {
//       case 'paid': return '#22c55e';
//       case 'pending': return '#facc15';
//       default: return '#94a3b8';
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header Card */}
//       <View style={styles.headerCard}>
//         <LinearGradient
//           colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
//           style={styles.headerGradient}
//         >
//           <View style={styles.headerContent}>
//             <Wrench color="#22c55e" size={28} />
//             <Text style={styles.headerTitle}>Emergency Job Details</Text>
//           </View>
//           <Text style={styles.headerSubtitle}>Review all information carefully bring all the necessary parts and tools needed. Better to be over prepared.</Text>
//         </LinearGradient>
//       </View>

//       {/* Customer & Service Info */}
//       <View style={styles.infoCard}>
//         <LinearGradient
//           colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//           style={styles.infoGradient}
//         >
//           <View style={styles.sectionHeader}>
//             <User color="#60a5fa" size={20} />
//             <Text style={styles.sectionTitle}>Customer & Service Information</Text>
//           </View>

//           <InfoRow icon={User} label="Customer Name" value={customer?.name || 'N/A'} />
//           <InfoRow icon={Wrench} label="Service Type" value={serviceType} isHighlight />
//           <InfoRow
//             icon={CheckCircle}
//             label="Status"
//             value={status}
//           />
//           <InfoRow
//             icon={DollarSign}
//             label="Payment Status"
//             value={paymentStatus || "Pending"}
//           />
//         </LinearGradient>
//       </View>

//       {/* Location Info */}
//       <View style={styles.infoCard}>
//         <LinearGradient
//           colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//           style={styles.infoGradient}
//         >
//           <View style={styles.sectionHeader}>
//             <MapPin color="#60a5fa" size={20} />
//             <Text style={styles.sectionTitle}>Service Location</Text>
//           </View>

//           <InfoRow
//             icon={MapPin}
//             label="Address"
//             value={isTeaser
//               ? "Gold members get priority. Check back in 15 mins **"
//               : address
//             }
//           />
//           <InfoRow icon={MapPin} label="City" value={serviceCity} />
//           <InfoRow icon={MapPin} label="Zipcode" value={serviceZipcode} />
//         </LinearGradient>
//       </View>

//       {/* Phone Number Section */}
//       {elapsedReady && !showPhone && (
//         <View style={styles.phoneCard}>
//           <LinearGradient
//             colors={['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.05)']}
//             style={styles.phoneGradient}
//           >
//             <TouchableOpacity
//               style={styles.phoneButton}
//               onPress={() => setShowPhone(true)}
//             >
//               <LinearGradient
//                 colors={['#3b82f6', '#2563eb']}
//                 style={styles.phoneButtonGradient}
//               >
//                 <Phone color="#fff" size={20} />
//                 <Text style={styles.phoneButtonText}>Reveal Customer Phone</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>
//       )}

//       {showPhone && phoneNumber && (
//         <View style={styles.phoneRevealCard}>
//           <LinearGradient
//             colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
//             style={styles.phoneRevealGradient}
//           >
//             <InfoRow icon={Phone} label="Customer Phone" value={phoneNumber} isHighlight />
//           </LinearGradient>
//         </View>
//       )}

//       {/* Pricing Breakdown */}
//       <View style={styles.pricingCard}>
//         <LinearGradient
//           colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
//           style={styles.pricingGradient}
//         >
//           <View style={styles.sectionHeader}>
//             <DollarSign color="#22c55e" size={20} />
//             <Text style={styles.sectionTitle}>Pricing Breakdown (USD)</Text>
//           </View>

//           <PriceRow label="Base Amount" value={baseAmount.toFixed(2)} />
//           <PriceRow label="Rush Fee" value={rushFee.toFixed(2)} />
//           {adjustmentAmount > 0 && (
//             <PriceRow label="Adjustments" value={adjustmentAmount.toFixed(2)} />
//           )}
//           <PriceRow label="Additional Charge" value={Number(additionalCharge).toFixed(2)} />
//           <PriceRow label="Convenience Fee (7%)" value={convenienceFee.toFixed(2)} />

//           <View style={styles.divider} />
//           <PriceRow label="Estimated Total" value={estimatedTotal.toFixed(2)} isTotal />
//         </LinearGradient>
//       </View>

//       {/* Emergency Form Responses */}
//       {entries.length > 0 && (
//         <View style={styles.responsesCard}>
//           <LinearGradient
//             colors={['rgba(168, 85, 247, 0.15)', 'rgba(147, 51, 234, 0.05)']}
//             style={styles.responsesGradient}
//           >
//             <View style={styles.sectionHeader}>
//               <MessageSquare color="#a855f7" size={20} />
//               <Text style={styles.sectionTitle}>Emergency Form Responses</Text>
//             </View>

//             {entries.map(([k, v], i) => (
//               <View key={k} style={styles.qaItem}>
//                 <View style={styles.questionRow}>
//                   <FileText color="#94a3b8" size={16} />
//                   <Text style={styles.question}>{QUESTIONS[k] || k}</Text>
//                 </View>
//                 <Text style={styles.answer}>
//                   {Array.isArray(v) ? v.join(", ") : String(v)}
//                 </Text>
//                 {i < entries.length - 1 && <View style={styles.responseDivider} />}
//               </View>
//             ))}
//           </LinearGradient>
//         </View>
//       )}

//       {/* Accept Button */}
//       {status === "invited" && onAccept && (
//         <View style={styles.acceptCard}>
//           <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
//             <LinearGradient
//               colors={['#22c55e', '#16a34a']}
//               style={styles.acceptButtonGradient}
//             >
//               <CheckCircle color="#fff" size={20} />
//               <Text style={styles.acceptButtonText}>Accept Emergency Job</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'transparent',
//   },
//   loadingContainer: {
//     marginTop: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   loadingGradient: {
//     padding: 32,
//     alignItems: 'center'
//   },
//   loadingText: {
//     color: '#e0e7ff',
//     fontSize: 16,
//     marginTop: 12
//   },
//   headerCard: {
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   headerGradient: {
//     padding: 20
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     textAlign: "center",
//   },
//   infoCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   infoGradient: {
//     padding: 16
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//     marginLeft: 8
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     paddingVertical: 4
//   },
//   highlightRow: {
//     backgroundColor: 'rgba(34, 197, 94, 0.1)',
//     borderRadius: 8,
//     paddingHorizontal: 8
//   },
//   infoLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#e0e7ff',
//     marginLeft: 8,
//     minWidth: 80
//   },
//   highlightLabel: {
//     color: '#fff'
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#fff',
//     flex: 1
//   },
//   highlightValue: {
//     fontWeight: '600'
//   },
//   phoneCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   phoneGradient: {
//     padding: 16
//   },
//   phoneButton: {
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   phoneButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     gap: 8
//   },
//   phoneButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   phoneRevealCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   phoneRevealGradient: {
//     padding: 16
//   },
//   pricingCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   pricingGradient: {
//     padding: 16
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 4
//   },
//   totalRow: {
//     paddingVertical: 8
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#e0e7ff'
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff'
//   },
//   priceValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff'
//   },
//   totalValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#22c55e'
//   },
//   divider: {
//     height: 1,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     marginVertical: 8
//   },
//   responsesCard: {
//     marginBottom: 12,
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   responsesGradient: {
//     padding: 16
//   },
//   qaItem: {
//     marginBottom: 12
//   },
//   questionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6
//   },
//   question: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//     marginLeft: 8,
//     flex: 1
//   },
//   answer: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     marginLeft: 24,
//     lineHeight: 20
//   },
//   responseDivider: {
//     height: 1,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     marginTop: 8
//   },
//   acceptCard: {
//     marginTop: 8
//   },
//   acceptButton: {
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   acceptButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     gap: 8
//   },
//   acceptButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold'
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  User,
  Wrench,
  CheckCircle,
  DollarSign,
  Phone,
  MessageSquare,
  FileText,
  Clock,
} from "lucide-react-native";
import QUESTIONS from "../utils/serviceMatrix";

const REVEAL_AFTER_MS = 6 * 60 * 1000; // 6 minutes
const AUTO_REVEAL_AFTER_DELAY = true;

const InfoRow = ({ icon: Icon, label, value, isHighlight = false }) => (
  <View style={[styles.infoRow, isHighlight && styles.highlightRow]}>
    <Icon color={isHighlight ? "#22c55e" : "#60a5fa"} size={18} />
    <Text style={[styles.infoLabel, isHighlight && styles.highlightLabel]}>
      {label}:
    </Text>
    <Text style={[styles.infoValue, isHighlight && styles.highlightValue]}>
      {value}
    </Text>
  </View>
);

const PriceRow = ({ label, value, isTotal = false, isNegative = false }) => (
  <View style={[styles.priceRow, isTotal && styles.totalRow]}>
    <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>
      {label}:
    </Text>
    <Text
      style={[
        styles.priceValue,
        isTotal && styles.totalValue,
        isNegative && { color: "#f87171" },
      ]}
    >
      {isNegative ? "-" : ""}${value}
    </Text>
  </View>
);

export default function JobDetails({ job, onAccept, isTeaser = false }) {
  const [showPhone, setShowPhone] = useState(false);
  const [elapsedReady, setElapsedReady] = useState(false);

  const customerPhone =
    job?.customer?.phoneNumber ||
    job?.customer?.phone ||
    job?.phoneNumber ||
    job?.customerPhone ||
    job?.contactPhone ||
    "";

  useEffect(() => {
    const acceptedBase =
      job?.acceptedAt || job?.accepted_at || job?.updatedAt || null;

    if (!acceptedBase) {
      setElapsedReady(false);
      if (AUTO_REVEAL_AFTER_DELAY) setShowPhone(false);
      return;
    }

    const acceptedTime = new Date(acceptedBase).getTime();
    const elapsed = Date.now() - acceptedTime;
    const remaining = Math.max(0, REVEAL_AFTER_MS - elapsed);

    if (remaining === 0) {
      setElapsedReady(true);
      if (AUTO_REVEAL_AFTER_DELAY) setShowPhone(true);
      return;
    }

    setElapsedReady(false);
    if (AUTO_REVEAL_AFTER_DELAY) setShowPhone(false);

    const timeout = setTimeout(() => {
      setElapsedReady(true);
      if (AUTO_REVEAL_AFTER_DELAY) setShowPhone(true);
    }, remaining);

    return () => clearTimeout(timeout);
  }, [job?.acceptedAt, job?.accepted_at, job?.updatedAt]);

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </LinearGradient>
      </View>
    );
  }

  const {
    customer,
    serviceType,
    status,
    paymentStatus,
    address,
    serviceCity,
    serviceZipcode,
    baseAmount = 0,
    adjustmentAmount = 0,
    rushFee = 0,
    additionalCharge = 0,
    details = {},
  } = job;

  // Customer-facing total (unchanged)
  const subtotal =
    Number(baseAmount) +
    Number(adjustmentAmount) +
    Number(rushFee) +
    Number(additionalCharge);
  const convenienceFee = Number((subtotal * 0.07).toFixed(2));
  const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

  // Provider earnings (new): 7% service-pro fee and net payout
  const providerGross = Number(subtotal.toFixed(2)); // before platform fee
  const providerFee = Number((providerGross * 0.07).toFixed(2)); // 7% charge to service pro
  const providerNet = Number((providerGross - providerFee).toFixed(2)); // take-home

  // Normalize details
  let entries = [];
  try {
    if (typeof details === "string") {
      entries = Object.entries(JSON.parse(details));
    } else if (typeof details === "object" && details !== null) {
      entries = Object.entries(details);
    }
  } catch {
    entries = [];
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <LinearGradient
          colors={["rgba(34, 197, 94, 0.15)", "rgba(16, 185, 129, 0.05)"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Wrench color="#22c55e" size={28} />
            <Text style={styles.headerTitle}>Emergency Job Details</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Review all information carefully and bring the parts and tools you
            might need.
          </Text>
        </LinearGradient>
      </View>

      {/* Customer & Service Info */}
      <View style={styles.infoCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
          style={styles.infoGradient}
        >
          <View style={styles.sectionHeader}>
            <User color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>
              Customer & Service Information
            </Text>
          </View>
          <InfoRow
            icon={User}
            label="Customer Name"
            value={customer?.name || "N/A"}
          />
          <InfoRow
            icon={Wrench}
            label="Service Type"
            value={serviceType}
            isHighlight
          />
          <InfoRow icon={CheckCircle} label="Status" value={status} />
          <InfoRow
            icon={DollarSign}
            label="Payment Status"
            value={paymentStatus || "Pending"}
          />
        </LinearGradient>
      </View>

      {/* Location Info */}
      <View style={styles.infoCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
          style={styles.infoGradient}
        >
          <View style={styles.sectionHeader}>
            <MapPin color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>Service Location</Text>
          </View>
          <InfoRow
            icon={MapPin}
            label="Address"
            value={
              isTeaser
                ? "Gold members get priority. Check back in 15 mins **"
                : address
            }
          />
          <InfoRow icon={MapPin} label="City" value={serviceCity} />
          <InfoRow icon={MapPin} label="Zipcode" value={serviceZipcode} />
        </LinearGradient>
      </View>

      {/* Phone Number Section */}
      {!showPhone && (
        <View style={styles.phoneCard}>
          <LinearGradient
            colors={["rgba(59, 130, 246, 0.15)", "rgba(37, 99, 235, 0.05)"]}
            style={styles.phoneGradient}
          >
            {elapsedReady && !AUTO_REVEAL_AFTER_DELAY ? (
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => setShowPhone(true)}
              >
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={styles.phoneButtonGradient}
                >
                  <Phone color="#fff" size={20} />
                  <Text style={styles.phoneButtonText}>
                    Reveal Customer Phone
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Clock color="#60a5fa" size={18} />
                <Text style={{ color: "#e0e7ff", marginTop: 8 }}>
                  Customer phone will be available after acceptance window.
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      )}

      {showPhone && customerPhone ? (
        <View style={styles.phoneRevealCard}>
          <LinearGradient
            colors={["rgba(34, 197, 94, 0.15)", "rgba(16, 185, 129, 0.05)"]}
            style={styles.phoneRevealGradient}
          >
            <InfoRow
              icon={Phone}
              label="Customer Phone"
              value={customerPhone}
              isHighlight
            />
          </LinearGradient>
        </View>
      ) : null}

      {/* Pricing Breakdown (Customer) */}
      <View style={styles.pricingCard}>
        <LinearGradient
          colors={["rgba(34, 197, 94, 0.15)", "rgba(16, 185, 129, 0.05)"]}
          style={styles.pricingGradient}
        >
          <View style={styles.sectionHeader}>
            <DollarSign color="#22c55e" size={20} />
            <Text style={styles.sectionTitle}>Pricing Breakdown (USD)</Text>
          </View>

          <PriceRow label="Base Amount" value={Number(baseAmount).toFixed(2)} />
          <PriceRow label="Rush Fee" value={Number(rushFee).toFixed(2)} />
          {Number(adjustmentAmount) > 0 && (
            <PriceRow
              label="Adjustments"
              value={Number(adjustmentAmount).toFixed(2)}
            />
          )}
          <PriceRow
            label="Additional Charge"
            value={Number(additionalCharge).toFixed(2)}
          />
          <PriceRow
            label="Convenience Fee (7%)"
            value={convenienceFee.toFixed(2)}
          />

          <View style={styles.divider} />
          <PriceRow
            label="Estimated Total (Customer)"
            value={estimatedTotal.toFixed(2)}
            isTotal
          />
        </LinearGradient>
      </View>

      {/* Provider Earnings (NEW) */}
      <View style={styles.pricingCard}>
        <LinearGradient
          colors={["rgba(59, 130, 246, 0.15)", "rgba(37, 99, 235, 0.05)"]}
          style={styles.pricingGradient}
        >
          <View style={styles.sectionHeader}>
            <DollarSign color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>Your Earnings</Text>
          </View>

          <PriceRow
            label="Gross (before fees)"
            value={providerGross.toFixed(2)}
          />
          <PriceRow
            label="Service Pro Fee (7%)"
            value={providerFee.toFixed(2)}
            isNegative
          />
          <View style={styles.divider} />
          <PriceRow
            label="Estimated Net Payout"
            value={providerNet.toFixed(2)}
            isTotal
          />
        </LinearGradient>
      </View>

      {/* Emergency Form Responses */}
      {entries.length > 0 && (
        <View style={styles.responsesCard}>
          <LinearGradient
            colors={["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.05)"]}
            style={styles.responsesGradient}
          >
            <View style={styles.sectionHeader}>
              <MessageSquare color="#a855f7" size={20} />
              <Text style={styles.sectionTitle}>Emergency Form Responses</Text>
            </View>

            {entries.map(([k, v], i) => (
              <View key={k} style={styles.qaItem}>
                <View style={styles.questionRow}>
                  <FileText color="#94a3b8" size={16} />
                  <Text style={styles.question}>{QUESTIONS[k] || k}</Text>
                </View>
                <Text style={styles.answer}>
                  {Array.isArray(v) ? v.join(", ") : String(v)}
                </Text>
                {i < entries.length - 1 && (
                  <View style={styles.responseDivider} />
                )}
              </View>
            ))}
          </LinearGradient>
        </View>
      )}

      {/* Accept Button */}
      {status === "invited" && onAccept && (
        <View style={styles.acceptCard}>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <LinearGradient
              colors={["#22c55e", "#16a34a"]}
              style={styles.acceptButtonGradient}
            >
              <CheckCircle color="#fff" size={20} />
              <Text style={styles.acceptButtonText}>Accept Emergency Job</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "transparent" },
  loadingContainer: { marginTop: 20, borderRadius: 16, overflow: "hidden" },
  loadingGradient: { padding: 32, alignItems: "center" },
  loadingText: { color: "#e0e7ff", fontSize: 16, marginTop: 12 },
  headerCard: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  headerGradient: { padding: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  headerSubtitle: { fontSize: 14, color: "#e0e7ff", textAlign: "center" },
  infoCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  infoGradient: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  highlightRow: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e0e7ff",
    marginLeft: 8,
    minWidth: 80,
  },
  highlightLabel: { color: "#fff" },
  infoValue: { fontSize: 14, color: "#fff", flex: 1 },
  highlightValue: { fontWeight: "600" },
  phoneCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  phoneGradient: { padding: 16 },
  phoneButton: { borderRadius: 12, overflow: "hidden" },
  phoneButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  phoneButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  phoneRevealCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  phoneRevealGradient: { padding: 16 },
  pricingCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  pricingGradient: { padding: 16 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalRow: { paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: "#e0e7ff" },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#fff" },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#22c55e" },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 8,
  },
  responsesCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  responsesGradient: { padding: 16 },
  qaItem: { marginBottom: 12 },
  questionRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  question: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
    flex: 1,
  },
  answer: { fontSize: 14, color: "#e0e7ff", marginLeft: 24, lineHeight: 20 },
  responseDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 8,
  },
  acceptCard: { marginTop: 8 },
  acceptButton: { borderRadius: 16, overflow: "hidden" },
  acceptButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  acceptButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
