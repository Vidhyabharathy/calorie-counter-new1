import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { ingredients } = req.body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const recipeSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        prepTimeMinutes: { type: Type.NUMBER },
        cookTimeMinutes: { type: Type.NUMBER },
        servings: { type: Type.NUMBER },
        difficulty: { type: Type.STRING },
        caloriesPerServing: { type: Type.NUMBER },
        proteinGrams: { type: Type.NUMBER },
        carbsGrams: { type: Type.NUMBER },
        fatGrams: { type: Type.NUMBER },
        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING }},
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }},
        instructions: { type: Type.ARRAY, items: { type: Type.STRING }},
        mealTypes: { type: Type.ARRAY, items: { type: Type.STRING }},
      },
      required: [
        "name", "description", "prepTimeMinutes", "cookTimeMinutes", "servings",
        "difficulty", "caloriesPerServing", "proteinGrams", "carbsGrams", "fatGrams",
        "dietaryTags", "ingredients", "instructions", "mealTypes"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a healthy recipe using these ingredients: "${ingredients}". Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const data = JSON.parse(response.text.trim());
    return res.status(200).json(data);

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
