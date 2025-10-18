const PLATE_API_TOKEN = "d730676f0615226fbe06ce41ac0ae04f7f6f26cd";

export async function getPlateFromImage(base64Image?: string): Promise<{ plate: string; region: { code: string }, score: number, dscore: number } | null> {
    if (!base64Image) return null;

    try {
        const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
            method: "POST",
            headers: {
                Authorization: `Token ${PLATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ upload: `data:image/jpeg;base64,${base64Image}`, regions: ["cl"] }),
        });

      const data = await response.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                plate: result.plate.toUpperCase(),
                region: result.region, //region de la placa,
                score: result.score, //confiabilidad de que la placa es correcta,
                dscore: result.dscore //confiabilidad de que hay una placa en la imagen,
            };
        }
        return null;
    } catch (err) {
        console.error("Error al reconocer patente:", err);
        return null;
    }
}
