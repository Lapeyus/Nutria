
import React from 'react';
import { UserProfile, FoodSummary } from '../types';
import { FireIcon, DropletIcon } from './icons/Icons';

interface ComplianceDashboardProps {
    profile: UserProfile;
    summary: FoodSummary;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ profile, summary }) => {
    // Universal safety check - ensure we always have valid numbers
    const getGoal = (key: keyof UserProfile['goals']) => profile?.goals?.[key] ?? 0;
    const getStat = (key: keyof FoodSummary) => summary?.[key] ?? 0;

    const goals = {
        harinas: getGoal('harinas'),
        proteinas: getGoal('proteinas'),
        vegetales: getGoal('vegetales'),
        frutas: getGoal('frutas'),
        leches: getGoal('leches'),
        grasas: getGoal('grasas'),
        calorias: getGoal('calorias')
    };

    const stats = {
        harinas: getStat('harinas'),
        proteinas: getStat('proteinas'),
        vegetales: getStat('vegetales'),
        frutas: getStat('frutas'),
        leches: getStat('leches'),
        grasas: getStat('grasas'),
        calorias: getStat('calorias')
    };

    const groups = [
        { key: 'harinas', label: 'Harinas', goal: goals.harinas, consumed: stats.harinas, color: 'bg-orange-500' },
        { key: 'proteinas', label: 'Proteínas', goal: goals.proteinas, consumed: stats.proteinas, color: 'bg-red-500' },
        { key: 'vegetales', label: 'Vegetales', goal: goals.vegetales, consumed: stats.vegetales, color: 'bg-green-500' },
        { key: 'frutas', label: 'Frutas', goal: goals.frutas, consumed: stats.frutas, color: 'bg-yellow-500' },
        { key: 'leches', label: 'Leches', goal: goals.leches, consumed: stats.leches, color: 'bg-blue-500' },
        { key: 'grasas', label: 'Grasas', goal: goals.grasas, consumed: stats.grasas, color: 'bg-slate-500' },
    ];

    const calculatePercent = (consumed: number, goal: number) => {
        if (!goal || goal === 0) return 0;
        return Math.min((consumed / goal) * 100, 100);
    };

    const getStatusColor = (consumed: number, goal: number) => {
        if (!goal || goal === 0) return 'bg-slate-200';
        if (consumed > goal) return 'bg-red-500';
        if (consumed >= goal * 0.9) return 'bg-green-500';
        return 'bg-brand';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 mb-8">
            <div className="bg-brand/5 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <span className="w-2 h-6 bg-brand rounded-full mr-3"></span>
                    Estado de mi Dieta <span className="text-slate-400 font-normal ml-2 text-sm italic">(Hoy)</span>
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center text-brand font-bold">
                        <FireIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">{stats.calorias} / {goals.calorias} kcal</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {groups.map((group) => {
                        const percent = calculatePercent(group.consumed, group.goal);
                        const isExceeded = group.consumed > group.goal;

                        return (
                            <div key={group.key} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{group.label}</span>
                                    <span className={`text-xs font-black ${isExceeded ? 'text-red-500' : 'text-slate-500'}`}>
                                        {group.consumed} / {group.goal} <span className="font-normal">porciones</span>
                                    </span>
                                </div>

                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${getStatusColor(group.consumed, group.goal)}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>

                                {isExceeded && (
                                    <p className="text-[10px] text-red-500 font-bold animate-pulse">
                                        ⚠️ Has superado el máximo diario recomendado.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Líquido Diario</p>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <DropletIcon className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="text-xl font-black text-slate-800 dark:text-white">---</span>
                            </div>
                            <span className="text-sm font-bold text-slate-400">Objetivo: {profile?.liquidLiters || 0}L</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 italic">* El registro de agua se habilitará pronto.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indicación del Día</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic line-clamp-2">
                            "{profile?.indications || 'Sin indicaciones'}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceDashboard;
