import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Loader } from './Loader';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  isLoading: boolean;
  error: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className="text-xl text-slate-300 animate-pulse">جاري تحليل الملفات...</p>
          <p className="text-slate-400">قد يستغرق هذا بعض الوقت للملفات الكبيرة.</p>
        </div>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-4">
            محلل المستندات الذكي
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl">
            ارفع ملفات PDF أو صور، وسيقوم الذكاء الاصطناعي بالإجابة على أي سؤال تطرحه حول محتواها.
          </p>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative w-full max-w-lg p-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-105' : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50'}`}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,image/*"
              multiple
            />
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <UploadIcon className="w-16 h-16" />
              <p className="text-lg font-medium">اسحب وأفلت ملفات PDF أو صور هنا</p>
              <p className="text-sm">أو</p>
              <p className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-500 transition-colors">
                اختر ملفات
              </p>
            </div>
          </div>
          {error && <p className="text-red-400 mt-4 animate-shake">{error}</p>}
        </>
      )}
    </div>
  );
};

export default FileUpload;
