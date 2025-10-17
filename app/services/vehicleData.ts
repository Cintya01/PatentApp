import { VehicleInfo } from "../types/vehicle";

const VEHICLE_API_BASE = "https://www.gurapp.cl/vehicle/";

function mapVehicleApiResponse(apiData: any): VehicleInfo {
    return {
        patente: apiData.plate,
        dv: apiData.dv,
        tipo: apiData.type,
        marca: apiData.make,
        modelo: apiData.model,
        año: apiData.year,
        color: apiData.color,
        motor: apiData.motor,
        chasis: apiData.chasis,
        procedencia: apiData.procedencia,
        fabricante: apiData.fabricante,
        enRobo: apiData.robo,
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
        console.error("Error al obtener datos del vehículo:", err);
        return null;
    }
}
