# AI Workflow Rules

# Core AI Rules

## Rule 1: Never Assume Fraud
The AI should flag:

- potential anomalies
- suspicious inconsistencies
- possible tampering

The system must NEVER directly confirm fraud.

---

## Rule 2: Validate Against Historical Data
Always compare:

- ownership records
- financial statements
- previous applications
- legal records

before generating risk analysis.

---

## Rule 3: Risk Score Thresholds

| Score | Risk Level |
|---|---|
| 0-30 | Low |
| 31-60 | Medium |
| 61-80 | High |
| 81-100 | Critical |

---

## Rule 4: OCR Confidence Validation
If OCR confidence is low:

- warn the user
- recommend manual verification

---

## Rule 5: Explainability
Every detected anomaly must include:

- reason
- affected field
- confidence score
- suggested action

---

# AI Agents

- OCR Agent
- Parser Agent
- Fraud Detection Agent
- Financial Analysis Agent
- Risk Scoring Agent
- Report Generation Agent