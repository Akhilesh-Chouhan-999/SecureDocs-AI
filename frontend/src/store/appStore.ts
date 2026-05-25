import { create } from 'zustand';
import { Alert, UIDocument } from '../types';
import { initialVaultDocuments } from '../data/mockDb';

interface AppState {
  processingDocument: string | null;
  setProcessingDocument: (docId: string | null) => void;
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  vaultDocuments: UIDocument[];
  addDocument: (doc: UIDocument) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<UIDocument>) => void;
  isLockdown: boolean;
  toggleLockdown: () => void;
}

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
  vaultDocuments: initialVaultDocuments,
  addDocument: (doc) => set((state) => ({ vaultDocuments: [doc, ...state.vaultDocuments] })),
  deleteDocument: (id) => set((state) => ({
    vaultDocuments: state.vaultDocuments.filter(doc => doc.id !== id)
  })),
  updateDocument: (id, updates) => set((state) => ({
    vaultDocuments: state.vaultDocuments.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
  })),
  isLockdown: false,
  toggleLockdown: () => set((state) => {
    const nextLockdown = !state.isLockdown;
    
    // Auto-alert on lockdown initiation
    const newAlert: Alert = {
      id: Math.random().toString(),
      type: 'system',
      title: nextLockdown ? 'Lockdown Initiated' : 'Lockdown Lifted',
      message: nextLockdown 
        ? 'All vault operations restricted. Node authentication required.' 
        : 'System returned to standard operation.',
      severity: nextLockdown ? 'high' : 'low',
      timestamp: new Date(),
      isRead: false
    };

    return { 
      isLockdown: nextLockdown,
      alerts: [newAlert, ...state.alerts]
    };
  })
}));
