
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain_weight' | 'gain_muscle';
export type DietaryPreference = 'all' | 'vegetarian' | 'vegan' | 'low-carb' | 'high-protein';
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
export type LogMethod = 'photo' | 'voice' | 'manual' | 'recipe';

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  currentWeight: number; // in kg
  goalWeight: number; // in kg
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryPreference: DietaryPreference;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface FoodLog {
  id: string;
  timestamp: string;
  mealCategory: MealCategory;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo?: string; // base64 string
  logMethod: LogMethod;
  recipeId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  dietaryTags: DietaryPreference[];
  ingredients: string[];
  instructions: string[];
  mealTypes: MealCategory[];
}

export interface StreakData {
    currentStreak: number;
    lastLogDate: string | null;
}

export interface IdentifiedFood {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}
