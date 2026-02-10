import React, { useRef } from 'react';
import { CameraIcon } from './icons/Icons';

interface ImageUploaderProps {
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageFile, onImageChange, imageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        accept="image/png, image/jpeg, image/webp"
        aria-label="Upload meal image"
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
        <div
          onClick={handleUploadClick}
          className="mt-4 flex justify-center items-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-brand dark:hover:border-brand-light transition-colors"
        >
          <div className="text-center">
            <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-brand">Haz clic para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP hasta 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;