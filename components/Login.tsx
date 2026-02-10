
import React, { useState } from 'react';
import { User, UserProfile } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
    googleSheetUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, googleSheetUrl }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [regStep, setRegStep] = useState(1); // 1: Credentials, 2: Profile
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile fields with example/default data provided by user
    const [profile, setProfile] = useState<UserProfile>({
        fullName: '',
        goals: { frutas: 1, leches: 2, vegetales: 3, harinas: 8, proteinas: 14, grasas: 4, calorias: 1965 },
        exercisePlan: 'mantener caminata',
        indications: 'mantener el omega 3',
        liquidLiters: 2,
        weight: { actual: 104, meta: 84 }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isRegistering && regStep === 1) {
            setRegStep(2);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                action: isRegistering ? 'signup' : 'login',
                username,
                password,
                profile: isRegistering ? profile : undefined
            };

            const response = await fetch(googleSheetUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error("Respuesta inválida del servidor");
            }

            if (result.status === 'success') {
                const sanitizeProfile = (p: any): UserProfile | undefined => {
                    if (!p) return undefined;
                    return {
                        fullName: p.fullName || "",
                        goals: {
                            frutas: Number(p.goals?.frutas) || 0,
                            leches: Number(p.goals?.leches) || 0,
                            vegetales: Number(p.goals?.vegetales) || 0,
                            harinas: Number(p.goals?.harinas) || 0,
                            proteinas: Number(p.goals?.proteinas) || 0,
                            grasas: Number(p.goals?.grasas) || 0,
                            calorias: Number(p.goals?.calorias) || 0
                        },
                        exercisePlan: p.exercisePlan || "",
                        indications: p.indications || "",
                        liquidLiters: Number(p.liquidLiters) || 0,
                        weight: {
                            actual: Number(p.weight?.actual) || 0,
                            meta: Number(p.weight?.meta) || 0
                        }
                    };
                };

                onLogin({
                    username: result.username || username,
                    isLoggedIn: true,
                    profile: sanitizeProfile(result.profile) || (isRegistering ? profile : undefined)
                });
            } else {
                setError(result.message || 'Ocurrió un error inesperado');
                if (isRegistering) setRegStep(1);
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = (field: string, value: any, subfield?: string) => {
        setProfile(prev => {
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
        <div className="flex items-center justify-center p-4">
            <div className={`w-full ${regStep === 2 ? 'max-w-3xl' : 'max-w-md'} bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all duration-500 overflow-hidden`}>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/5 rounded-full mb-4">
                        <img src="./logo.png" alt="Nutria Logo" className="w-16 h-16 rounded-full shadow-sm" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 italic">
                        Nutria <span className="text-brand">Nutrición IA</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isRegistering
                            ? (regStep === 1 ? 'Crea tu cuenta' : 'Completa tu ficha nutricional')
                            : 'Bienvenido de nuevo'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 flex items-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {(!isRegistering || regStep === 1) ? (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre de usuario</label>
                                <input
                                    type="text" required
                                    id="username"
                                    name="username"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand"
                                    placeholder="p.ej. juan_cr"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
                                <input
                                    type="password" required
                                    id="password"
                                    name="password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="space-y-5">
                                <h3 className="font-bold text-brand uppercase text-xs tracking-widest flex items-center">
                                    <span className="w-2 h-2 bg-brand rounded-full mr-2"></span>
                                    Datos Personales
                                </h3>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
                                    <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.fullName} onChange={e => updateProfile('fullName', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Peso Actual (kg)</label>
                                        <input type="number" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.weight.actual} onChange={e => updateProfile('weight', Number(e.target.value), 'actual')} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Peso Meta (kg)</label>
                                        <input type="number" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.weight.meta} onChange={e => updateProfile('weight', Number(e.target.value), 'meta')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Plan de Ejercicio</label>
                                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.exercisePlan} onChange={e => updateProfile('exercisePlan', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Indicaciones</label>
                                    <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand resize-none" value={profile.indications} onChange={e => updateProfile('indications', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h3 className="font-bold text-brand uppercase text-xs tracking-widest flex items-center">
                                    <span className="w-2 h-2 bg-brand rounded-full mr-2"></span>
                                    Metas Diarias
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'harinas', label: 'Harinas' },
                                        { key: 'proteinas', label: 'Protes' },
                                        { key: 'vegetales', label: 'Vegetales' },
                                        { key: 'frutas', label: 'Frutas' },
                                        { key: 'leches', label: 'Leches' },
                                        { key: 'grasas', label: 'Grasas' }
                                    ].map(item => (
                                        <div key={item.key}>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">{item.label}</label>
                                            <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={(profile.goals as any)[item.key]} onChange={e => updateProfile('goals', Number(e.target.value), item.key)} />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calorías</label>
                                        <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.goals.calorias} onChange={e => updateProfile('goals', Number(e.target.value), 'calorias')} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Líquido (L)</label>
                                        <input type="number" step="0.5" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand" value={profile.liquidLiters} onChange={e => updateProfile('liquidLiters', Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {isRegistering && regStep === 2 && (
                            <button
                                type="button"
                                onClick={() => setRegStep(1)}
                                className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all"
                            >
                                Volver
                            </button>
                        )}
                        <button
                            type="submit" disabled={isLoading}
                            className="flex-grow py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Procesando...
                                </span>
                            ) : (isRegistering ? (regStep === 1 ? 'Continuar' : 'Finalizar Registro') : 'Iniciar Sesión')}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                        <button
                            onClick={() => { setIsRegistering(!isRegistering); setRegStep(1); }}
                            className="ml-2 text-brand font-bold hover:underline"
                        >
                            {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
