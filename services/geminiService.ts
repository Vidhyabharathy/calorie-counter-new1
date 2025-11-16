export async function identifyFoodInImage(base64Image: string) {
    const response = await fetch("/api/identify-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image }),
    });
  
    if (!response.ok) throw new Error("Failed to identify food");
    return response.json();
  }
  
  export async function extractFoodFromText(text: string) {
    const response = await fetch("/api/extract-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  
    if (!response.ok) throw new Error("Failed to extract food");
    return response.json();
  }
  
  export async function generateRecipeFromIngredients(ingredients: string) {
    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
  
    if (!response.ok) throw new Error("Failed to generate recipe");
    return response.json();
  }
  