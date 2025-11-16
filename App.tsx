import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  FoodLog,
  Recipe,
  ActivityLevel,
  Goal,
  DietaryPreference,
  MealCategory,
  StreakData,
  IdentifiedFood,
  // Fix: Import LogMethod type
  LogMethod,
} from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { recipes } from './data/recipes';
import * as GeminiService from './services/geminiService';
import CircularProgress from './components/CircularProgress';
import { CameraIcon, MicIcon, RecipeIcon, FireIcon, CloseIcon, HeartIcon, ArrowLeftIcon } from './components/Icons';

// --- UTILS ---
const calculateBMR = (profile: Omit<UserProfile, 'calorieGoal' | 'proteinGoal' | 'carbGoal' | 'fatGoal'>) => {
    const { gender, currentWeight, height, age } = profile;
    if (gender === 'male') {
        return 10 * currentWeight + 6.25 * height - 5 * age + 5;
    }
    return 10 * currentWeight + 6.25 * height - 5 * age - 161;
};

const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
};

const calculateDailyCalories = (profile: Omit<UserProfile, 'calorieGoal' | 'proteinGoal' | 'carbGoal' | 'fatGoal'>) => {
    const bmr = calculateBMR(profile);
    const tdee = bmr * activityFactors[profile.activityLevel];
    switch (profile.goal) {
        case 'lose_weight': return tdee - 500;
        case 'gain_muscle': return tdee + 300;
        case 'maintain_weight':
        default: return tdee;
    }
};

// --- HELPER COMPONENTS (defined outside main components) ---
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const OnboardingScreen: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: 30, gender: 'male' as 'male' | 'female', height: 175, currentWeight: 75, goalWeight: 70,
        activityLevel: 'lightly_active' as ActivityLevel, goal: 'lose_weight' as Goal, dietaryPreference: 'all' as DietaryPreference
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'age' || name === 'height' || name === 'currentWeight' || name === 'goalWeight') ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const calorieGoal = calculateDailyCalories(formData);
        const newProfile: UserProfile = {
            ...formData,
            calorieGoal,
            proteinGoal: (calorieGoal * 0.30) / 4,
            carbGoal: (calorieGoal * 0.40) / 4,
            fatGoal: (calorieGoal * 0.30) / 9,
        };
        onComplete(newProfile);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-emerald-400">Welcome to GeminiFit</h1>
                <p className="text-center text-gray-400 mb-8">Let's set up your profile to personalize your experience.</p>
                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-4">
                    {step === 1 && (
                        <>
                            <h2 className="text-xl font-semibold mb-4 text-center">Step 1: About You</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Current Weight (kg)</label>
                                <input type="number" name="currentWeight" value={formData.currentWeight} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1" />
                            </div>
                             <button type="button" onClick={() => setStep(2)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 transition">Next</button>
                        </>
                    )}
                    {step === 2 && (
                         <>
                            <h2 className="text-xl font-semibold mb-4 text-center">Step 2: Your Goals</h2>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Goal Weight (kg)</label>
                                <input type="number" name="goalWeight" value={formData.goalWeight} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Activity Level</label>
                                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1">
                                    <option value="sedentary">Sedentary</option>
                                    <option value="lightly_active">Lightly Active</option>
                                    <option value="moderately_active">Moderately Active</option>
                                    <option value="very_active">Very Active</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Primary Goal</label>
                                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1">
                                    <option value="lose_weight">Lose Weight</option>
                                    <option value="maintain_weight">Maintain Weight</option>
                                    <option value="gain_muscle">Gain Muscle</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Dietary Preference</label>
                                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full bg-gray-700 text-white rounded p-2 mt-1">
                                    <option value="all">All</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="low-carb">Low-Carb</option>
                                    <option value="high-protein">High-Protein</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                               <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition">Back</button>
                               <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition">Finish Setup</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

const PhotoLogger: React.FC<{
  onLog: (foods: IdentifiedFood[], photo: string) => void;
  onClose: () => void;
}> = ({ onLog, onClose }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [identifiedFoods, setIdentifiedFoods] = useState<IdentifiedFood[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImage(reader.result as string);
                analyzeImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const analyzeImage = async (base64: string) => {
        setIsLoading(true);
        setError(null);
        setIdentifiedFoods([]);
        try {
            const foods = await GeminiService.identifyFoodInImage(base64);
            setIdentifiedFoods(foods);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if(image) {
           onLog(identifiedFoods, image);
        }
    };

    return (
        <div className="text-center">
            {!image && (
                <>
                    <p className="mb-4 text-gray-300">Upload a photo of your meal or use your camera.</p>
                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                        <CameraIcon className="w-6 h-6" /> Open Camera / Upload
                    </button>
                </>
            )}
            {image && <img src={image} alt="Food" className="rounded-lg mb-4 max-h-60 mx-auto" />}
            {isLoading && <p>Analyzing your meal... 🧠</p>}
            {error && <p className="text-red-400">{error}</p>}
            {identifiedFoods.length > 0 && (
                <div className="space-y-2 text-left">
                    <h3 className="font-semibold text-lg mb-2">We found:</h3>
                    <ul className="divide-y divide-gray-700">
                        {identifiedFoods.map((food, index) => (
                            <li key={index} className="py-2">
                                <p className="font-bold">{food.name}</p>
                                <p className="text-sm text-gray-400">{Math.round(food.calories)} kcal &bull; {Math.round(food.protein)}g P &bull; {Math.round(food.carbs)}g C &bull; {Math.round(food.fat)}g F</p>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 pt-4">
                        <button onClick={() => {setImage(null); setIdentifiedFoods([]);}} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg">Try Again</button>
                        <button onClick={handleConfirm} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg">Log Food</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VoiceLogger: React.FC<{
  onLog: (foods: IdentifiedFood[]) => void;
  onClose: () => void;
}> = ({ onLog, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [identifiedFoods, setIdentifiedFoods] = useState<IdentifiedFood[]>([]);
    const recognitionRef = React.useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                analyzeText(text);
                setIsListening(false);
            };
            recognitionRef.current.onerror = (event: any) => {
                setError(`Speech recognition error: ${event.error}`);
                setIsListening(false);
            };
        } else {
            setError("Speech recognition not supported in this browser.");
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            setError(null);
            setIdentifiedFoods([]);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const analyzeText = async (text: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const foods = await GeminiService.extractFoodFromText(text);
            setIdentifiedFoods(foods);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze speech.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = () => {
        onLog(identifiedFoods);
    };

    return (
        <div className="text-center flex flex-col items-center">
            <p className="mb-4 text-gray-300">Tap the mic and say what you ate, like "I had a bowl of oatmeal and a banana".</p>
            <button onClick={toggleListening} className={`w-24 h-24 rounded-full flex items-center justify-center transition ${isListening ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}>
                <MicIcon className="w-12 h-12 text-white" />
            </button>
            <p className="mt-4 text-lg h-6">{isListening ? 'Listening...' : (transcript || ' ')}</p>

            {isLoading && <p className="mt-4">Analyzing... 🧠</p>}
            {error && <p className="text-red-400 mt-4">{error}</p>}

            {identifiedFoods.length > 0 && (
                <div className="w-full space-y-2 text-left mt-4">
                    <h3 className="font-semibold text-lg mb-2">We found:</h3>
                    <ul className="divide-y divide-gray-700">
                        {identifiedFoods.map((food, index) => (
                            <li key={index} className="py-2">
                                <p className="font-bold">{food.name}</p>
                                <p className="text-sm text-gray-400">{Math.round(food.calories)} kcal &bull; {Math.round(food.protein)}g P &bull; {Math.round(food.carbs)}g C &bull; {Math.round(food.fat)}g F</p>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 pt-4">
                        <button onClick={() => {setTranscript(''); setIdentifiedFoods([]);}} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg">Try Again</button>
                        <button onClick={handleConfirm} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg">Log Food</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
    <div onClick={onClick} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300">
        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-32 object-cover" />
        <div className="p-4">
            <h3 className="font-bold text-md truncate">{recipe.name}</h3>
            <p className="text-sm text-gray-400">{recipe.caloriesPerServing} cal | {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</p>
        </div>
    </div>
);

const RecipeDetailScreen: React.FC<{
  recipe: Recipe;
  onBack: () => void;
  onLog: (recipe: Recipe, servings: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
}> = ({ recipe, onBack, onLog, isFavorite, onToggleFavorite }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white pb-24">
            <div className="relative">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-60 object-cover" />
                <div className="absolute top-4 left-4">
                    <button onClick={onBack} className="bg-black bg-opacity-50 rounded-full p-2 text-white">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div className="absolute top-4 right-4">
                    <button onClick={() => onToggleFavorite(recipe.id)} className="bg-black bg-opacity-50 rounded-full p-2 text-white">
                        <HeartIcon className="w-6 h-6" fill={isFavorite ? '#ef4444' : 'none'} stroke={isFavorite ? '#ef4444' : 'currentColor'} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <h1 className="text-3xl font-bold">{recipe.name}</h1>
                <p className="text-gray-300">{recipe.description}</p>
                
                <div className="flex justify-around bg-gray-800 p-3 rounded-lg text-center">
                    <div>
                        <p className="text-sm text-gray-400">PREP</p>
                        <p className="font-semibold">{recipe.prepTimeMinutes}min</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">COOK</p>
                        <p className="font-semibold">{recipe.cookTimeMinutes}min</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">SERVINGS</p>
                        <p className="font-semibold">{recipe.servings}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Nutrition (per serving)</h2>
                    <div className="bg-gray-800 p-4 rounded-lg flex justify-around">
                       <div className="text-center"><p className="font-bold">{recipe.caloriesPerServing}</p><p className="text-xs text-gray-400">CAL</p></div>
                       <div className="text-center"><p className="font-bold">{recipe.proteinGrams}g</p><p className="text-xs text-gray-400">PRO</p></div>
                       <div className="text-center"><p className="font-bold">{recipe.carbsGrams}g</p><p className="text-xs text-gray-400">CAR</p></div>
                       <div className="text-center"><p className="font-bold">{recipe.fatGrams}g</p><p className="text-xs text-gray-400">FAT</p></div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                    <ul className="list-disc list-inside bg-gray-800 p-4 rounded-lg space-y-2">
                       {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                    <ol className="list-decimal list-inside bg-gray-800 p-4 rounded-lg space-y-3">
                       {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
                <button onClick={() => onLog(recipe, 1)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-lg text-lg">
                    Cook & Log 1 Serving
                </button>
            </div>
        </div>
    );
};

const RecipesScreen: React.FC<{
  userProfile: UserProfile;
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
}> = ({ userProfile, onSelectRecipe, onBack }) => {
    const [filter, setFilter] = useState<MealCategory | 'All' | 'Quick'>('All');
    const [ingredientInput, setIngredientInput] = useState('');
    const [aiGeneratedRecipes, setAiGeneratedRecipes] = useState<Recipe[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateRecipe = async () => {
        if (!ingredientInput.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const recipeData = await GeminiService.generateRecipeFromIngredients(ingredientInput);
            const newRecipe: Recipe = {
                ...recipeData,
                id: `ai-${Date.now()}`,
                imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`
            };
            setAiGeneratedRecipes(prev => [newRecipe, ...prev]);
        } catch (err: any) {
            setError(err.message || "Failed to generate recipe.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredRecipes = useMemo(() => {
        let tempRecipes = [...recipes];
        if (userProfile.dietaryPreference !== 'all') {
            tempRecipes = tempRecipes.filter(r => r.dietaryTags.includes(userProfile.dietaryPreference));
        }
        if (filter === 'Quick') {
            return tempRecipes.filter(r => (r.cookTimeMinutes + r.prepTimeMinutes) <= 30);
        }
        if (filter !== 'All') {
            return tempRecipes.filter(r => r.mealTypes.includes(filter));
        }
        return tempRecipes;
    }, [filter, userProfile.dietaryPreference]);

    const filters: (MealCategory | 'All' | 'Quick')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Quick'];

    return (
        <div className="p-4 pb-20">
            <button onClick={onBack} className="mb-4 flex items-center gap-2 text-emerald-400">
                <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-2">Recipes</h1>
            <p className="text-gray-400 mb-6">Discover meals or generate a new one from your ingredients.</p>
            
            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Generate Recipe from Ingredients</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                        type="text" 
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        placeholder="e.g., paneer, spinach, tomatoes" 
                        className="flex-grow bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleGenerateRecipe} 
                        disabled={isGenerating}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-emerald-700 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Find Recipe'}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>

            {isGenerating && (
                <div className="text-center my-8">
                    <p>🤖 Thinking of something delicious...</p>
                </div>
            )}
            
            {aiGeneratedRecipes.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">AI Suggestions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {aiGeneratedRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4">Browse Our Recipes</h2>
            <div className="flex space-x-2 overflow-x-auto pb-4 mb-4">
                {filters.map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${filter === f ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
                ))}
            </div>
            {filteredRecipes.length === 0 && <p className="text-center text-gray-400 col-span-2 mt-8">No recipes found. Try different filters.</p>}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
type View = 'DASHBOARD' | 'RECIPES' | 'RECIPE_DETAIL';
type ModalView = 'NONE' | 'PHOTO' | 'VOICE';

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [foodLogs, setFoodLogs] = useLocalStorage<FoodLog[]>('foodLogs', []);
  const [streakData, setStreakData] = useLocalStorage<StreakData>('streakData', { currentStreak: 0, lastLogDate: null });
  const [favoriteRecipes, setFavoriteRecipes] = useLocalStorage<string[]>('favoriteRecipes', []);
  
  const [view, setView] = useState<View>('DASHBOARD');
  const [modalView, setModalView] = useState<ModalView>('NONE');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (streakData.lastLogDate !== today) {
        if(streakData.lastLogDate !== yesterday) {
            setStreakData(prev => ({ ...prev, currentStreak: 0 }));
        }
    }
  }, [streakData.lastLogDate, setStreakData]);
  
  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return foodLogs.filter(log => log.timestamp.startsWith(today));
  }, [foodLogs]);
  
  const totalsToday = useMemo(() => {
    return todayLogs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todayLogs]);

  const addFoodLog = useCallback((foods: IdentifiedFood[], logMethod: LogMethod, photo?: string) => {
      const now = new Date();
      const hour = now.getHours();
      let mealCategory: MealCategory;
      if (hour < 11) mealCategory = 'Breakfast';
      else if (hour < 16) mealCategory = 'Lunch';
      else if (hour < 21) mealCategory = 'Dinner';
      else mealCategory = 'Snacks';
      
      const newLogs: FoodLog[] = foods.map(food => ({
          id: `${Date.now()}-${food.name}`,
          timestamp: now.toISOString(),
          mealCategory,
          logMethod,
          photo,
          ...food
      }));
      
      setFoodLogs(prev => [...prev, ...newLogs]);
      
      const today = new Date().toISOString().split('T')[0];
      if (streakData.lastLogDate !== today) {
        setStreakData(prev => ({
            lastLogDate: today,
            currentStreak: prev.lastLogDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? prev.currentStreak + 1 : 1
        }));
      }

      setModalView('NONE');
  }, [setFoodLogs, streakData, setStreakData]);

  const handleLogRecipe = (recipe: Recipe, servings: number) => {
    const now = new Date();
    const hour = now.getHours();
    let mealCategory: MealCategory;
    if (hour < 11) mealCategory = 'Breakfast';
    else if (hour < 16) mealCategory = 'Lunch';
    else if (hour < 21) mealCategory = 'Dinner';
    else mealCategory = 'Snacks';
    
    const newLog: FoodLog = {
      id: `${Date.now()}-${recipe.id}`,
      timestamp: now.toISOString(),
      mealCategory,
      name: `${recipe.name} (${servings} serving${servings > 1 ? 's' : ''})`,
      calories: recipe.caloriesPerServing * servings,
      protein: recipe.proteinGrams * servings,
      carbs: recipe.carbsGrams * servings,
      fat: recipe.fatGrams * servings,
      photo: recipe.imageUrl,
      logMethod: 'recipe',
      recipeId: recipe.id,
    };
    
    setFoodLogs(prev => [...prev, newLog]);
    setView('DASHBOARD');
  };

  const handleToggleFavorite = (recipeId: string) => {
    setFavoriteRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId) 
        : [...prev, recipeId]
    );
  };

  if (!profile) {
    return <OnboardingScreen onComplete={setProfile} />;
  }
  
  const remainingCalories = profile.calorieGoal - totalsToday.calories;
  
  const getGreeting = () => {
      const hour = new Date().getHours();
      if(hour < 12) return 'Good Morning';
      if(hour < 18) return 'Good Afternoon';
      return 'Good Evening';
  };

  const suggestedRecipes = recipes
    .filter(r => r.caloriesPerServing < remainingCalories && (profile.dietaryPreference === 'all' || r.dietaryTags.includes(profile.dietaryPreference)))
    .slice(0, 3);
  
  const groupedLogs = todayLogs.reduce((acc, log) => {
    if (!acc[log.mealCategory]) acc[log.mealCategory] = [];
    acc[log.mealCategory].push(log);
    return acc;
  }, {} as Record<MealCategory, FoodLog[]>);


  const renderContent = () => {
    switch(view) {
      case 'DASHBOARD':
        return (
          <div className="p-4 pb-28">
            <header className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-400">{getGreeting()}!</p>
                <h1 className="text-2xl font-bold">Today's Summary</h1>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <span className="font-bold">{streakData.currentStreak} day streak</span>
              </div>
            </header>
            
            <div className="text-center my-8">
              <p className="text-emerald-400 text-lg">Remaining</p>
              <p className="text-6xl font-bold">{Math.round(remainingCalories)}</p>
              <p className="text-gray-400">of {Math.round(profile.calorieGoal)} kcal</p>
            </div>
            
            <div className="flex justify-around mb-8">
              <CircularProgress label="Protein" value={`${Math.round(totalsToday.protein)}g`} percentage={(totalsToday.protein / profile.proteinGoal) * 100} color="text-red-400" />
              <CircularProgress label="Carbs" value={`${Math.round(totalsToday.carbs)}g`} percentage={(totalsToday.carbs / profile.carbGoal) * 100} color="text-blue-400" />
              <CircularProgress label="Fat" value={`${Math.round(totalsToday.fat)}g`} percentage={(totalsToday.fat / profile.fatGoal) * 100} color="text-yellow-400" />
            </div>

            {suggestedRecipes.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Recipe Suggestions</h2>
                    <div className="space-y-3">
                        {suggestedRecipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => { setSelectedRecipe(r); setView('RECIPE_DETAIL'); }}/>)}
                    </div>
                </div>
            )}
            
            <div>
              <h2 className="text-xl font-bold mb-4">Today's Log</h2>
              {todayLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No food logged yet. Tap a button below to start!</p>
              ) : (
                <div className="space-y-4">
                  {(Object.keys(groupedLogs) as MealCategory[]).map(category => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-2">{category}</h3>
                      <div className="space-y-3">
                        {groupedLogs[category].map(log => (
                          <div key={log.id} className="bg-gray-800 p-3 rounded-lg flex items-center gap-4">
                            <img src={log.photo || 'https://picsum.photos/id/366/100/100'} alt={log.name} className="w-16 h-16 object-cover rounded-md" />
                            <div className="flex-1">
                              <p className="font-semibold">{log.name}</p>
                              <p className="text-sm text-gray-400">{Math.round(log.calories)} kcal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 flex justify-around items-center">
              <button onClick={() => setModalView('PHOTO')} className="flex flex-col items-center text-emerald-400 gap-1">
                <div className="bg-emerald-500/20 p-3 rounded-full"><CameraIcon className="w-7 h-7" /></div>
                <span className="text-xs">Photo</span>
              </button>
              <button onClick={() => setModalView('VOICE')} className="flex flex-col items-center text-emerald-400 gap-1">
                 <div className="bg-emerald-500/20 p-3 rounded-full"><MicIcon className="w-7 h-7" /></div>
                <span className="text-xs">Voice</span>
              </button>
              <button onClick={() => setView('RECIPES')} className="flex flex-col items-center text-emerald-400 gap-1">
                 <div className="bg-emerald-500/20 p-3 rounded-full"><RecipeIcon className="w-7 h-7" /></div>
                 <span className="text-xs">Recipes</span>
              </button>
            </div>
          </div>
        );
      case 'RECIPES':
        return <RecipesScreen userProfile={profile} onSelectRecipe={(r) => { setSelectedRecipe(r); setView('RECIPE_DETAIL'); }} onBack={() => setView('DASHBOARD')} />;
      case 'RECIPE_DETAIL':
        if (selectedRecipe) {
          return <RecipeDetailScreen recipe={selectedRecipe} onBack={() => setView('RECIPES')} onLog={handleLogRecipe} isFavorite={favoriteRecipes.includes(selectedRecipe.id)} onToggleFavorite={handleToggleFavorite} />;
        }
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-900 min-h-screen text-white">
      {renderContent()}
      
      <Modal isOpen={modalView === 'PHOTO'} onClose={() => setModalView('NONE')} title="Log with Photo">
        <PhotoLogger onLog={(foods, photo) => addFoodLog(foods, 'photo', photo)} onClose={() => setModalView('NONE')} />
      </Modal>

      <Modal isOpen={modalView === 'VOICE'} onClose={() => setModalView('NONE')} title="Log with Voice">
        <VoiceLogger onLog={(foods) => addFoodLog(foods, 'voice')} onClose={() => setModalView('NONE')} />
      </Modal>
    </div>
  );
}
