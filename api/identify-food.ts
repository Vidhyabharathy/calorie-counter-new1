import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { base64Image } = req.body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER }
        },
        required: ["name", "calories", "protein", "carbs", "fat"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text:
            "You are a nutrition expert. Identify foods in the image and return a JSON array."
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const data = JSON.parse(response.text.trim());
    return res.status(200).json(data);

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
