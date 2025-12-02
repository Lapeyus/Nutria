
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { analyzeFoodImage } from './services/geminiService';
import { FoodAnalysis } from './types';
import { SparklesIcon, ArrowPathIcon } from './components/icons/Icons';

// The URL for your Google Apps Script Web App
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwWx11S21zPmZ8Ab-RBLSUWmj83nHF4RT7p6NJgk9ToL6_yFtFQGwTGqawgy4FYsKA30A/exec";

// Set a max file size (e.g., 4MB) to prevent issues with base64 encoding and API requests.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

// Helper to resize image for Google Sheets (limit ~50k chars per cell)
const resizeImageForSheet = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // 300px is usually safe for the 50k char limit with low jpeg quality
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
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // JPEG quality 0.5 to keep size low
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };
    
    img.src = url;
  });
};

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for saving to Google Sheet
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    // Clear previous states when a new image is selected or cleared
    setAnalysis(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`La imagen es demasiado grande. Por favor, sube un archivo de menos de ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
        setImageFile(null);
        setImageUrl(null);
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImageUrl(null);
    }
  };
  
  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setIsLoading(false);
    setError(null);
    setIsSaving(false);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError("Por favor, sube una imagen primero.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const result = await analyzeFoodImage(imageFile);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado durante el análisis.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleSaveToSheet = async () => {
    if (!analysis) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    if (!navigator.onLine) {
      setSaveError("Parece que no tienes conexión. Por favor, revisa tu conexión a internet e inténtalo de nuevo.");
      setIsSaving(false);
      return;
    }

    try {
      // Resize and convert image to base64
      let imageBase64 = null;
      if (imageFile) {
        try {
          // We resize the image because Google Sheets cells have a strict character limit (50,000).
          // Sending a full-size image would fail to save.
          imageBase64 = await resizeImageForSheet(imageFile);
        } catch (e) {
          console.warn("Could not resize image for saving:", e);
        }
      }

      // Preparamos el objeto de datos que coincide con la estructura que
      // espera el Google Apps Script.
      const dataToSave = {
        timestamp: analysis.photoTimestamp, // Enviar timestamp de EXIF si existe
        foodName: analysis.foodName,
        portionSize: analysis.portionSize,
        estimatedCalories: analysis.estimatedCalories,
        ingredients: analysis.ingredients, // El script de Google puede manejar el array directamente
        ...analysis.foodGroups, // Desglosamos las porciones: harinas, vegetales, etc.
        image: imageBase64, // Enviar la imagen redimensionada como base64
      };

      // El Google Apps Script proporcionado espera una carga útil JSON en el cuerpo de la solicitud (`e.postData.contents`).
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(dataToSave),
      });

      // Debido a que la solicitud es 'no-cors', no podemos leer la respuesta para
      // confirmar el éxito del lado del servidor. Procedemos de manera optimista.
      setSaveSuccess(true);

    } catch (error: any) {
      console.error("A network error occurred while saving to Google Sheet:", error);
      setSaveError("No se pudo guardar en tu registro. Por favor, revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Analiza Tu Comida
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
              Toma una foto de tu comida y deja que la IA te dé un desglose nutricional. ¡Así de simple!
            </p>
          </div>
          
          <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <ImageUploader 
              imageFile={imageFile} 
              onImageChange={handleImageChange} 
              imageUrl={imageUrl} 
            />
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAnalyzeClick}
                disabled={!imageFile || isLoading}
                className="w-full sm:w-auto flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-colors"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                    Analizar Comida
                  </>
                )}
              </button>
              { (imageFile || analysis || error) && (
                 <button
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                 >
                   Empezar de Nuevo
                 </button>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
                <p><span className="font-bold">Error:</span> {error}</p>
              </div>
            )}
            
            {analysis && !isLoading && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Resultados del Análisis</h2>
                <AnalysisResult 
                  analysis={analysis}
                  onSave={handleSaveToSheet}
                  isSaving={isSaving}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              </div>
            )}
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
