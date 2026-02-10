import { AnalysisResult } from "../types";

export const analyzeBidText = async (filenames: string, text: string): Promise<AnalysisResult> => {
  // Use relative URL which works with Vite proxy (dev) and Python static serving (prod)
  const API_URL = '/analyze';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filenames,
        text
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erro no servidor: ${response.status}`);
    }

    const result = await response.json();
    return result as AnalysisResult;

  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(
      error.message || "Falha ao comunicar com o servidor de análise. Tente novamente."
    );
  }
};