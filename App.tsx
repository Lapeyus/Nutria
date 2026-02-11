
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Login from './components/Login';
import ProfileView from './components/ProfileView';
import ComplianceDashboard from './components/ComplianceDashboard';
import { analyzeFoodImage, reestimateFoodAnalysis } from './services/geminiService';
import { AnalysisAdjustments, FoodAnalysis, User, UserProfile, FoodSummary } from './types';
import { SparklesIcon, ArrowPathIcon } from './components/icons/Icons';

// The URL for your Google Apps Script Web App
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyBGooD6ahbcZ12oizfHswzH3joqiHt8zNxc2EI_4e_rPoiMv-TR2k212l9b8tVPK0FQQ/exec";

// Set a max file size (e.g., 4MB) to prevent issues with base64 encoding and API requests.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

const resizeImageForSheet = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX_DIMENSION = 300;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error("Canvas context not available")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image for resizing")); };
    img.src = url;
  });
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('nutria_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mealDescription, setMealDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isReestimating, setIsReestimating] = useState<boolean>(false);
  const [reestimateError, setReestimateError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [dailySummary, setDailySummary] = useState<FoodSummary>({
    harinas: 0, vegetales: 0, proteinas: 0, frutas: 0, leches: 0, grasas: 0, calorias: 0
  });

  const fetchDailySummary = useCallback(async (username: string) => {
    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'get_summary', username }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setDailySummary(result.summary);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.isLoggedIn) {
      fetchDailySummary(currentUser.username);
    }
  }, [currentUser, fetchDailySummary]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('nutria_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nutria_user');
    setIsProfileOpen(false);
    handleReset();
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profile };
      setCurrentUser(updatedUser);
      localStorage.setItem('nutria_user', JSON.stringify(updatedUser));
    }
  };

  const handleImageChange = (file: File | null) => {
    setAnalysis(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
    setReestimateError(null);
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageFile(null);
      setImageUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    setReestimateError(null);
    setAnalysis(null);
    try {
      const result = await analyzeFoodImage(imageFile, mealDescription);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al analizar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    handleImageChange(null);
    setMealDescription('');
    setAnalysis(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
    setReestimateError(null);
  };

  const handleReestimate = async (adjustments: AnalysisAdjustments) => {
    if (!analysis || !imageFile) return;
    setIsReestimating(true);
    setReestimateError(null);
    setSaveSuccess(false);
    try {
      const updatedAnalysis = await reestimateFoodAnalysis(imageFile, analysis, adjustments, mealDescription);
      setAnalysis(updatedAnalysis);
    } catch (err: any) {
      setReestimateError(err.message || "No se pudo reestimar la comida con los cambios proporcionados.");
    } finally {
      setIsReestimating(false);
    }
  };

  const handleSaveToSheet = async () => {
    if (!analysis || !currentUser) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      let imageBase64 = "";
      if (imageFile) {
        try { imageBase64 = await resizeImageForSheet(imageFile); } catch (e) { console.warn(e); }
      }
      const dataToSave = {
        action: 'save_meal',
        username: currentUser?.username,
        timestamp: analysis.photoTimestamp,
        foodName: analysis.foodName,
        portionSize: analysis.portionSize,
        estimatedCalories: analysis.estimatedCalories,
        ingredients: analysis.ingredients,
        ...analysis.foodGroups,
        image: imageBase64,
      };

      // We use 'no-cors' only if the user environment requires it, 
      // but 'get_summary' works with normal fetch, so we should try normal fetch first for POSTs if possible
      // or handle the Apps Script peculiar behavior.
      await fetch(GOOGLE_SHEET_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(dataToSave) });

      setSaveSuccess(true);
      // Wait a bit then refresh summary and reset view
      setTimeout(() => {
        fetchDailySummary(currentUser.username);
        handleReset();
      }, 2000);
    } catch (error: any) {
      setSaveError("No se pudo guardar en tu registro.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Header user={currentUser} onLogout={handleLogout} onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {!currentUser?.isLoggedIn ? (
          <div className="max-w-md mx-auto mt-12">
            <Login onLogin={handleLogin} googleSheetUrl={GOOGLE_SHEET_URL} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Nutria <span className="text-brand">Nutrición IA</span>
              </h1>
              <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Tu asistente personal de salud.
              </p>
            </div>

            {currentUser.profile && (
              <ComplianceDashboard profile={currentUser.profile} summary={dailySummary} />
            )}

            <div className="p-1 bg-gradient-to-br from-brand/20 via-transparent to-brand/10 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center">
                  <span className="w-6 sm:w-8 h-[2px] bg-brand/30 mr-2 sm:mr-3"></span>
                  Nuevo Registro
                </h3>
                <ImageUploader
                  imageFile={imageFile}
                  onImageChange={handleImageChange}
                  imageUrl={imageUrl}
                  mealDescription={mealDescription}
                  onMealDescriptionChange={setMealDescription}
                />
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button onClick={handleAnalyze} disabled={!imageFile || isLoading} className="flex-grow py-3 sm:py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/20 transition-all flex items-center justify-center disabled:opacity-50 text-sm sm:text-base touch-manipulation active:scale-95 min-h-[44px]">
                    {isLoading ? "Analizando..." : <><SparklesIcon className="w-5 h-5 mr-2" /> Analizar Plato</>}
                  </button>
                  {imageFile && (
                    <button onClick={handleReset} className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center text-sm sm:text-base touch-manipulation active:scale-95 min-h-[44px]">
                      <ArrowPathIcon className="w-5 h-5 mr-2" /> Reiniciar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl animate-in zoom-in duration-300">
                <p className="text-red-600 dark:text-red-400 font-medium text-center text-sm sm:text-base">{error}</p>
              </div>
            )}

            {analysis && (
              <div className="mt-6 sm:mt-8 animate-in slide-in-from-bottom-8 duration-700 pb-16 sm:pb-20">
                <AnalysisResult
                  analysis={analysis}
                  onReestimate={handleReestimate}
                  isReestimating={isReestimating}
                  reestimateError={reestimateError}
                  onSave={handleSaveToSheet}
                  isSaving={isSaving}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {isProfileOpen && currentUser && (
        <ProfileView
          user={currentUser}
          googleSheetUrl={GOOGLE_SHEET_URL}
          onUpdate={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
