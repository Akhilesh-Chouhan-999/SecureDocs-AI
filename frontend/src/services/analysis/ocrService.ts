/**
 * Simulates Optical Character Recognition (OCR) processing for documents
 */

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
  languagesDetected: string[];
}

export const ocrService = {
  extractText: async (_file: File): Promise<OCRResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      text: "Simulated extracted text content from document...",
      confidence: 0.94,
      wordCount: 1542,
      languagesDetected: ['en'],
    };
  },
  
  detectLayout: async (_file: File) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      hasTables: true,
      hasImages: false,
      columnCount: 1,
    };
  }
};
