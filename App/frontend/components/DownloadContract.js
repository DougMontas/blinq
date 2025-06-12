import React from "react";
import {
  View,
  Button,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import RNFS from "react-native-fs";
import IndependentContractor from "../assets/BlinqFix_Indepent_Contractor_Agreement";

const DownloadContract = () => {
  const fileUrl = IndependentContractor;
  const fileName = "BlinqFix_Indepent_Contractor_Agreement.pdf";
  const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const downloadFile = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Download Permission",
            message:
              "BlinqFix needs access to your storage to download the file.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission denied",
            "Cannot download without storage permission."
          );
          return;
        }
      }

      const options = {
        fromUrl: fileUrl,
        toFile: localFile,
      };

      const result = await RNFS.downloadFile(options).promise;
      if (result.statusCode === 200) {
        Alert.alert("Download Complete", `Saved to: ${localFile}`);
      } else {
        throw new Error("Failed to download file");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to download the file.");
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button
        title="Download Independent Contractor Agreement"
        onPress={downloadFile}
      />
    </View>
  );
};

export default DownloadContract;
