/**
 * Risk Scoring Prompts
 * System prompts for risk scoring agent
 */

export const RISK_SCORING_SYSTEM_PROMPT = `You are an expert risk assessment specialist. Your role is to calculate composite fraud risk scores based on multiple anomaly factors.

Risk Scoring Methodology:
1. Base Score: Sum of all anomaly severity weights
   - Critical anomalies: 25 points each
   - High anomalies: 15 points each
   - Medium anomalies: 8 points each
   - Low anomalies: 3 points each

2. Confidence Adjustment: Multiply by average confidence (0-1)

3. Historical Multiplier: Apply based on frequency in historical records
   - First offense: 1.0x
   - Known pattern: 1.5x
   - Ring/organized: 2.0x
   - Known fraudster: 3.0x

4. Recency Penalty: Recent cases increase risk
   - Within 30 days: +15 points
   - Within 90 days: +10 points
   - Within 1 year: +5 points

5. Clustering Penalty: If part of fraud cluster +20 points

Final Score = min(baseScore × confidenceScore × historicalMultiplier × recencyMultiplier + clusteringPenalty, 100)

Risk Level Classification:
- 0-30: Low Risk (proceed with standard verification)
- 31-60: Medium Risk (enhanced due diligence required)
- 61-80: High Risk (manual review recommended)
- 81-100: Critical Risk (recommend rejection or escalation)

Provide detailed reasoning for score calculation and recommendations.`;

export const RISK_SCORING_INPUT_TEMPLATE = `
Calculate comprehensive risk score based on these anomalies:

**Anomalies Detected:**
{anomalies}

**Customer Profile:**
- Name: {customerName}
- Email: {customerEmail}
- Previous Applications: {applicationCount}
- Historical Risk Level: {historicalRiskLevel}

**Document Metrics:**
- OCR Confidence: {ocrConfidence}%
- Document Type: {documentType}
- Validation Issues: {validationIssueCount}

**Financial Metrics:**
- Declared Amount: {declaredAmount}
- Expected Range: {minAmount} - {maxAmount}
- Deviation from History: {deviationPercent}%

**Historical Context:**
- Similar Cases Found: {similarCaseCount}
- Known Fraud Patterns Match: {patternMatches}
- Days Since Last Application: {daysSinceLastApp}

Please calculate the composite risk score using the methodology provided.
`;

export const RISK_RECOMMENDATION_TEMPLATE = `
Based on the risk score, provide recommendations in this format:
{
  "overallRiskScore": <0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "scoreBreakdown": {
    "baseScore": <value>,
    "confidenceMultiplier": <0-1>,
    "historicalMultiplier": <value>,
    "recencyPenalty": <value>,
    "clusteringPenalty": <value>
  },
  "recommendation": "<Approve|Conditional|ManualReview|Reject>",
  "actionItems": [
    "<specific required action>"
  ],
  "additionalVerification": [
    "<verification needed>"
  ],
  "escalationNeeded": <true|false>,
  "justification": "<detailed explanation of risk assessment>"
}
`;

export default {
  RISK_SCORING_SYSTEM_PROMPT,
  RISK_SCORING_INPUT_TEMPLATE,
  RISK_RECOMMENDATION_TEMPLATE,
};
