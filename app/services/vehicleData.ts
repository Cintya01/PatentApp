import { VehicleInfo } from "../types/vehicle";

const VEHICLE_API_BASE = "https://www.gurapp.cl/vehicle/";

export async function getVehicleData(plate: string): Promise<VehicleInfo | null> {
    try {
        const res = await fetch(`${VEHICLE_API_BASE}${plate}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VehicleInfo;
        return data;
    } catch (err) {
        console.error("Error al obtener datos del vehículo:", err);
        return null;
    }
}
