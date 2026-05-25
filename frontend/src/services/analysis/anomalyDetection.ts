/**
 * Detects structural or behavioral anomalies in documents
 */

export interface Anomaly {
  id: string;
  name: string;
  weight: number; // 0.0 to 1.0
  details: string;
}

export const anomalyDetection = {
  findAnomalies: (metadata: Record<string, any>, _text: string): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    
    if (metadata.creationDate && metadata.modificationDate) {
      const created = new Date(metadata.creationDate);
      const modified = new Date(metadata.modificationDate);
      
      if (modified < created) {
        anomalies.push({
          id: 'TIME_TRAVEL',
          name: 'Chronological Inconsistency',
          weight: 0.8,
          details: 'Modification date precedes creation date, indicating severe metadata tampering.',
        });
      }
    }

    return anomalies;
  }
};
