// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import api from "../api/client";
// // // import QUESTIONS from "../utils/serviceMatrix";
// // // import coveredDescriptions from "../utils/coveredDescriptions";

// // // export default function JobDetails({ jobId, onAccept }) {
// // //   const [job, setJob] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     let alive = true;
// // //     api
// // //       .get(`/jobs/${jobId}`)
// // //       .then(({ data }) => {
// // //         if (!alive) return;
// // //         setJob(data);
// // //       })
// // //       .catch((err) => {
// // //         console.error("JobDetails load error:", err);
// // //         Alert.alert("Error", "Could not load job details.");
// // //       })
// // //       .finally(() => alive && setLoading(false));
// // //     return () => {
// // //       alive = false;
// // //     };
// // //   }, [jobId]);

// // //   const issue = job.details?.issue;
// // //   const description = issue ? coveredDescriptions[issue] : null;

// // //   if (loading) {
// // //     return <ActivityIndicator style={{ marginTop: 20 }} />;
// // //   }
// // //   if (!job) {
// // //     return <Text style={styles.error}>Job not found.</Text>;
// // //   }

// // //   const {
// // //     serviceType,
// // //     status,
// // //     paymentStatus,
// // //     customerAccepted,
// // //     customerCompleted,
// // //     details,
// // //     estimatedTotal,
// // //     additionalCharge,
// // //     address,
// // //     serviceCity,
// // //     serviceZipcode,
// // //   } = job;

// // //   // turn `details` into a Q&A array
// // //   let entries = [];
// // //   if (typeof details === "string") {
// // //     try {
// // //       entries = Object.entries(JSON.parse(details));
// // //     } catch {
// // //       entries = [];
// // //     }
// // //   } else if (typeof details === "object") {
// // //     entries = Object.entries(details);
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       <Text style={styles.header}>Job Details</Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Service Type:</Text> {serviceType}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Status:</Text> {status}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Customer Accepted:</Text>{" "}
// // //         {String(customerAccepted)}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Total Amount Paid:</Text>{" "}
// // //         {String(estimatedTotal)}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Additional Charge:</Text>{" "}
// // //         {String(additionalCharge)}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Service Address:</Text> {String(address)}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Service City:</Text> {String(serviceCity)}
// // //       </Text>
// // //       <Text>
// // //         <Text style={styles.bold}>Service Zipcode:</Text>{" "}
// // //         {String(serviceZipcode)}
// // //       </Text>
// // //       <Text style={styles.sectionTitle}>What’s Covered:</Text>
// // //       <Text style={styles.descriptionText}>{description}</Text>

// // //       {entries.length > 0 && (
// // //         <View style={styles.qaContainer}>
// // //           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
// // //           {entries.map(([k, v], i) => (
// // //             <View key={k} style={styles.qaItem}>
// // //               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
// // //               <Text style={styles.a}>
// // //                 {Array.isArray(v) ? v.join(", ") : String(v)}
// // //               </Text>
// // //               {i < entries.length - 1 && <View style={styles.divider} />}
// // //             </View>
// // //           ))}
// // //         </View>
// // //       )}

// // //       {status === "invited" && onAccept && (
// // //         <Button title="Accept Job Invitation" onPress={onAccept} />
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { padding: 24, backgroundColor: "#fff", textAlign: "center" },
// // //   header: {
// // //     fontSize: 24,
// // //     fontWeight: "bold",
// // //     marginBottom: 12,
// // //     textAlign: "center",
// // //   },
// // //   bold: { fontWeight: "600" },
// // //   qaContainer: { marginTop: 16 },
// // //   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
// // //   qaItem: { marginBottom: 8 },
// // //   q: { fontWeight: "500" },
// // //   a: { marginLeft: 4, marginBottom: 4 },
// // //   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
// // //   error: { color: "red", marginTop: 20 },
// // //   sectionTitle: {
// // //     fontSize: 16,
// // //     fontWeight: "600",
// // //     marginBottom: 4,
// // //   },
// // //   descriptionText: {
// // //     fontSize: 14,
// // //     color: "#555",
// // //     lineHeight: 20,
// // //   },
// // // });

// // // screens/JobDetails.js
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   Button,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import { useNavigation } from "@react-navigation/native";
// // import api from "../api/client";
// // import QUESTIONS from "../utils/serviceMatrix";
// // import coveredDescriptions from "../utils/coveredDescriptions";

// // export default function JobDetails({ jobId, onAccept }) {
// //   const navigation = useNavigation();
// //   const [job, setJob] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     let alive = true;
// //     api
// //       .get(`/jobs/${jobId}`)
// //       .then(({ data }) => {
// //         if (!alive) return;
// //         setJob(data);
// //       })
// //       .catch((err) => {
// //         console.error("JobDetails load error:", err);
// //         Alert.alert("Error", "Could not load job details.");
// //       })
// //       .finally(() => alive && setLoading(false));
// //     return () => {
// //       alive = false;
// //     };
// //   }, [jobId]);

// //   // redirect homeowner to pay if provider just added charge
// //   useEffect(() => {
// //     if (job?.status === "awaiting-additional-payment") {
// //       navigation.replace("PaymentScreen", { jobId });
// //     }
// //   }, [job?.status, navigation, jobId]);

// //   if (loading) {
// //     return <ActivityIndicator style={{ marginTop: 20 }} />;
// //   }
// //   if (!job) {
// //     return <Text style={styles.error}>Job not found.</Text>;
// //   }

// //   const {
// //     serviceType,
// //     status,
// //     paymentStatus,
// //     customerAccepted,
// //     details,
// //     baseAmount = 0,
// //     adjustmentAmount = 0,
// //     rushFee = 0,
// //     additionalCharge = 0,
// //     address,
// //     serviceCity,
// //     serviceZipcode,
// //   } = job;

// //   // build Q&A entries
// //   let entries = [];
// //   if (typeof details === "string") {
// //     try {
// //       entries = Object.entries(JSON.parse(details));
// //     } catch {
// //       entries = [];
// //     }
// //   } else if (typeof details === "object") {
// //     entries = Object.entries(details);
// //   }

// //   // compute fees & totals
// //   const subtotal =
// //     baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
// //   const convenienceFee = Number((subtotal * 0.07).toFixed(2));
// //   const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

// //   const issue = details?.issue;
// //   const description = issue ? coveredDescriptions[issue] : null;

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.header}>Job Details</Text>

// //       <Text>
// //         <Text style={styles.bold}>Service Type:</Text> {serviceType}
// //       </Text>
// //       <Text>
// //         <Text style={styles.bold}>Status:</Text> {status}
// //       </Text>
// //       <Text>
// //         <Text style={styles.bold}>Payment Status:</Text>{" "}
// //         {paymentStatus || "-"}
// //       </Text>
// //       <Text>
// //         <Text style={styles.bold}>Service Address:</Text> {address}
// //       </Text>
// //       <Text>
// //         <Text style={styles.bold}>Service City:</Text> {serviceCity}
// //       </Text>
// //       <Text>
// //         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
// //       </Text>

// //       <View style={styles.section}>
// //         <Text style={styles.bold}>Breakdown (USD):</Text>
// //         <Text>Base Amount: ${baseAmount.toFixed(2)}</Text>
// //         <Text>Adjustments: ${adjustmentAmount.toFixed(2)}</Text>
// //         <Text>Rush Fee: ${rushFee.toFixed(2)}</Text>
// //         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
// //         <Text style={{ marginTop: 4 }}>Subtotal: ${subtotal.toFixed(2)}</Text>
// //         <Text>Convenience Fee (7%): ${convenienceFee.toFixed(2)}</Text>
// //         <Text style={{ fontWeight: "700", marginTop: 4 }}>
// //           Estimated Total: ${estimatedTotal.toFixed(2)}
// //         </Text>
// //       </View>

// //       {/* {description && (
// //         <>
// //           <Text style={styles.sectionTitle}>What’s Covered:</Text>
// //           <Text style={styles.descriptionText}>{description}</Text>
// //         </>
// //       )} */}
// //            {/** Loop through every key in details */}
// //            {Object.entries(details).map(([key, val]) => (
// //         <Text key={key} style={styles.line}>
// //           <Text style={styles.label}>
// //             { // nice human-friendly label
// //               {
// //                 issue: "Description:",
// //               }[key] || key.charAt(0).toUpperCase() + key.slice(1) + ":"
// //             }
// //           </Text>{" "}
// //           {String(val)}
// //         </Text>
// //       ))}

// //       {entries.length > 0 && (
// //         <View style={styles.qaContainer}>
// //           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
// //           {entries.map(([k, v], i) => (
// //             <View key={k} style={styles.qaItem}>
// //               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
// //               <Text style={styles.a}>
// //                 {Array.isArray(v) ? v.join(", ") : String(v)}
// //               </Text>
// //               {i < entries.length - 1 && <View style={styles.divider} />}
// //             </View>
// //           ))}
// //         </View>
// //       )}

// //       {status === "invited" && onAccept && (
// //         <Button title="Accept Job Invitation" onPress={onAccept} />
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { padding: 24, backgroundColor: "#fff" },
// //   header: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //     marginBottom: 12,
// //     textAlign: "center",
// //   },
// //   bold: { fontWeight: "600" },
// //   section: { marginTop: 16 },
// //   sectionTitle: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     marginTop: 20,
// //     marginBottom: 4,
// //   },
// //   descriptionText: {
// //     fontSize: 14,
// //     color: "#555",
// //     lineHeight: 20,
// //   },
// //   qaContainer: { marginTop: 20 },
// //   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
// //   qaItem: { marginBottom: 8 },
// //   q: { fontWeight: "500" },
// //   a: { marginLeft: 4, marginBottom: 4 },
// //   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
// //   error: { color: "red", marginTop: 20, textAlign: "center" },
// // });

// // screens/JobDetails.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";

// export default function JobDetails({ jobId, onAccept }) {
//   const navigation = useNavigation();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     api
//       .get(`/jobs/${jobId}`)
//       .then(({ data }) => {
//         if (alive) setJob(data);
//       })
//       .catch((err) => {
//         console.error("JobDetails load error:", err);
//         Alert.alert("Error", "Could not load job details.");
//       })
//       .finally(() => {
//         if (alive) setLoading(false);
//       });
//     return () => {
//       alive = false;
//     };
//   }, [jobId]);

//   // If provider adds an extra charge, immediately send homeowner to pay
//   useEffect(() => {
//     if (job?.status === "awaiting-additional-payment") {
//       navigation.replace("PaymentScreen", { jobId });
//     }
//   }, [job?.status, navigation, jobId]);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 20 }} />;
//   }
//   if (!job) {
//     return <Text style={styles.error}>Job not found.</Text>;
//   }

//   const {
//     serviceType,
//     status,
//     paymentStatus,
//     customerAccepted,
//     details = {},
//     baseAmount = 0,
//     adjustmentAmount = 0,
//     rushFee = 0,
//     additionalCharge = 0,
//     address,
//     serviceCity,
//     serviceZipcode,
//     phoneNumber,
//   } = job;

//   // compute all our fees & totals
//   const subtotal =
//     baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
//   const convenienceFee = Number((subtotal * 0.07).toFixed(2));
//   const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

//   // pull description from util map
//   const issueKey = details.issue;
//   const description = issueKey ? getCoveredDescription(issueKey) : null;

//   // build Q&A from details object
//   let entries = [];
//   if (typeof details === "object") {
//     entries = Object.entries(details);
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Job Details</Text>

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
//         <Text style={styles.bold}>Service Address:</Text> {address}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service City:</Text> {serviceCity}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Customer's Phone Number:</Text> {phoneNumber}
//       </Text>

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         {/* <Text>Base Amount: ${baseAmount.toFixed(2)}</Text>
//         <Text>Adjustments: ${adjustmentAmount.toFixed(2)}</Text>
//         <Text>Rush Fee: ${rushFee.toFixed(2)}</Text> */}
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         {/* <Text style={{ marginTop: 4 }}>Subtotal: ${subtotal.toFixed(2)}</Text>
//         <Text>Convenience Fee (7%): ${convenienceFee.toFixed(2)}</Text> */}
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize:22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {description && (
//         <>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </>
//       )}

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
//         <Button title="Accept Job Invitation" onPress={onAccept} />
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";
// import { getCoveredDescription } from "../utils/serviceMatrix";
// import {useCountdown} from '../components/useCountdown'

// export default function JobDetails({ jobId, job: jobProp, onAccept }) {
//   const navigation = useNavigation();
//   const [job, setJob] = useState(jobProp || null);
//   const [loading, setLoading] = useState(!jobProp);
//   const secondsLeft = useCountdown(job?.invitationExpiresAt);
//   const isPhaseOneActive = job?.invitationPhase === 1 && secondsLeft > 0;

//   useEffect(() => {
//     if (jobProp) return;

//     let alive = true;
//     api
//       .get(`/jobs/${jobId}`)
//       .then(({ data }) => {
//         if (alive) setJob(data);
//       })
//       .catch((err) => {
//         console.error("JobDetails load error:", err);
//         Alert.alert("Error", "Could not load job details.");
//       })
//       .finally(() => {
//         if (alive) setLoading(false);
//       });

//     return () => {
//       alive = false;
//     };
//   }, [jobId, jobProp]);

//   useEffect(() => {
//     if (job?.status === "awaiting-additional-payment") {
//       navigation.replace("PaymentScreen", { jobId });
//     }
//   }, [job?.status, navigation, jobId]);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 20 }} />;
//   }

//   if (!job) {
//     return <Text style={styles.error}>Job not found.</Text>;
//   }

//   const {
//     serviceType,
//     status,
//     paymentStatus,
//     details = {},
//     baseAmount = 0,
//     adjustmentAmount = 0,
//     rushFee = 0,
//     additionalCharge = 0,
//     address,
//     serviceCity,
//     serviceZipcode,
//     phoneNumber,
//   } = job;

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
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

//   let issueKey = null;
//   try {
//     if (typeof details === "string") {
//       issueKey = JSON.parse(details).issue;
//     } else {
//       issueKey = details?.issue;
//     }
//   } catch {
//     issueKey = null;
//   }

//   const description = issueKey ? getCoveredDescription(issueKey) : null;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Job Details</Text>

//       <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
//       <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
//       <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
//       <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
//       <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
//       <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>
//       {phoneNumber && (
//         <Text><Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}</Text>
//       )}

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {description ? (
//         <>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </>
//       ) : (
//         <Text style={styles.descriptionText}>
//           Coverage details will appear once available.
//         </Text>
//       )}

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
//         // <Button
//         // title="Accept Job Invitation"
//         // onPress={onAccept}
//         // />
//         <Button
//         title="Accept"
//         disabled={isPhaseOneActive}
//         onPress={onAccept}
//         // color={clickable ? "#1976d2" : "#999"}
//         />
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

//previous
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";
// import { getCoveredDescription } from "../utils/serviceMatrix";
// import { useCountdown } from "../components/useCountdown";

// export default function JobDetails({ jobId, job: jobProp, onAccept }) {
//   const navigation = useNavigation();
//   const [job, setJob] = useState(jobProp || null);
//   const [loading, setLoading] = useState(!jobProp);
//   const secondsLeft = useCountdown(job?.invitationExpiresAt);
//   const isPhaseOneActive = job?.invitationPhase === 1 && secondsLeft > 0;
//   const [showPhone, setShowPhone] = useState(false);

//   useEffect(() => {
//     if (jobProp || !jobId) return;
//     console.log("🔍 Fetching job details for ID:", jobId);
//     let alive = true;
//     api
//       .get(`/jobs/${jobId}`)
//       .then(({ data }) => {
//         if (alive) setJob(data);
//       })
//       .catch((err) => {
//         console.error(
//           "JobDetails load error:",
//           err?.response?.data || err.message
//         );
//         if (err.response?.status === 403) {
//           Alert.alert(
//             "Access Denied",
//             "You are not authorized to view this job."
//           );
//         } else if (err.response?.status === 404) {
//           Alert.alert("Job Not Found", "This job no longer exists.");
//         } else {
//           Alert.alert("Error", "Could not load job details.");
//         }
//       })

//       // .catch((err) => {
//       //   console.error("JobDetails load error:", err);
//       //   if (err.response?.status === 403) {
//       //     Alert.alert(
//       //       "Access Denied",
//       //       "You are not authorized to view this job."
//       //     );
//       //   } else {
//       //     Alert.alert("Error", "Could not load job details.");
//       //   }
//       // })
//       .finally(() => {
//         if (alive) setLoading(false);
//       });

//     return () => {
//       alive = false;
//     };
//   }, [jobId, jobProp]);

//   useEffect(() => {
//     if (job?.status === "awaiting-additional-payment") {
//       navigation.replace("PaymentScreen", { jobId });
//     }
//   }, [job?.status, navigation, jobId]);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 20 }} />;
//   }

//   if (!job) {
//     return <Text style={styles.error}>Job not found or access denied.</Text>;
//   }

//   const {
//     customer,
//     serviceType,
//     status,
//     paymentStatus,
//     details = {},
//     baseAmount = 0,
//     adjustmentAmount = 0,
//     rushFee = 0,
//     additionalCharge = 0,
//     address,
//     serviceCity,
//     serviceZipcode,
//     phoneNumber,
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

//   let issueKey = null;
//   try {
//     if (typeof details === "string") {
//       issueKey = JSON.parse(details).issue;
//     } else {
//       issueKey = details?.issue;
//     }
//   } catch {
//     issueKey = null;
//   }

//   const description = issueKey ? getCoveredDescription(issueKey) : null;

//   useEffect(() => {
//     if (!job || job.status !== "accepted") return;
//     const timer = setTimeout(() => setShowPhone(true), 1 * 60 * 1000);
//     return () => clearTimeout(timer);
//   }, [job?.status]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Job Details</Text>

//       {/* <Text>
//         <Text style={styles.bold}>Customer Name:</Text> {customer.name}
//       </Text> */}
//       {customer?.name && (
//         <Text>
//           <Text style={styles.bold}>Customer Name:</Text> {customer.name}
//         </Text>
//       )}
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
//         <Text style={styles.bold}>Service Address:</Text> {address}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service City:</Text> {serviceCity}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
//       </Text>
//       {showPhone && phoneNumber && (
//         <Text>
//           <Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}
//         </Text>
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
//           }}
//         >
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {description ? (
//         <>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </>
//       ) : (
//         <Text style={styles.descriptionText}>
//           Coverage details will appear once available.
//         </Text>
//       )}

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
//         <Button title="Accept" disabled={isPhaseOneActive} onPress={onAccept} />
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";
// import { getCoveredDescription } from "../utils/serviceMatrix";
// import { useCountdown } from "../components/useCountdown";

// export default function JobDetails({ job, onAccept }) {
//   if (!job) {
//     return <ActivityIndicator style={{ marginTop: 20 }} />;
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

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
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
//       <Text style={styles.header}>Job Details</Text>
//       {/* Render job details */}
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
//         <Text style={styles.bold}>Service Address:</Text> {address}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service City:</Text> {serviceCity}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
//       </Text>
//       {/* Additional details */}
//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text
//           style={{
//             fontWeight: "700",
//             marginTop: 4,
//             fontSize: 22,
//             textAlign: "center",
//           }}
//         >
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>
//       {/* Emergency Form Responses */}
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
//       {/* Accept Button */}
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job: propJob, onAccept }) {
//   const [job, setJob] = useState(propJob);

//   useEffect(() => {
//     setJob(propJob);
//   }, [propJob]);

//   const [showPhone, setShowPhone] = useState(false);

//   useEffect(() => {
//     if (job?.status !== "accepted") return;

//     const timer = setTimeout(() => {
//       setShowPhone(true);
//     }, 60 * 1000); // 1 minute

//     return () => clearTimeout(timer);
//   }, [job?.status]);

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
//         <Text style={styles.bold}>Service Address:</Text> {address}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service City:</Text> {serviceCity}
//       </Text>
//       <Text>
//         <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
//       </Text>

//       {showPhone && phoneNumber && (
//         <Text>
//           <Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}
//         </Text>
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job: propJob, onAccept }) {
//   const [job, setJob] = useState(propJob);
//   const [showPhone, setShowPhone] = useState(false);

//   useEffect(() => {
//     setJob(propJob);
//   }, [propJob]);

//   useEffect(() => {
//     if (job?.status !== "accepted") return;

//     console.log("📞 Timer started for showing phone number...");

//     const timer = setTimeout(() => {
//       console.log("✅ One minute passed, revealing phone number");
//       setShowPhone(true);
//     }, 60 * 1000); // 1 minute

//     return () => clearTimeout(timer);
//   }, [job?.status]);

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

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
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
//       <Text style={styles.header}>Job Details</Text>
//       <Text><Text style={styles.bold}>Customer Name:</Text> {customer?.name}</Text>
//       <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
//       <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
//       <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
//       <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
//       <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
//       <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>

//       {showPhone && phoneNumber && (
//         <Text><Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}</Text>
//       )}

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {entries.length > 0 && (
//         <View style={styles.qaContainer}>
//           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
//           {entries.map(([k, v], i) => (
//             <View key={k} style={styles.qaItem}>
//               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
//               <Text style={styles.a}>{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job: propJob, onAccept }) {
//   const [job, setJob] = useState(propJob);
//   const [showPhone, setShowPhone] = useState(false);

//   useEffect(() => {
//     setJob(propJob);
//   }, [propJob]);

//   useEffect(() => {
//     let interval;
//     if (job?.acceptedAt) {
//       const checkElapsedTime = () => {
//         const acceptedTime = new Date(job.acceptedAt).getTime();
//         const currentTime = Date.now();
//         const elapsedSeconds = Math.floor((currentTime - acceptedTime) / 1000);
//         if (elapsedSeconds >= 60) {
//           setShowPhone(true);
//           clearInterval(interval);
//         }
//       };
//       checkElapsedTime();
//       interval = setInterval(checkElapsedTime, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [job]);

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

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
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
//       <Text style={styles.header}>Job Details</Text>
//       <Text><Text style={styles.bold}>Customer Name:</Text> {customer?.name}</Text>
//       <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
//       <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
//       <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
//       <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
//       <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
//       <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>

//       {showPhone && (
//         <Text><Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}</Text>
//       )}

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {entries.length > 0 && (
//         <View style={styles.qaContainer}>
//           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
//           {entries.map(([k, v], i) => (
//             <View key={k} style={styles.qaItem}>
//               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
//               <Text style={styles.a}>{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
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
//   },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job: propJob, onAccept }) {
//   const [job, setJob] = useState(propJob);
//   const [showPhone, setShowPhone] = useState(false);

//   useEffect(() => {
//     setJob(propJob);
//   }, [propJob]);

//   useEffect(() => {
//     if (!job?.acceptedAt) return;

//     const acceptedTime = new Date(job.acceptedAt).getTime();
//     const elapsed = Date.now() - acceptedTime;

//     if (elapsed >= 60_000) {
//       setShowPhone(true);
//       return;
//     }

//     const timeout = setTimeout(() => setShowPhone(true), 60_000 - elapsed);
//     return () => clearTimeout(timeout);
//   }, [job?.acceptedAt]);

//   if (!job) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

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

//   // console.log(job)

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
//   const convenienceFee = Number((subtotal * 0.07).toFixed(2));
//   const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

//   let entries = [];
//   try {
//     entries = typeof details === "string"
//       ? Object.entries(JSON.parse(details))
//       : typeof details === "object" && details !== null
//       ? Object.entries(details)
//       : [];
//   } catch {
//     entries = [];
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Job Details</Text>
//       <Text><Text style={styles.bold}>Customer Name:</Text> {customer?.name}</Text>
//       <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
//       <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
//       <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
//       <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
//       <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
//       <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>
//       <Text><Text style={styles.bold}>Customer Phone:</Text> {customer?.phoneNumber}</Text>
     
//      {/* for later logic to render after 6 min */}
//       {showPhone && (
//         <Text><Text style={styles.bold}>Customer Phone:</Text> {customer?.phoneNumber}</Text>
//       )}

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {entries.length > 0 && (
//         <View style={styles.qaContainer}>
//           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
//           {entries.map(([k, v], i) => (
//             <View key={k} style={styles.qaItem}>
//               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
//               <Text style={styles.a}>{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
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
//   header: { fontSize: 24, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
//   bold: { fontWeight: "600" },
//   section: { marginTop: 16 },
//   sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 4 },
//   descriptionText: { fontSize: 14, color: "#555", lineHeight: 20 },
//   qaContainer: { marginTop: 20 },
//   qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
//   qaItem: { marginBottom: 8 },
//   q: { fontWeight: "500" },
//   a: { marginLeft: 4, marginBottom: 4 },
//   divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
//   error: { color: "red", marginTop: 20, textAlign: "center" },
// });

// import React, { useEffect, useState } from "react";
// import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
// import QUESTIONS from "../utils/serviceMatrix";

// export default function JobDetails({ job: propJob, onAccept }) {
//   const [job, setJob] = useState(propJob);
//   const [showPhone, setShowPhone] = useState(false);
//   const [showPhoneButton, setShowPhoneButton] = useState(false);

//   useEffect(() => {
//     setJob(propJob);
//   }, [propJob]);

//   useEffect(() => {
//     let timer;
//     if (job?.acceptedAt) {
//       const acceptedTime = new Date(job.acceptedAt).getTime();
//       const now = Date.now();
//       const elapsed = now - acceptedTime;
//       const delay = Math.max(0, 1 * 60 * 1000 - elapsed);

//       timer = setTimeout(() => setShowPhoneButton(true), delay);
//     }
//     return () => clearTimeout(timer);
//   }, [job]);

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

//   const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
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
//       <Text style={styles.header}>Job Details</Text>
//       <Text><Text style={styles.bold}>Customer Name:</Text> {customer?.name}</Text>
//       <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
//       <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
//       <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
//       <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
//       <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
//       <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>

//       {/* {showPhone && (
//         <Text><Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}</Text>
//       )} */}

//       {showPhoneButton && !showPhone && (
//         <Button title="Reveal Customer Phone" onPress={() => setShowPhone(true)} />
//       )}

//       <View style={styles.section}>
//         <Text style={styles.bold}>Breakdown (USD):</Text>
//         <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
//         <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
//           Estimated Total: ${estimatedTotal.toFixed(2)}
//         </Text>
//       </View>

//       {entries.length > 0 && (
//         <View style={styles.qaContainer}>
//           <Text style={styles.qaHeader}>Emergency Form Responses</Text>
//           {entries.map(([k, v], i) => (
//             <View key={k} style={styles.qaItem}>
//               <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
//               <Text style={styles.a}>{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
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


import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
import QUESTIONS from "../utils/serviceMatrix";

export default function JobDetails({ job, onAccept }) {
  const [showPhone, setShowPhone] = useState(false);
  const [elapsedReady, setElapsedReady] = useState(false);

  useEffect(() => {
    if (!job?.acceptedAt) return;

    const acceptedTime = new Date(job.acceptedAt).getTime();
    const delay = Math.max(0, .2 * 60 * 1000 - (Date.now() - acceptedTime));

    const timeout = setTimeout(() => {
      setElapsedReady(true);
      console.log('phone button fired')
    }, delay);

    return () => clearTimeout(timeout);
  }, [job?.acceptedAt]);

  if (!job) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const {
    customer,
    serviceType,
    status,
    paymentStatus,
    address,
    serviceCity,
    serviceZipcode,
    phoneNumber,
    baseAmount = 0,
    adjustmentAmount = 0,
    rushFee = 0,
    additionalCharge = 0,
    details = {},
  } = job;

  const subtotal = baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
  const convenienceFee = Number((subtotal * 0.07).toFixed(2));
  const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

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
      <Text style={styles.header}>Job Details</Text>
      <Text><Text style={styles.bold}>Customer Name:</Text> {customer?.name}</Text>
      <Text><Text style={styles.bold}>Service Type:</Text> {serviceType}</Text>
      <Text><Text style={styles.bold}>Status:</Text> {status}</Text>
      <Text><Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}</Text>
      <Text><Text style={styles.bold}>Service Address:</Text> {address}</Text>
      <Text><Text style={styles.bold}>Service City:</Text> {serviceCity}</Text>
      <Text><Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}</Text>

      {/* {showPhone && (
        <Text><Text style={styles.bold}>Customer Phone:</Text> {phoneNumber}</Text>
      )} */}

      {elapsedReady && !showPhone && (
        <Button title="Reveal Customer Phone" onPress={() => setShowPhone(true)} />
      )}

      <View style={styles.section}>
        <Text style={styles.bold}>Breakdown (USD):</Text>
        <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
        <Text style={{ fontWeight: "700", marginTop: 4, fontSize: 22, textAlign: "center" }}>
          Estimated Total: ${estimatedTotal.toFixed(2)}
        </Text>
      </View>

      {entries.length > 0 && (
        <View style={styles.qaContainer}>
          <Text style={styles.qaHeader}>Emergency Form Responses</Text>
          {entries.map(([k, v], i) => (
            <View key={k} style={styles.qaItem}>
              <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
              <Text style={styles.a}>{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
              {i < entries.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}

      {status === "invited" && onAccept && (
        <Button title="Accept" onPress={onAccept} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  bold: { fontWeight: "600" },
  section: { marginTop: 16 },
  qaContainer: { marginTop: 20 },
  qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  qaItem: { marginBottom: 8 },
  q: { fontWeight: "500" },
  a: { marginLeft: 4, marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
});
