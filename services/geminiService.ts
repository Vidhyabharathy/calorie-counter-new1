import { GoogleGenAI, Type } from "@google/genai";
import { IdentifiedFood, Recipe } from "../types";

// Fix: Per Gemini API guidelines, initialize the client directly with process.env.API_KEY.
// The API key's presence is assumed to be handled by the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const foodItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Name of the food item.' },
        calories: { type: Type.NUMBER, description: 'Estimated calories for a single serving.' },
        protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
        carbs: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams.' },
        fat: { type: Type.NUMBER, description: 'Estimated fat in grams.' },
    },
    required: ['name', 'calories', 'protein', 'carbs', 'fat'],
};


export const identifyFoodInImage = async (base64Image: string): Promise<IdentifiedFood[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        text: "You are a nutrition expert. Analyze the food items in this image. Respond with a JSON array of objects, where each object represents one food item. Each object should have 'name', 'calories', 'protein', 'carbs', and 'fat' properties for a single serving. Be as accurate as possible. If you cannot identify an item, omit it from the array. Only return the JSON array."
                    },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image,
                        },
                    },
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: foodItemSchema,
                },
            }
        });

        const text = response.text.trim();
        return JSON.parse(text) as IdentifiedFood[];

    } catch (error) {
        console.error("Error identifying food in image:", error);
        throw new Error("Could not identify food from the image. Please try again.");
    }
};


export const extractFoodFromText = async (text: string): Promise<IdentifiedFood[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a nutrition expert. Extract all food items from the following text: "${text}". Respond with a JSON array of objects. Each object should have 'name', 'calories', 'protein', 'carbs', and 'fat' properties for a single serving. Be as accurate as possible. Only return the JSON array.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: foodItemSchema,
                },
            }
        });
        
        const responseText = response.text.trim();
        return JSON.parse(responseText) as IdentifiedFood[];
    } catch (error) {
        console.error("Error extracting food from text:", error);
        throw new Error("Could not extract food from your description. Please try again.");
    }
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        prepTimeMinutes: { type: Type.NUMBER },
        cookTimeMinutes: { type: Type.NUMBER },
        servings: { type: Type.NUMBER },
        difficulty: { type: Type.STRING, description: "Can be 'Easy', 'Medium', or 'Hard'." },
        caloriesPerServing: { type: Type.NUMBER },
        proteinGrams: { type: Type.NUMBER },
        carbsGrams: { type: Type.NUMBER },
        fatGrams: { type: Type.NUMBER },
        dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        mealTypes: { type: Type.ARRAY, items: { type: Type.STRING, description: "Can include 'Breakfast', 'Lunch', 'Dinner', 'Snacks'." } },
    },
    required: [
        'name', 'description', 'prepTimeMinutes', 'cookTimeMinutes', 'servings',
        'difficulty', 'caloriesPerServing', 'proteinGrams', 'carbsGrams', 'fatGrams',
        'dietaryTags', 'ingredients', 'instructions', 'mealTypes'
    ],
};

export const generateRecipeFromIngredients = async (ingredients: string): Promise<Omit<Recipe, 'id' | 'imageUrl'>> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a creative chef and nutritionist. Based on the following ingredients: "${ingredients}", create a single healthy and delicious recipe. Provide a short description, prep time, cook time, difficulty, a full nutritional breakdown per serving, a list of all required ingredients with quantities, and step-by-step instructions. Also include relevant dietary tags (like 'vegetarian', 'gluten-free') and meal types ('Breakfast', 'Lunch', 'Dinner'). Your response must be a single JSON object that conforms to the specified schema.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: recipeSchema,
            }
        });
        
        const responseText = response.text.trim();
        return JSON.parse(responseText) as Omit<Recipe, 'id' | 'imageUrl'>;
    } catch (error) {
        console.error("Error generating recipe from ingredients:", error);
        throw new Error("Could not generate a recipe. Please try different ingredients.");
    }
};
