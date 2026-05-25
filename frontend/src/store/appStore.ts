import { create } from 'zustand';
import { Alert } from '../types';

interface AppState {
  processingDocument: string | null;
  setProcessingDocument: (docId: string | null) => void;
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
}

// Initial mock alerts based on the reference UI
const mockAlerts: Alert[] = [
  { 
    id: '1', 
    type: 'fraud', 
    title: 'High Risk Document Detected', 
    message: 'Invoice #4521 flagged for suspicious patterns', 
    severity: 'high', 
    timestamp: new Date(Date.now() - 300000), 
    isRead: false 
  },
  { 
    id: '2', 
    type: 'anomaly', 
    title: 'Ownership Transfer Anomaly', 
    message: 'Unusual sequence in property chain detected', 
    severity: 'medium', 
    timestamp: new Date(Date.now() - 900000), 
    isRead: false 
  },
  { 
    id: '3', 
    type: 'system', 
    title: 'Analysis Complete', 
    message: 'Contract_2024.pdf fully analyzed', 
    severity: 'low', 
    timestamp: new Date(Date.now() - 1800000), 
    isRead: true 
  },
];

export const useAppStore = create<AppState>((set) => ({
  processingDocument: null,
  setProcessingDocument: (docId) => set({ processingDocument: docId }),
  alerts: mockAlerts,
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a)
  })),
}));
