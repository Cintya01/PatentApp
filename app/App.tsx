import React, { useState } from "react";
import { ScannerScreen } from "./screens/ScannerScreen";
import VehicleResultScreen from "./screens/VehicleResultScreen";
import { VehicleInfo } from "./types/vehicle";

export default function App() {
    const [vehicleData, setVehicleData] = useState<VehicleInfo | null>(null);
    const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);

    return vehicleData && recognizedPlate ? (
        <VehicleResultScreen
            plate={recognizedPlate}
            data={vehicleData}
            onBack={() => {
                setVehicleData(null);
                setRecognizedPlate(null);
            }}
        />
    ) : (
        <ScannerScreen
            onRecognized={(plate, data) => {
                setRecognizedPlate(plate);
                setVehicleData(data);
            }}
        />
    );
}
