import React, { useRef } from 'react';
import { CameraIcon } from './icons/Icons';

interface ImageUploaderProps {
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  imageUrl: string | null;
  mealDescription: string;
  onMealDescriptionChange: (description: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageFile,
  onImageChange,
  imageUrl,
  mealDescription,
  onMealDescriptionChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        id="file-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload meal image"
      />
      <input
        type="file"
        id="camera-capture"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
        aria-label="Take meal photo"
      />
      {imageUrl ? (
        <div className="mt-4 group relative">
          <img src={imageUrl} alt="Meal preview" className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md" />
          <div
            onClick={handleUploadClick}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all duration-300 rounded-lg cursor-pointer"
          >
            <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-lg flex items-center">
              <CameraIcon className="w-6 h-6 mr-2" />
              Cambiar Foto
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div
            onClick={handleUploadClick}
            className="flex justify-center items-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-brand dark:hover:border-brand-light transition-colors"
          >
            <div className="text-center">
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-brand">Subir archivo</span> o arrastrar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP</p>
            </div>
          </div>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center text-sm sm:text-base touch-manipulation active:scale-95 min-h-[44px]"
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Tomar Foto
          </button>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="meal-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Descripcion del plato (opcional)
        </label>
        <textarea
          id="meal-description"
          value={mealDescription}
          onChange={(event) => onMealDescriptionChange(event.target.value)}
          placeholder="Ej: Casado con pollo a la plancha, arroz integral, frijoles negros y ensalada sin aderezo."
          rows={3}
          maxLength={300}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60"
          aria-label="Descripcion opcional del plato"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
