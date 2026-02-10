import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

const readSinglePdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    let fileText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fileText += pageText + '\n';
    }
    return fileText;
  } catch (error) {
    console.error(`Error reading ${file.name}:`, error);
    throw new Error(`Falha ao ler o arquivo ${file.name}. Certifique-se de que é um PDF válido.`);
  }
};

export const extractTextFromFiles = async (files: File[]): Promise<string> => {
  let combinedText = "";

  for (const file of files) {
    const text = await readSinglePdf(file);
    combinedText += `\n\n<<< INÍCIO DO ARQUIVO: ${file.name} >>>\n\n`;
    combinedText += text;
    combinedText += `\n\n<<< FIM DO ARQUIVO: ${file.name} >>>\n\n`;
  }

  return combinedText;
};