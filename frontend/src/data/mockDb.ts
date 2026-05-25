import { UIDocument } from '../types';

export interface AccessLog {
  id: string;
  ip: string;
  location: string;
  timestamp: Date;
  event: string;
  status: 'allowed' | 'denied';
}

export const initialVaultDocuments: UIDocument[] = [
  { id: '1', name: 'Q3_Revenue_Forecast_Encrypted.pdf', type: 'PDF', riskScore: 18, status: 'Low Risk', timestamp: new Date(Date.now() - 120000), size: '1.2 MB' },
  { id: '2', name: 'Unknown_Signature_Block_AX.bin', type: 'Binary', riskScore: 85, status: 'High Risk', timestamp: new Date(Date.now() - 50400000), size: '450 KB' },
  { id: '3', name: 'Corp_Asset_Transfer_0924.pdf', type: 'PDF', riskScore: 94, status: 'High Risk', timestamp: new Date(Date.now() - 172800000), size: '5.6 MB' },
  { id: '4', name: 'Internal_Auth_Matrix_2024.docx', type: 'Word', riskScore: 48, status: 'Medium', timestamp: new Date(Date.now() - 172800000), size: '3.1 MB' },
  { id: '5', name: 'Employee_Payroll_Master_V2.xlsx', type: 'Excel', riskScore: 12, status: 'Clean', timestamp: new Date(Date.now() - 259200000), size: '8.4 MB' },
  { id: '6', name: 'Employee_Stock_Plan_V2.pdf', type: 'PDF', riskScore: 5, status: 'Clean', timestamp: new Date(Date.now() - 345600000), size: '2.1 MB' },
];

export const mockAccessLogs: AccessLog[] = [
  { id: '1', ip: '192.168.1.102', location: 'London, UK', timestamp: new Date(Date.now() - 300000), event: 'Auth Successful (Biometrics)', status: 'allowed' },
  { id: '2', ip: '185.22.60.10', location: 'Kyiv, UA', timestamp: new Date(Date.now() - 3600000), event: 'Auth Failure (Passphrase Mismatch)', status: 'denied' },
  { id: '3', ip: '192.168.1.101', location: 'London, UK', timestamp: new Date(Date.now() - 14400000), event: 'Vault Decrypted (Key Exchange)', status: 'allowed' },
  { id: '4', ip: '45.132.88.54', location: 'Singapore, SG', timestamp: new Date(Date.now() - 86400000), event: 'Access Attempted (Unknown Node)', status: 'denied' },
];
