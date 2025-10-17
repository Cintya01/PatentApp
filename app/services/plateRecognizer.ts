const PLATE_API_TOKEN = "d730676f0615226fbe06ce41ac0ae04f7f6f26cd";

export async function getPlateFromImage(base64Image?: string): Promise<string | null> {
    if (!base64Image) return null;

    try {
        const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
            method: "POST",
            headers: {
                Authorization: `Token ${PLATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ upload: `data:image/jpeg;base64,${base64Image}` }),
        });

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].plate.toUpperCase();
        }
        return null;
    } catch (err) {
        console.error("Error al reconocer patente:", err);
        return null;
    }
}
