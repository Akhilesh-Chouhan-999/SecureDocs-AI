import { FraudMarker } from './fraudDetection';
import { Anomaly } from './anomalyDetection';

/**
 * Compiles a global risk score from various analysis engines
 */

export const riskScoring = {
  calculateScore: (markers: FraudMarker[], anomalies: Anomaly[]): number => {
    let score = 0;
    
    markers.forEach(marker => {
      if (marker.severity === 'HIGH') score += 30;
      if (marker.severity === 'MEDIUM') score += 15;
      if (marker.severity === 'LOW') score += 5;
    });

    anomalies.forEach(anomaly => {
      score += anomaly.weight * 10;
    });

    // Cap at 100
    return Math.min(Math.round(score), 100);
  },

  getRiskLevel: (score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN' => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    if (score > 10) return 'LOW';
    return 'CLEAN';
  }
};
