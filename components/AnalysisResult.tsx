import React from 'react';
import { FoodAnalysis, FoodGroupPortions } from '../types';
import { FireIcon, DocumentPlusIcon, ArrowPathIcon, CheckCircleIcon, BreadIcon, PlantIcon, FishIcon, AppleIcon, DropletIcon } from './icons/Icons';

interface AnalysisResultProps {
  analysis: FoodAnalysis;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

const foodGroupConfig = {
    harinas: { label: 'Harinas', Icon: BreadIcon, color: 'text-amber-600 dark:text-amber-400' },
    vegetales: { label: 'Vegetales', Icon: PlantIcon, color: 'text-green-600 dark:text-green-400' },
    proteinas: { label: 'Proteínas', Icon: FishIcon, color: 'text-red-600 dark:text-red-400' },
    frutas: { label: 'Frutas', Icon: AppleIcon, color: 'text-pink-600 dark:text-pink-400' },
    grasas: { label: 'Grasas', Icon: DropletIcon, color: 'text-yellow-600 dark:text-yellow-400' }
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onSave, isSaving, saveSuccess, saveError }) => {
  if (!analysis) {
    return null;
  }

  const { foodName, portionSize, estimatedCalories, foodGroups } = analysis;

  const renderPortion = (count: number) => {
    if (count === 1) return '1 porción';
    if (Number.isInteger(count)) return `${count} porciones`;
    return `${count.toFixed(1)} porciones`;
  };

  const displayedFoodGroups = Object.entries(foodGroups)
    // FIX: Add type guard to ensure count is a number before comparison.
    .filter(([, count]) => typeof count === 'number' && count > 0)
    .map(([key]) => key as keyof FoodGroupPortions);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="p-5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{foodName}</h3>
        <p className="text-md text-slate-600 dark:text-slate-300">{portionSize}</p>
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
                const count = foodGroups[key];
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
                {estimatedCalories}
            </p>
             <p className="text-sm text-slate-500 dark:text-slate-400">kcal</p>
        </div>
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
                disabled={isSaving}
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
