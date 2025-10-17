import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
    data: Record<string, any>;
}

export const VehicleTable: React.FC<Props> = ({ data }) => {
    return (
        <View style={styles.container}>
            {Object.entries(data).map(([key, value]) => (
                <View key={key} style={styles.row}>
                    <Text style={styles.key}>{key}</Text>
                    <Text style={styles.value}>
                        {typeof value === "boolean"
                            ? value
                                ? "Sí"
                                : "No"
                            : String(value)}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#222",
        padding: 16,
        borderRadius: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    key: {
        color: "#00FFAA",
        fontWeight: "600",
        width: "40%",
    },
    value: {
        color: "#fff",
        width: "55%",
        textAlign: "right",
    },
});
