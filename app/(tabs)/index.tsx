import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Dimensions } from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

const { width, height } = Dimensions.get("window");

const PLATE_API_TOKEN = "YOUR_PLATE_TOKEN"; // 🔹 Reemplaza con tu token de Plate Recognizer
const CARABINEROS_URL = "https://www.autoseguro.gob.cl/";

export default function App() {

  // type ExpoCameraRef = {
  //   takePictureAsync: (options?: any) => Promise<{ uri: string; base64?: string; width: number; height: number }>;
  // };

  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  //permisos de camara
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  //captura y analisis de imagen
  const handleCapture = async () => {
    if (!cameraRef.current || scanning) return;
    setScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

      //limpieza de imagen
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: photo.width * 0.5 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
        method: "POST",
        headers: {
          Authorization: `Token ${PLATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ upload: `data:image/jpeg;base64,${resized.base64}` }),
      });

      const data = await response.json();
      console.log("Plate API response:", data);

      if (data.results && data.results.length > 0) {
        const plate = data.results[0].plate.toUpperCase();
        const finalUrl = `${CARABINEROS_URL}?patente=${plate}`;
        await Linking.openURL(finalUrl);
      } else {
        alert("No se detectó ninguna patente. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      alert("Hubo un error al escanear la patente.");
    } finally {
      setScanning(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No se otorgó permiso para usar la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={"back"} ref={cameraRef} ratio="16:9">
        <View style={styles.overlay}>
          <View style={styles.mask} />
        </View>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={scanning}>
          {scanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Escanear</Text>}
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, justifyContent: "flex-end" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  mask: {
    width: width * 0.8,
    height: height * 0.12,
    borderWidth: 2,
    borderColor: "#00FFAA",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  captureButton: {
    alignSelf: "center",
    marginBottom: 40,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
