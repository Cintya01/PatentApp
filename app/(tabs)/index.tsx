import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const PLATE_API_TOKEN = "d730676f0615226fbe06ce41ac0ae04f7f6f26cd"; // 🔹 Reemplaza con tu token de Plate Recognizer
const PATENTE_CHILE_URL = "https://www.volanteomaleta.com/";

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // 🔹 Nuevo estado para mostrar animación de redirección

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

      // Limpieza de imagen con ImageManipulator (forma actual)
      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: photo.width * 0.5 });
      const renderedImage = await context.renderAsync();
      const resized = await renderedImage.saveAsync({
        compress: 0.5,
        format: SaveFormat.JPEG,
        base64: true,
      });

      // 🔹 Envío a Plate Recognizer API
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

        // 🔹 Mostrar patente y animación durante 3 segundos antes de redirigir
        setRedirecting(true);
        setTimeout(() => {
          setRedirecting(false);
          setShowWebView(true);
        }, 3000);
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

  // 🔹 Mostrar WebView con la patente insertada en el campo correspondiente
  console.log("showview", showWebView, "recog", recognizedPlate)
  if (showWebView && recognizedPlate) {
    const injectedJS = `
    (function() {
      console.log("🔹 Script inyectado, esperando elementos...");

      function tryInject() {
        const input = document.querySelector('input[name="term"]');
        const btn = document.querySelector('button[type="submit"]');

        if (input && btn) {
          console.log("✅ Elementos encontrados, insertando patente...");
          input.focus();
          input.value = "${recognizedPlate}";
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));

          // Espera breve antes del clic, por si el sitio reacciona al cambio
          setTimeout(() => {
            btn.click();
            console.log("🔍 Botón de búsqueda presionado automáticamente");
            window.ReactNativeWebView?.postMessage("Patente insertada y buscada");
          }, 1000);
        } else {
          console.log("⏳ Aún no se encuentran los elementos, reintentando...");
          setTimeout(tryInject, 1000);
        }
      }

      // Espera 3 segundos para asegurarse de que el sitio cargó
      setTimeout(tryInject, 3000);
    })();
    true;
  `;

    return (
      <WebView
        source={{ uri: PATENTE_CHILE_URL }}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onMessage={(event) => console.log("📩 Mensaje desde WebView:", event.nativeEvent.data)}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text>Cargando portal de PatenteChile...</Text>
          </View>
        )}
      />
    );
  }


  // 🔹 Vista principal con cámara y overlay
  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No se otorgó permiso para usar la cámara</Text>;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} ratio="16:9">
        <View style={styles.overlay}>
          <View style={styles.mask}>
            {/* Mostrar patente y animación antes de redirigir */}
            {recognizedPlate && !showWebView && (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.plateText}>{recognizedPlate}</Text>
                {redirecting && (
                  <View style={styles.redirectContainer}>
                    <ActivityIndicator size="small" color="#00FFAA" style={{ marginRight: 8 }} />
                    <Text style={styles.redirectText}>Patente detectada, redirigiendo...</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          disabled={scanning}
        >
          {scanning ? (
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
  redirectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  redirectText: {
    color: "#00FFAA",
    fontSize: 14,
    fontWeight: "500",
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
