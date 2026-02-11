import React, { useEffect, useMemo, useState } from 'react';
import { AnalysisAdjustments, FoodAnalysis, FoodGroupPortions } from '../types';
import { FireIcon, DocumentPlusIcon, ArrowPathIcon, CheckCircleIcon, BreadIcon, PlantIcon, FishIcon, AppleIcon, DropletIcon } from './icons/Icons';

interface AnalysisResultProps {
  analysis: FoodAnalysis;
  onReestimate: (adjustments: AnalysisAdjustments) => void;
  isReestimating: boolean;
  reestimateError: string | null;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

const foodGroupConfig: Record<keyof FoodGroupPortions, { label: string; Icon: React.FC<{ className?: string }>; color: string }> = {
  harinas: { label: 'Harinas', Icon: BreadIcon, color: 'text-amber-600 dark:text-amber-400' },
  vegetales: { label: 'Vegetales', Icon: PlantIcon, color: 'text-green-600 dark:text-green-400' },
  proteinas: { label: 'Proteínas', Icon: FishIcon, color: 'text-red-600 dark:text-red-400' },
  frutas: { label: 'Frutas', Icon: AppleIcon, color: 'text-pink-600 dark:text-pink-400' },
  leches: { label: 'Leches', Icon: DropletIcon, color: 'text-cyan-600 dark:text-cyan-400' },
  grasas: { label: 'Grasas', Icon: DropletIcon, color: 'text-yellow-600 dark:text-yellow-400' }
};

const foodGroupKeys = Object.keys(foodGroupConfig) as Array<keyof FoodGroupPortions>;

const normalizeIngredients = (ingredients: string[]): string[] => {
  return ingredients.map((ingredient) => ingredient.trim()).filter((ingredient) => ingredient.length > 0);
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysis,
  onReestimate,
  isReestimating,
  reestimateError,
  onSave,
  isSaving,
  saveSuccess,
  saveError,
}) => {
  const [foodNameInput, setFoodNameInput] = useState('');
  const [portionSizeInput, setPortionSizeInput] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [foodGroupsInput, setFoodGroupsInput] = useState<FoodGroupPortions>({
    harinas: 0,
    vegetales: 0,
    proteinas: 0,
    frutas: 0,
    leches: 0,
    grasas: 0,
  });

  useEffect(() => {
    setFoodNameInput(analysis.foodName);
    setPortionSizeInput(analysis.portionSize);
    setIngredientsInput(analysis.ingredients.join(', '));
    setFoodGroupsInput({
      harinas: analysis.foodGroups.harinas ?? 0,
      vegetales: analysis.foodGroups.vegetales ?? 0,
      proteinas: analysis.foodGroups.proteinas ?? 0,
      frutas: analysis.foodGroups.frutas ?? 0,
      leches: analysis.foodGroups.leches ?? 0,
      grasas: analysis.foodGroups.grasas ?? 0,
    });
  }, [analysis]);

  const parsedIngredients = useMemo(() => {
    return normalizeIngredients(
      ingredientsInput
        .split(/[\n,]/)
        .map((ingredient) => ingredient.trim())
    );
  }, [ingredientsInput]);

  const hasDraftChanges = useMemo(() => {
    const baseIngredients = normalizeIngredients(analysis.ingredients);
    const ingredientsChanged =
      parsedIngredients.length !== baseIngredients.length ||
      parsedIngredients.some((ingredient, index) => ingredient !== baseIngredients[index]);

    const groupsChanged = foodGroupKeys.some((key) => (analysis.foodGroups[key] ?? 0) !== (foodGroupsInput[key] ?? 0));

    return (
      foodNameInput.trim() !== analysis.foodName ||
      portionSizeInput.trim() !== analysis.portionSize ||
      ingredientsChanged ||
      groupsChanged
    );
  }, [analysis, foodGroupsInput, foodNameInput, parsedIngredients, portionSizeInput]);

  const renderPortion = (count: number) => {
    if (count === 1) return '1 porción';
    if (Number.isInteger(count)) return `${count} porciones`;
    return `${count.toFixed(1)} porciones`;
  };

  const displayedFoodGroups = foodGroupKeys.filter((key) => (analysis.foodGroups[key] ?? 0) > 0);
  const displayedGroupExplanations = foodGroupKeys.filter((key) => {
    const explanation = analysis.estimateExplanations.foodGroups[key];
    return explanation && explanation.trim().length > 0;
  });

  const handleFoodGroupChange = (key: keyof FoodGroupPortions, value: string) => {
    const parsed = Number(value);
    const nextValue = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    setFoodGroupsInput((previous) => ({ ...previous, [key]: nextValue }));
  };

  const handleReestimateClick = () => {
    const adjustments: AnalysisAdjustments = {
      foodName: foodNameInput.trim() || analysis.foodName,
      portionSize: portionSizeInput.trim() || analysis.portionSize,
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : analysis.ingredients,
      foodGroups: foodGroupsInput,
    };

    onReestimate(adjustments);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="p-5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{analysis.foodName}</h3>
        <p className="text-md text-slate-600 dark:text-slate-300">{analysis.portionSize}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Distribución de Porciones
          </h4>
          {displayedFoodGroups.length > 0 ? (
            <div className="space-y-3">
              {displayedFoodGroups.map((key) => {
                const config = foodGroupConfig[key];
                const count = analysis.foodGroups[key] ?? 0;
                return (
                  <div key={key} className="flex items-center">
                    <config.Icon className={`w-6 h-6 mr-3 ${config.color}`} />
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex-1">{config.label}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{renderPortion(count)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No se identificaron grupos de alimentos específicos.</p>
          )}
        </div>

        <div className="p-5 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-center">
          <FireIcon className="w-10 h-10 text-orange-500 mb-2" />
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Calorías Estimadas
          </h4>
          <p className="text-4xl font-extrabold text-brand dark:text-brand-light tracking-tight">
            {analysis.estimatedCalories}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">kcal</p>
        </div>
      </div>

      <div className="p-5 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Ajustar y Reestimar</h4>

        <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 p-3 space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Explicaciones de estimación IA</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium">Porción:</span> {analysis.estimateExplanations.portionSize}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium">Calorías:</span> {analysis.estimateExplanations.estimatedCalories}
          </p>
          {displayedGroupExplanations.length > 0 && (
            <div className="space-y-1">
              {displayedGroupExplanations.map((key) => (
                <p key={key} className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{foodGroupConfig[key].label}:</span> {analysis.estimateExplanations.foodGroups[key]}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="edit-food-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del plato</label>
          <input
            id="edit-food-name"
            type="text"
            value={foodNameInput}
            onChange={(event) => setFoodNameInput(event.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="edit-portion-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tamaño de porción</label>
          <input
            id="edit-portion-size"
            type="text"
            value={portionSizeInput}
            onChange={(event) => setPortionSizeInput(event.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            placeholder="Ej: 1/2 taza"
          />
        </div>

        <div>
          <label htmlFor="edit-ingredients" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ingredientes (separados por coma o salto de línea)</label>
          <textarea
            id="edit-ingredients"
            value={ingredientsInput}
            onChange={(event) => setIngredientsInput(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Porciones por grupo alimenticio</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {foodGroupKeys.map((key) => (
              <div key={key}>
                <label htmlFor={`group-${key}`} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">{foodGroupConfig[key].label}</label>
                <input
                  id={`group-${key}`}
                  type="number"
                  min={0}
                  step={0.5}
                  value={foodGroupsInput[key]}
                  onChange={(event) => handleFoodGroupChange(key, event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            onClick={handleReestimateClick}
            disabled={isReestimating || !hasDraftChanges}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReestimating ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Reestimando...
              </>
            ) : (
              <>
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Reestimar con Cambios
              </>
            )}
          </button>
          {!hasDraftChanges && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Modifica al menos un campo para reestimar.</p>
          )}
        </div>

        {reestimateError && (
          <p className="text-sm text-red-600 dark:text-red-400">{reestimateError}</p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        {saveSuccess ? (
          <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircleIcon className="-ml-1 mr-3 h-5 w-5" />
            ¡Guardado en tu registro con éxito!
          </div>
        ) : (
          <button
            onClick={onSave}
            disabled={isSaving || isReestimating}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-colors"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Guardando...
              </>
            ) : (
              <>
                <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Guardar en Registro de Comida
              </>
            )}
          </button>
        )}
        {saveError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{saveError}</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;
