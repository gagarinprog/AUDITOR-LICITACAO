import React, { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { extractTextFromFiles } from './services/pdfService';
import { analyzeBidText } from './services/geminiService';
import { AnalysisResult } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    setLoading(true);
    setError(null);
    setLoadingStep(`Processando ${files.length} arquivo(s)...`);

    try {
      // 1. Extract Text from ALL files
      const text = await extractTextFromFiles(files);
      
      if (text.length < 50) {
        throw new Error("Não foi possível extrair texto suficiente. Verifique se os arquivos são PDFs pesquisáveis.");
      }

      // 2. Analyze with Gemini
      setLoadingStep('Auditando Habilitação e TR...');
      
      // Create a comma-separated list of filenames for context
      const filenames = files.map(f => f.name).join(', ');
      
      const analysis = await analyzeBidText(filenames, text);
      
      setData(analysis);
      setView('dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro inesperado durante a análise.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setData(null);
    setView('upload');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">GovTech Auditor</h3>
          <p className="text-slate-500 mt-2 animate-pulse font-medium">{loadingStep}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full h-full">
        {view === 'upload' ? (
          <UploadScreen onFileSelect={handleFileSelect} error={error} />
        ) : (
          <DashboardScreen data={data} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;