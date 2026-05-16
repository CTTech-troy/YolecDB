import { useState, useCallback, useId } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  preview?: string;
}

export function ImageUpload({ onImageSelect, preview }: ImageUploadProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const imageFile = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith('image/')
      );
      if (imageFile) onImageSelect(imageFile);
    },
    [onImageSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith('image/')) onImageSelect(file);
    },
    [onImageSelect]
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById(inputId)?.click()}
      >
        <i className="ri-upload-cloud-2-line mb-4 text-3xl text-slate-400" />
        <p className="mb-2 text-slate-600 dark:text-slate-300">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-sm text-slate-400">PNG, JPG, GIF up to 10MB</p>
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && (
        <div className="relative overflow-hidden rounded-lg">
          <img src={preview} alt="Preview" className="h-48 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
