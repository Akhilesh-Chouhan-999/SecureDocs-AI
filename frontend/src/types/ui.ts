export interface Alert {
  id: string;
  type: 'fraud' | 'anomaly' | 'system';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'observation' | 'recommendation';
  title: string;
  content: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export interface UIDocument {
  id: string;
  name: string;
  type: string;
  riskScore: number;
  status: 'High Risk' | 'Medium' | 'Low Risk' | 'Clean';
  timestamp: Date;
  size: string;
}
