import { Camera, CameraView } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

const PLATE_API_TOKEN = "d730676f0615226fbe06ce41ac0ae04f7f6f26cd"; // 🔹 Tu token de Plate Recognizer
const VEHICLE_API_BASE = "https://www.gurapp.cl/vehicle/";

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<any | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  // 🔹 Solicitud de permisos de cámara
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // 🔹 Captura y análisis de imagen con Plate Recognizer
  const handleCapture = async () => {
    if (!cameraRef.current || scanning) return;
    setScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

      // Limpieza y compresión de imagen
      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: photo.width * 0.5 });
      const renderedImage = await context.renderAsync();
      const resized = await renderedImage.saveAsync({
        compress: 0.5,
        format: SaveFormat.JPEG,
        base64: true,
      });

      // 🔹 Envío a Plate Recognizer
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
        setRecognizedPlate(plate);
        fetchVehicleData(plate);
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

  // 🔹 Consultar información del vehículo
  const fetchVehicleData = async (plate: string) => {
    try {
      setLoadingVehicle(true);
      setVehicleData(null);

      const url = `${VEHICLE_API_BASE}${plate}.json`;
      console.log("Consultando:", url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const json = await res.json();
      console.log("Datos del vehículo:", json);
      setVehicleData(json);
    } catch (error) {
      console.error("Error al obtener datos del vehículo:", error);
      alert("No se encontró información del vehículo o hubo un error.");
    } finally {
      setLoadingVehicle(false);
    }
  };

  // 🔹 Mostrar datos del vehículo (si existen)
  if (vehicleData) {
    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.title}>Patente detectada: {recognizedPlate}</Text>
        <Text style={styles.subtitle}>Información del vehículo:</Text>
        <View style={styles.jsonBox}>
          <Text style={styles.jsonText}>{JSON.stringify(vehicleData, null, 2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setVehicleData(null);
            setRecognizedPlate(null);
          }}
        >
          <Text style={styles.buttonText}>Volver a escanear</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // 🔹 Vista principal con cámara
  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No se otorgó permiso para usar la cámara</Text>;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} ratio="16:9">
        <View style={styles.overlay}>
          <View style={styles.mask}>
            {recognizedPlate && (
              <Text style={styles.plateText}>{recognizedPlate}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          disabled={scanning}
        >
          {scanning || loadingVehicle ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Escanear</Text>
          )}
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
    justifyContent: "center",
    alignItems: "center",
  },
  plateText: {
    color: "#00FFAA",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
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
  resultContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#111",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#00FFAA", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#fff", marginBottom: 10 },
  jsonBox: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
  },
  jsonText: { color: "#fff", fontFamily: "monospace" },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
});
