import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { VehicleTable } from "../components/VehicleTable";
import { colors } from "../styles/colors";
import { styles } from "../styles/screens/VehicleResultScreen.styles";
import { VehicleInfo } from "../types/vehicle";

interface Props {
    plate: string;
    data: VehicleInfo;
    onBack: () => void;
}

export default function VehicleResultScreen({ plate, data, onBack }: Props) {
    const backgroundColor = data["Encargo por Robo"] ? colors.danger : colors.success;

    return (
        <ScrollView contentContainerStyle={[styles.resultContainer, { backgroundColor }]}>
            <Text style={styles.title}>Patente detectada: {plate}</Text>
            <Text style={styles.subtitle}>Información del vehículo:</Text>

            <VehicleTable data={data} />

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.buttonText}>Volver a escanear</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
