import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const styles = StyleSheet.create({
    resultContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: colors.card,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 10,
    },
    backButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
