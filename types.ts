export interface UserProfile {
  fullName: string;
  goals: {
    frutas: number;
    leches: number;
    vegetales: number;
    harinas: number;
    proteinas: number;
    grasas: number;
    calorias: number;
  };
  exercisePlan: string;
  indications: string;
  liquidLiters: number;
  weight: {
    actual: number;
    meta: number;
  };
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  profile?: UserProfile;
}

export interface FoodSummary {
  harinas: number;
  vegetales: number;
  proteinas: number;
  frutas: number;
  leches: number;
  grasas: number;
  calorias: number;
}

export interface FoodGroupPortions {
  harinas: number;
  vegetales: number;
  proteinas: number;
  frutas: number;
  leches: number;
  grasas: number;
}

export interface FoodAnalysis {
  photoTimestamp?: string;
  foodName: string;
  portionSize: string;
  ingredients: string[];
  estimatedCalories: number;
  foodGroups: FoodGroupPortions;
}
