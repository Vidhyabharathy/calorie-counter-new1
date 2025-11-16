import { ai } from "../lib/ai-client";
import { Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Image } = req.body;

  const foodItemSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      calories: { type: Type.NUMBER },
      protein: { type: Type.NUMBER },
      carbs: { type: Type.NUMBER },
      fat: { type: Type.NUMBER },
    },
    required: ["name", "calories", "protein", "carbs", "fat"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text:
            "You are a nutrition expert. Analyze the food items in the image. Respond ONLY with a JSON array of food objects (name, calories, protein, carbs, fat).",
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: foodItemSchema,
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error) {
    console.error("IdentifyFood API Error:", error);
    return res.status(500).json({ error: "Failed to identify food.", details: error.message });
  }
}
