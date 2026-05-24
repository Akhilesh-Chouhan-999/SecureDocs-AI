export interface Document {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: string;
  url?: string;
  fraudScore?: number;
  analysisResults?: any;
}

export interface DocumentUploadResponse {
  data: {
    document: Document;
    message?: string;
  };
}
