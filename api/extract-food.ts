import { ai } from "../lib/ai-client";
import { Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

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
          text: `You are a nutrition expert. Extract food items mentioned in this text and return ONLY a JSON array: "${text}"`,
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
    console.error("ExtractFood API Error:", error);
    return res.status(500).json({ error: "Failed to extract food.", details: error.message });
  }
}
