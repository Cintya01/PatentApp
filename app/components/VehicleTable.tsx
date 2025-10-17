import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
    data: Record<string, any>;
}

export const VehicleTable: React.FC<Props> = ({ data }) => {
    return (
        <View style={styles.container}>
            {Object.entries(data).map(([key, value]) => (
                <View key={key} style={styles.row}>
                    <Text style={styles.label}>{key}</Text>
                    <Text style={styles.value}>
                        {typeof value === "boolean"
                            ? value
                                ? "SI 🚨"
                                : "NO"
                            : String(value)}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#e5eafeff",
        borderRadius: 12,
        padding: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        color: "#1e4589ff",
        fontWeight: "600",
        fontSize: 16,
    },
    value: {
        color: "#000000ff",
        fontSize: 16,
        fontWeight: "500",
    },
});


