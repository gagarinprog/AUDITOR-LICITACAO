import React, { useRef, useState } from 'react';
import { Upload, ShieldCheck, FileText, AlertCircle, FilePlus, X } from 'lucide-react';

interface UploadScreenProps {
  onFileSelect: (files: File[]) => void;
  error: string | null;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelect, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfs.length !== newFiles.length) {
      alert("Apenas arquivos PDF são permitidos.");
    }
    // Avoid duplicates based on name
    const uniqueFiles = pdfs.filter(newF => !selectedFiles.some(currF => currF.name === newF.name));
    setSelectedFiles(prev => [...prev, ...uniqueFiles]);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleAnalyze = () => {
    if (selectedFiles.length === 0) return;
    onFileSelect(selectedFiles);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Branding */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 rotate-3 transition-transform hover:rotate-0">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">GovTech Auditor AI</h1>
          <p className="text-slate-500 mt-3 text-lg max-w-lg mx-auto">
            Faça upload do <strong>Edital</strong> e do <strong>Termo de Referência</strong>. A IA cruzará as informações para garantir fidelidade na habilitação.
          </p>
        </div>

        {/* Upload Box */}
        <div className="flex flex-col gap-4">
            <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                group relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50 hover:shadow-lg'
                }
            `}
            >
            <div className="p-3 rounded-full bg-slate-100 group-hover:bg-blue-100 mb-3 transition-colors">
                <FilePlus className="text-slate-400 group-hover:text-blue-600 w-8 h-8" />
            </div>
            <span className="text-base font-semibold text-slate-700 group-hover:text-blue-700">
                Adicionar Arquivos (PDF)
            </span>
            <span className="text-sm text-slate-400 mt-1">Edital, TR, Anexos...</span>
            <input
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleInputChange}
            />
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-left shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Arquivos Selecionados ({selectedFiles.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map(file => (
                            <div key={file.name} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                    <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} className="text-slate-400 hover:text-red-500 p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
                    >
                        Iniciar Análise de Habilitação
                    </button>
                </div>
            )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100 text-left">
            <AlertCircle size={24} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};