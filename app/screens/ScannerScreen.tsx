import { Camera, CameraView } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { getPlateFromImage } from "../services/plateRecognizer";
import { getVehicleData } from "../services/vehicleData";
import { styles } from "../styles/screens/ScannerScreen.styles";

interface Props {
    onRecognized: (plate: string, data: any) => void;
}

export const ScannerScreen: React.FC<Props> = ({ onRecognized }) => {
    const cameraRef = useRef<CameraView | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanning, setScanning] = useState(false);
    const [loadingVehicle, setLoadingVehicle] = useState(false);
    const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    const handleCapture = async () => {
        if (!cameraRef.current || scanning) return;
        setScanning(true);

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

            const manipulated = await ImageManipulator.manipulateAsync(
                photo.uri,
                [{ resize: { width: photo.width * 0.5 } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );

            const plateResult = await getPlateFromImage(manipulated.base64);
            console.log(plateResult)

            if (!plateResult) {
                Alert.alert("Sin resultado", "No se detectó ninguna patente.");
                return;
            }

            if (plateResult.region && plateResult.region.code !== "cl") {
                Alert.alert("Patente no válida", "La patente no es chilena o no pertenece a la región CL.");
                return;
            }

            const plate = plateResult.plate;
            setRecognizedPlate(plate);
            setLoadingVehicle(true);

            const vehicleInfo = await getVehicleData(plate);
            if (vehicleInfo) {
                onRecognized(plate, vehicleInfo);
            } else {
                Alert.alert("Sin datos", "No se encontró información del vehículo.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Ocurrió un error al procesar la imagen.");
        } finally {
            setScanning(false);
            setLoadingVehicle(false);
        }
    };

    if (hasPermission === null) return <View />;
    if (hasPermission === false) return <Text>No se otorgó permiso para usar la cámara</Text>;

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef} ratio="16:9">
                <View style={styles.overlay}>
                    <View style={styles.mask}>
                        {recognizedPlate && <Text style={styles.plateText}>{recognizedPlate}</Text>}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleCapture}
                    disabled={scanning || loadingVehicle}
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
};
