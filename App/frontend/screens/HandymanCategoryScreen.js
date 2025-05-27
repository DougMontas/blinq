// frontend/screens/HandymanCategoryScreen.js
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// const SUBCATEGORIES = [
//   "Drywall Repair",
//   "Furniture Assembly",
//   "Mounting & Hanging",
//   "Minor Plumbing",
//   "Minor Electrical",
//   "Appliance Installation",
// ];

// export default function HandymanCategoryScreen() {
//   const navigation = useNavigation();

//   const handleSelect = (subcategory) => {
//     navigation.navigate("EstimateForm", { category: "Handyman", subcategory });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Select a Handyman Service</Text>
//       {SUBCATEGORIES.map((item) => (
//         <TouchableOpacity
//           key={item}
//           style={styles.option}
//           onPress={() => handleSelect(item)}
//         >
//           <Text style={styles.optionText}>{item}</Text>
//         </TouchableOpacity>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     marginVertical: 50,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   option: {
//     padding: 16,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   optionText: {
//     fontSize: 18,
//     fontWeight: "500",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// const { width } = Dimensions.get("window");

// const SUBCATEGORIES = [
//   {
//     label: "Drywall Repair",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Furniture Assembly",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Mounting & Hanging",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Plumbing",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Electrical",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Appliance Installation",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   }
// ];

// export default function HandymanCategoryScreen() {
//   const navigation = useNavigation();

//   const handleSelect = (subcategory) => {
//     navigation.navigate("EstimateForm", { category: "Handyman", subcategory });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Select a Handyman Service</Text>
//       <View style={styles.grid}>
//         {SUBCATEGORIES.map((item) => (
//           <TouchableOpacity
//             key={item.label}
//             style={styles.card}
//             onPress={() => handleSelect(item.label)}
//           >
//             <Image source={{ uri: item.image }} style={styles.cardImage} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{item.label}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     marginTop: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 12,
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 2,
//     marginBottom: 16,
//     width: width > 700 ? width / 3 - 24 : width / 2 - 24,
//   },
//   cardImage: {
//     width: "100%",
//     height: 120,
//   },
//   cardBody: {
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   cardLabel: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// const { width } = Dimensions.get("window");

// const SUBCATEGORIES = [
//   {
//     label: "Drywall Repair",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Furniture Assembly",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Mounting & Hanging",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Plumbing",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Electrical",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Appliance Installation",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   }
// ];

// export default function HandymanCategoryScreen() {
//   const navigation = useNavigation();

//   const handleSelect = (subcategory) => {
//     navigation.navigate("EstimateForm", { category: "Handyman", subcategory });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Select a Handyman Service</Text>
//       <View style={styles.grid}>
//         {SUBCATEGORIES.map((item) => (
//           <TouchableOpacity
//             key={item.label}
//             style={styles.card}
//             onPress={() => handleSelect(item.label)}
//           >
//             <Image source={{ uri: item.image }} style={styles.cardImage} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{item.label}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     marginTop: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 12,
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 2,
//     marginBottom: 16,
//     width: width > 700 ? width / 3 - 24 : width / 2 - 24,
//   },
//   cardImage: {
//     width: "100%",
//     height: 120,
//   },
//   cardBody: {
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   cardLabel: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });
// //HandymanCategotryScreen
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";

// const { width } = Dimensions.get("window");

// const SUBCATEGORIES = [
//   {
//     label: "Drywall Repair",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Furniture Assembly",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Mounting & Hanging",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Plumbing",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Minor Electrical",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   },
//   {
//     label: "Appliance Installation",
//     image: "https://imgs.search.brave.com/ocuMnF3baolSByagLAPLBgTuap6z4K9gwhXaCblctd8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vXy1pZTBp/V2tpTDZxLVVIODV3/VzhRY0pINGxSMkVG/ak9xRkpiUUE3Z2g3/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Ykdsdy9ZWEowTFd4/cFluSmhjbmt1L1ky/OXRMekl3TWpRdmFH/RnUvWkhsdFlXNHRh/VzFoWjJWei9MV1p5/WldVdmFHRnVaSGx0/L1lXNHRhVzFoWjJW/ekxXWnkvWldVdE1p/NXFjR2M"
//   }
// ];

// export default function HandymanCategoryScreen() {
//   const navigation = useNavigation();

//   const handleSelect = (subcategory) => {
//     navigation.navigate("serviceMatrix", { category: "Handyman", subcategory });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Select a Handyman Service</Text>
//       <View style={styles.grid}>
//         {SUBCATEGORIES.map((item) => (
//           <TouchableOpacity
//             key={item.label}
//             style={styles.card}
//             onPress={() => handleSelect(item.label)}
//           >
//             <Image source={{ uri: item.image }} style={styles.cardImage} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{item.label}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     marginTop: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 12,
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 2,
//     marginBottom: 16,
//     width: width > 700 ? width / 3 - 24 : width / 2 - 24,
//   },
//   cardImage: {
//     width: "100%",
//     height: 120,
//   },
//   cardBody: {
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   cardLabel: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import socket from "../components/socket";
import LogoutButton from "../components/LogoutButton";

// const SUBCATEGORIES = [
//   {
//     label: "Drywall Repair",
//     img: "https://imgs.search.brave.com/Okf1UVvJk4MjBlscDa3pGPeHSEs8yzKMceLHuB1yMJs/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vX1ZZeV8x/T0V6VVVfRERQbHVN/TzAyVGM0MGRNcEg5/aWNlQUx6T0JpM3Ju/MC9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTl0/WldScC9ZUzVwYzNS/dlkydHdhRzkwL2J5/NWpiMjB2YVdRdk1U/TTEvT1RneE56YzVP/Qzl3YUc5MC9ieTl0/WVc0dGNHeGhjM1Js/L2NtVnlMV052Ym5O/MGNuVmovZEdsdmJp/MTNiM0pyWlhJdC9Z/WFF0ZDI5eWF5MTBZ/V3RsL2N5MXdiR0Z6/ZEdWeUxXWnkvYjIw/dFluVmphMlYwTFdG/dS9aQzF3ZFhSekxX/bDBMVzl1L0xYUnli/M2RsYkMxMGJ5NXEv/Y0djX2N6MDJNVEo0/TmpFeS9KbmM5TUNa/clBUSXdKbU05L1Uw/ZHFlRU5wUjFOcFlV/MTUvYW1STGVYYzVa/V3BwTWpWeC9jVXR4/V0RkNWRsWnZia013/L2EwNHpSME4zYXow.jpeg",
//   },
//   {
//     label: "Furniture Assembly",
//     img: "https://static.vecteezy.com/system/resources/previews/002/115/431/original/coming-soon-business-sign-free-vector.jpg",
//   },
//   {
//     label: "Mounting & Hanging",
//     img: "https://static.vecteezy.com/system/resources/previews/002/115/431/original/coming-soon-business-sign-free-vector.jpg",
//   },
//   {
//     label: "Minor Plumbing",
//     img: "https://static.vecteezy.com/system/resources/previews/002/115/431/original/coming-soon-business-sign-free-vector.jpg",
//   },
//   {
//     label: "Minor Electrical",
//     img: "https://static.vecteezy.com/system/resources/previews/002/115/431/original/coming-soon-business-sign-free-vector.jpg",
//   },
//   {
//     label: "Appliance Installation",
//     img: "https://static.vecteezy.com/system/resources/previews/002/115/431/original/coming-soon-business-sign-free-vector.jpg",
//   },
// ];

const SUBCATEGORIES = [
  {
    label: "Drywall Repair",
    img: "https://th.bing.com/th/id/OIP.OFn-yBhr0crvKmLPd7ZP-gHaE7?w=260&h=180&c=7&r=0&o=5&dpr=2&pid=1.7", // valid image
  },
  {
    label: "Furniture Assembly",
    img: "https://images.unsplash.com/photo-1616627986315-8c18f30d0e96",
  },
  {
    label: "Mounting & Hanging",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  },
  {
    label: "Minor Plumbing",
    img: "https://images.unsplash.com/photo-1562440499-64e2123f2cf2",
  },
  {
    label: "Minor Electrical",
    img: "https://images.unsplash.com/photo-1581091215367-59cf0a0b16f9",
  },
  {
    label: "Appliance Installation",
    img: "https://images.unsplash.com/photo-1590595901608-2b5e6e7dc9ff",
  },
];

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.25;

export default function HandymanCategoryScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: me }, { data: job }] = await Promise.all([
          api.get("/users/me"),
          api.get("/jobs/homeowner/active"),
        ]);
        setUser(me);
        setActiveJob(job);
      } catch (err) {
        console.error(err);
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (user) {
      Alert.alert("Tip", "Select the handyman task you need help with.");
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("joinUserRoom", { userId: user.id });

    socket.on("jobAccepted", ({ jobId }) => {
      navigation.replace("CustomerJobStatus", { jobId });
    });

    return () => {
      socket.off("jobAccepted");
    };
  }, [user, navigation]);

  const firstName = user?.name?.split(" ")[0] || "Customer";

  const handleSelect = (subcategory) => {
    navigation.navigate("EmergencyForm", {
      category: "Handyman",
      subcategory, // passed into EmergencyForm for direct estimate
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LogoutButton />

      <LinearGradient
        colors={["#1976d2", "#2f80ed"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroText}>
          <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                marginHorizontal: 120,
              }}
              resizeMode="contain"
            />
          </View>
          {"\n"}
          Hi {firstName},{" "}
          <Text style={styles.heroSub}>
            What kind of handyman work do you need?
          </Text>
        </Text>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>
            If this is a life-threatening emergency, call 911!
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Choose a Handyman Specialist</Text>
      <View style={styles.cardsWrap}>
        {SUBCATEGORIES.map(({ label, img }) => {
          const isEnabled = label === "Drywall Repair";

          return (
            <TouchableOpacity
              key={label}
              style={[styles.card, !isEnabled && styles.disabledCard]}
              onPress={() => {
                if (isEnabled) {
                  handleSelect(label);
                } else {
                  Alert.alert("Coming Soon", `${label} is not yet available.`);
                }
              }}
            >
              <Image
                source={{ uri: img }}
                style={[
                  styles.cardImg,
                  !isEnabled && { opacity: 0.4 }, // fade image if disabled
                ]}
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>
                  {label}
                  {!isEnabled && " (Coming Soon)"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* <View style={styles.cardsWrap}>
        {SUBCATEGORIES.map(({ label, img }) => (
          <TouchableOpacity
            key={label}
            style={styles.card}
            onPress={() => handleSelect(label)}
          >
            <Image source={{ uri: img }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* {activeJob && (
        <>
          <Text style={styles.sectionTitle}>Current Job</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CustomerJobStatus", { jobId: activeJob._id })
            }
          >
            <Text style={{ color: "#1976d2", textAlign: "center" }}>
              View Job Status
            </Text>
          </TouchableOpacity>
        </> */}
      {/* )} */}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
  containerLogo: {},
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 30,
  },
  hero: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  heroText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 32,
  },
  heroSub: { fontWeight: "400" },
  ctaBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
  },
  cardsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  card: {
    width: 160,
    margin: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  cardImg: { width: "100%", height: 100 },
  cardBody: { alignItems: "center", paddingVertical: 10 },
  cardLabel: { fontSize: 16, fontWeight: "600" },
});
