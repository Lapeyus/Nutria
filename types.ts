export interface FoodGroupPortions {
  harinas: number;
  vegetales: number;
  proteinas: number;
  frutas: number;
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
