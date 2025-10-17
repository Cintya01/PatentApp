import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { VehicleTable } from "../components/VehicleTable";
import { styles } from "../styles/screens/VehicleResultScreen.styles";
import { VehicleInfo } from "../types/vehicle";

interface Props {
    plate: string;
    data: VehicleInfo;
    onBack: () => void;
}

export const VehicleResultScreen: React.FC<Props> = ({ plate, data, onBack }) => (
    <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.title}>Patente detectada: {plate}</Text>
        <Text style={styles.subtitle}>Información del vehículo:</Text>

        <VehicleTable data={data} />

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.buttonText}>Volver a escanear</Text>
        </TouchableOpacity>
    </ScrollView>
);
