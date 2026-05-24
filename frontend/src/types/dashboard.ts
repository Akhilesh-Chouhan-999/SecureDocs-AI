export interface FraudMetrics {
  totalScans: number;
  fraudDetected: number;
  highRisk: number;
  avgConfidence: number;
}

export interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  pendingDocuments: number;
  fraudAlerts: number;
}

export interface Report {
  _id: string;
  documentId: string;
  riskLevel: string;
  riskScore: number;
  createdAt: string;
}
