import { ai } from "../lib/ai-client";
import { Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ingredients } = req.body;

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
      dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      mealTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: [
      "name",
      "description",
      "prepTimeMinutes",
      "cookTimeMinutes",
      "servings",
      "difficulty",
      "caloriesPerServing",
      "proteinGrams",
      "carbsGrams",
      "fatGrams",
      "dietaryTags",
      "ingredients",
      "instructions",
      "mealTypes",
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `You are a chef & nutritionist. Create ONE recipe using: "${ingredients}". Return ONLY a JSON object.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error) {
    console.error("GenerateRecipe API Error:", error);
    return res.status(500).json({ error: "Failed to generate recipe.", details: error.message });
  }
}
