import { VehicleInfo } from "../types/vehicle";

const VEHICLE_API_BASE = "https://www.gurapp.cl/vehicle/";

function mapVehicleApiResponse(apiData: any): VehicleInfo {
    return {
        Patente: apiData.plate,
        DV: apiData.dv,
        Tipo: apiData.type,
        Marca: apiData.make,
        Modelo: apiData.model,
        Año: apiData.year,
        Color: apiData.color,
        Motor: apiData.motor,
        Chasis: apiData.chasis,
        Procedencia: apiData.procedencia,
        Fabricante: apiData.fabricante,
        "Encargo por Robo": apiData.robo,
    };
}

export async function getVehicleData(patente: string): Promise<VehicleInfo | null> {
    try {
        const res = await fetch(`${VEHICLE_API_BASE}${patente}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const vehicle = mapVehicleApiResponse(data);

        return vehicle;
    } catch (err) {
        console.error("Error al reconocer patente:", err);
        return null;
    }
}
