import { Dimensions, StyleSheet } from "react-native";
import { colors } from "../colors";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
        borderColor: colors.primary,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    plateText: {
        color: colors.primary,
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 2,
    },
    captureButton: {
        alignSelf: "center",
        marginBottom: 40,
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
