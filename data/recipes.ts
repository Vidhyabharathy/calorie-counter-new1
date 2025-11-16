
import { Recipe } from '../types';

export const recipes: Recipe[] = [
  {
    id: "recipe_001",
    name: "Grilled Chicken Salad",
    description: "A healthy and protein-packed lunch, perfect for a light yet satisfying meal.",
    imageUrl: "https://picsum.photos/id/1060/400/300",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: "Easy",
    caloriesPerServing: 350,
    proteinGrams: 35,
    carbsGrams: 20,
    fatGrams: 15,
    dietaryTags: ["high-protein", "low-carb"],
    ingredients: [
      "200g chicken breast", "2 cups mixed greens", "1 tomato, diced", "1/4 cup olive oil", "Salt and pepper to taste"
    ],
    instructions: [
      "Season chicken breast with salt and pepper.", "Heat grill or pan to medium-high heat.", "Cook chicken for 6-7 minutes per side until done.", "Let chicken rest for 5 minutes, then slice.", "Mix greens and tomato in a bowl.", "Top with sliced chicken and drizzle with olive oil.", "Serve immediately."
    ],
    mealTypes: ['Lunch', 'Dinner']
  },
  {
    id: "recipe_002",
    name: "Overnight Oats",
    description: "A simple, delicious, and convenient breakfast that you can prepare the night before.",
    imageUrl: "https://picsum.photos/id/292/400/300",
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "Easy",
    caloriesPerServing: 350,
    proteinGrams: 15,
    carbsGrams: 50,
    fatGrams: 10,
    dietaryTags: ["vegetarian"],
    ingredients: [
      "1/2 cup rolled oats", "1/2 cup almond milk", "1 tbsp chia seeds", "1 tbsp maple syrup", "1/4 cup mixed berries"
    ],
    instructions: [
      "In a jar, combine oats, almond milk, chia seeds, and maple syrup.", "Stir well until combined.", "Cover and refrigerate for at least 4 hours, or overnight.", "Before serving, top with mixed berries."
    ],
    mealTypes: ['Breakfast']
  },
  {
    id: "recipe_003",
    name: "Baked Salmon with Asparagus",
    description: "An elegant and healthy dinner that's surprisingly easy to make.",
    imageUrl: "https://picsum.photos/id/326/400/300",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    difficulty: "Easy",
    caloriesPerServing: 520,
    proteinGrams: 40,
    carbsGrams: 10,
    fatGrams: 35,
    dietaryTags: ["high-protein", "low-carb"],
    ingredients: [
      "2 salmon fillets", "1 bunch asparagus, trimmed", "2 tbsp olive oil", "1 lemon, sliced", "Salt and pepper"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).", "Place salmon and asparagus on a baking sheet.", "Drizzle with olive oil and season with salt and pepper.", "Place lemon slices on top of the salmon.", "Bake for 15-20 minutes, or until salmon is cooked through.", "Serve hot."
    ],
    mealTypes: ['Dinner']
  },
  {
    id: "recipe_004",
    name: "Quinoa Buddha Bowl",
    description: "A vibrant, customizable bowl packed with nutrients and flavor.",
    imageUrl: "https://picsum.photos/id/431/400/300",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2,
    difficulty: "Medium",
    caloriesPerServing: 480,
    proteinGrams: 18,
    carbsGrams: 60,
    fatGrams: 20,
    dietaryTags: ["vegetarian", "vegan"],
    ingredients: [
      "1 cup quinoa, cooked", "1 can chickpeas, rinsed", "1 avocado, sliced", "1 cup cherry tomatoes, halved", "1 cucumber, diced", "Tahini dressing"
    ],
    instructions: [
      "Divide the cooked quinoa between two bowls.", "Arrange chickpeas, avocado, tomatoes, and cucumber on top of the quinoa.", "Drizzle with tahini dressing before serving."
    ],
    mealTypes: ['Lunch', 'Dinner']
  },
  {
    id: "recipe_005",
    name: "Protein Smoothie",
    description: "A quick and easy way to get a protein boost, perfect for a post-workout snack or breakfast.",
    imageUrl: "https://picsum.photos/id/1080/400/300",
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "Easy",
    caloriesPerServing: 320,
    proteinGrams: 30,
    carbsGrams: 35,
    fatGrams: 8,
    dietaryTags: ["high-protein"],
    ingredients: [
      "1 scoop protein powder", "1 banana", "1 cup almond milk", "1 tbsp peanut butter", "Handful of spinach"
    ],
    instructions: [
      "Combine all ingredients in a blender.", "Blend until smooth.", "Pour into a glass and enjoy immediately."
    ],
    mealTypes: ['Breakfast', 'Snacks']
  },
  {
    id: "recipe_006",
    name: "Veggie Stir-fry",
    description: "A quick, flavorful, and healthy weeknight dinner loaded with fresh vegetables.",
    imageUrl: "https://picsum.photos/id/1015/400/300",
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: "Easy",
    caloriesPerServing: 400,
    proteinGrams: 15,
    carbsGrams: 45,
    fatGrams: 18,
    dietaryTags: ["vegetarian", "vegan"],
    ingredients: [
      "1 block tofu, cubed", "1 broccoli head, chopped", "1 bell pepper, sliced", "1 carrot, julienned", "2 tbsp soy sauce", "1 tbsp sesame oil", "Cooked rice for serving"
    ],
    instructions: [
      "Heat sesame oil in a large skillet or wok over medium-high heat.", "Add tofu and cook until golden brown.", "Add broccoli, bell pepper, and carrot. Stir-fry for 5-7 minutes until tender-crisp.", "Stir in soy sauce and cook for another minute.", "Serve over cooked rice."
    ],
    mealTypes: ['Lunch', 'Dinner']
  },
  {
    id: "recipe_007",
    name: "Avocado Toast",
    description: "A simple and trendy breakfast that's both delicious and nutritious.",
    imageUrl: "https://picsum.photos/id/312/400/300",
    prepTimeMinutes: 5,
    cookTimeMinutes: 2,
    servings: 1,
    difficulty: "Easy",
    caloriesPerServing: 400,
    proteinGrams: 12,
    carbsGrams: 30,
    fatGrams: 25,
    dietaryTags: ["vegetarian"],
    ingredients: [
      "2 slices of whole-wheat bread", "1 large avocado", "1 tbsp lemon juice", "Red pepper flakes, salt, and pepper to taste"
    ],
    instructions: [
      "Toast the bread slices to your desired crispness.", "In a small bowl, mash the avocado with lemon juice, salt, and pepper.", "Spread the mashed avocado evenly on the toast.", "Sprinkle with red pepper flakes."
    ],
    mealTypes: ['Breakfast', 'Snacks']
  }
];
