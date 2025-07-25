// screens/ProvideRating.js
//original - semi working
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";

// export default function ProvideRating() {
//   const { params } = useRoute(); // ✅ Defensive param access
//   const jobId = params?.jobId;   // ✅ Handles undefined gracefully
//   const navigation = useNavigation();
//   const [rating, setRating] = useState(0);
//   const [comments, setComments] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const submitRating = async () => {
//     if (!jobId) {
//       Alert.alert("Missing Job ID", "Cannot submit rating without a job ID.");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await api.put(`/jobs/${jobId}/rate`, { rating, comments });
//       Alert.alert("Thanks!", "Your feedback has been recorded.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("CustomerDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to submit rating.");
//     } finally {
//       setSubmitting(false);
//     }
//   };
// // import React, { useState } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   TextInput,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import { useNavigation, useRoute } from "@react-navigation/native";
// // import api from "../api/client";

// // export default function ProvideRating() {
// //   const { jobId } = useRoute().params;
// //   const navigation = useNavigation();
// //   const [rating, setRating] = useState(0);
// //   const [comments, setComments] = useState("");
// //   const [submitting, setSubmitting] = useState(false);

// //   const submitRating = async () => {
// //     setSubmitting(true);
// //     try {
// //       await api.put(`/jobs/${jobId}/rate`, { rating, comments });
// //       Alert.alert("Thanks!", "Your feedback has been recorded.", [
// //         {
// //           text: "OK",
// //           onPress: () => navigation.replace("CustomerDashboard"),
// //         },
// //       ]);
// //     } catch (err) {
// //       console.error(err);
// //       Alert.alert("Error", "Failed to submit rating.");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Rate Your Service Provider</Text>

//       <View style={styles.stars}>
//         {[1, 2, 3, 4, 5].map((i) => (
//           <TouchableOpacity key={i} onPress={() => setRating(i)}>
//             <Text style={[styles.star, i <= rating && styles.starFilled]}>
//               ★
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.textarea}
//         multiline
//         numberOfLines={4}
//         placeholder="Leave a comment"
//         value={comments}
//         onChangeText={setComments}
//       />

//       <TouchableOpacity
//         style={[
//           styles.submitBtn,
//           (submitting || rating === 0) && styles.submitBtnDisabled,
//         ]}
//         onPress={submitRating}
//         disabled={submitting || rating === 0}
//       >
//         <Text style={styles.submitBtnText}>
//           {submitting ? "Submitting…" : "Submit Rating"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 24, justifyContent: "center" },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 2,
//     marginBottom: 24,
//   },
//   stars: { flexDirection: "row", justifyContent: "center", marginBottom: 24 },
//   star: { fontSize: 36, color: "#ccc", marginHorizontal: 4 },
//   starFilled: { color: "#f1c40f" },
//   textarea: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 24,
//     textAlignVertical: "top",
//   },
//   submitBtn: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   submitBtnDisabled: {
//     backgroundColor: "#aaa",
//   },
//   submitBtnText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api/client";

export default function ProvideRating() {
  const route = useRoute();
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Safely extract jobId from params
  const jobId = route?.params?.jobId;

  useEffect(() => {
    if (!jobId) {
      Alert.alert("Missing Job ID", "Cannot submit rating without a job ID.", [
        {
          text: "OK",
          onPress: () => navigation.replace("CustomerDashboard"),
        },
      ]);
    }
  }, [jobId]);

  const submitRating = async () => {
    if (!jobId) return; // ✅ Prevent submission if missing

    setSubmitting(true);
    try {
      await api.put(`/jobs/${jobId}/rate`, { rating, comments });
      Alert.alert("Thanks!", "Your feedback has been recorded.", [
        {
          text: "OK",
          onPress: () => navigation.replace("CustomerDashboard"),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate Your Service Provider</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Text style={[styles.star, i <= rating && styles.starFilled]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={4}
        placeholder="Leave a comment"
        value={comments}
        onChangeText={setComments}
      />

      <TouchableOpacity
        style={[
          styles.submitBtn,
          (submitting || rating === 0 || !jobId) && styles.submitBtnDisabled,
        ]}
        onPress={submitRating}
        disabled={submitting || rating === 0 || !jobId}
      >
        <Text style={styles.submitBtnText}>
          {submitting ? "Submitting…" : "Submit Rating"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    marginBottom: 24,
  },
  stars: { flexDirection: "row", justifyContent: "center", marginBottom: 24 },
  star: { fontSize: 36, color: "#ccc", marginHorizontal: 4 },
  starFilled: { color: "#f1c40f" },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 24,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#aaa",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
