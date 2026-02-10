
import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import { CheckIcon, XMarkIcon, PencilIcon } from './icons/Icons';

interface ProfileViewProps {
    user: User;
    onUpdate: (profile: UserProfile) => void;
    googleSheetUrl: string;
    onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, googleSheetUrl, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(user.profile || {
        fullName: '',
        goals: { frutas: 0, leches: 0, vegetales: 0, harinas: 0, proteinas: 0, grasas: 0, calorias: 0 },
        exercisePlan: '',
        indications: '',
        liquidLiters: 0,
        weight: { actual: 0, meta: 0 }
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(googleSheetUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_profile',
                    username: user.username,
                    profile: formData
                }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                onUpdate(formData);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Update profile error:', err);
            alert('Error al guardar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: string, value: any, subfield?: string) => {
        setFormData(prev => {
            if (subfield) {
                return {
                    ...prev,
                    [field]: { ...((prev as any)[field]), [subfield]: value }
                };
            }
            return { ...prev, [field]: value };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="relative px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand/5">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 italic">
                            Mi Ficha <span className="text-brand">Nutricional</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-medium tracking-wide">USUARIO: {user.username.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-400">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* PERSONAL DATA */}
                        <div className="space-y-6">
                            <section className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <span className="w-4 h-[2px] bg-brand mr-2"></span> Datos Personales
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                                        {isEditing ? (
                                            <input type="text" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 focus:border-brand outline-none transition-all text-slate-800 dark:text-white" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
                                        ) : (
                                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{formData.fullName || '---'}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Peso Actual</label>
                                            {isEditing ? (
                                                <div className="relative"><input type="number" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 outline-none" value={formData.weight.actual} onChange={e => updateField('weight', Number(e.target.value), 'actual')} /><span className="absolute right-4 top-2 text-slate-400">kg</span></div>
                                            ) : (
                                                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{formData.weight.actual} kg</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Peso Meta</label>
                                            {isEditing ? (
                                                <div className="relative"><input type="number" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 outline-none" value={formData.weight.meta} onChange={e => updateField('weight', Number(e.target.value), 'meta')} /><span className="absolute right-4 top-2 text-slate-400">kg</span></div>
                                            ) : (
                                                <p className="text-lg font-semibold text-brand">{formData.weight.meta} kg</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <span className="w-4 h-[2px] bg-brand mr-2"></span> Estilo de Vida
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plan de Ejercicio</label>
                                        {isEditing ? (
                                            <input type="text" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 outline-none" value={formData.exercisePlan} onChange={e => updateField('exercisePlan', e.target.value)} />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">"{formData.exercisePlan || 'No definido'}"</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Indicaciones Médicas</label>
                                        {isEditing ? (
                                            <textarea className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 outline-none resize-none" rows={2} value={formData.indications} onChange={e => updateField('indications', e.target.value)} />
                                        ) : (
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">"{formData.indications || 'Ninguna'}"</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* DAILY GOALS */}
                        <div className="space-y-6">
                            <section className="bg-brand/5 p-6 rounded-3xl border border-brand/10">
                                <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center">
                                    <span className="w-4 h-[2px] bg-brand mr-2"></span> Mis Metas de Porciones
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                    {[
                                        { key: 'harinas', label: 'Harinas', color: 'bg-orange-100 text-orange-600' },
                                        { key: 'proteinas', label: 'Proteínas', color: 'bg-red-100 text-red-600' },
                                        { key: 'vegetales', label: 'Vegetales', color: 'bg-green-100 text-green-600' },
                                        { key: 'frutas', label: 'Frutas', color: 'bg-yellow-100 text-yellow-600' },
                                        { key: 'leches', label: 'Leches', color: 'bg-blue-100 text-blue-600' },
                                        { key: 'grasas', label: 'Grasas', color: 'bg-slate-200 text-slate-600' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center font-bold text-xs mr-3`}>
                                                    {(item.label[0] + (item.label[1] || '')).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                            </div>
                                            {isEditing ? (
                                                <input type="number" className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-center font-bold" value={(formData.goals as any)[item.key]} onChange={e => updateField('goals', Number(e.target.value), item.key)} />
                                            ) : (
                                                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{(formData.goals as any)[item.key]}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-brand/10 grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Calorías Diarias</label>
                                        {isEditing ? (
                                            <input type="number" className="w-full bg-transparent font-bold text-slate-800 dark:text-white outline-none" value={formData.goals.calorias} onChange={e => updateField('goals', Number(e.target.value), 'calorias')} />
                                        ) : (
                                            <p className="text-xl font-black text-brand">{formData.goals.calorias}</p>
                                        )}
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Líquido Diario</label>
                                        {isEditing ? (
                                            <div className="flex items-center"><input type="number" step="0.5" className="w-full bg-transparent font-bold text-slate-800 dark:text-white outline-none" value={formData.liquidLiters} onChange={e => updateField('liquidLiters', Number(e.target.value))} /><span className="text-xs font-bold text-slate-400">L</span></div>
                                        ) : (
                                            <p className="text-xl font-black text-slate-800 dark:text-slate-100">{formData.liquidLiters} L</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => { setIsEditing(false); setFormData(user.profile!); }} disabled={isSaving} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all">Cancelar</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold flex items-center shadow-lg shadow-brand/20 transition-all">
                                {isSaving ? 'Guardando...' : <><CheckIcon className="w-5 h-5 mr-2" /> Guardar Cambios</>}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center transition-all">
                            <PencilIcon className="w-5 h-5 mr-2" /> Editar Ficha
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
