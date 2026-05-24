import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import * as pdfParseModule from "pdf-parse";
import env from "../config/env.js";
import { NotFoundError, ValidationError } from "../errors/index.js";
import { DOCUMENT_STATUSES } from "../constants/index.js";
import { normalizeHistoricalRecords } from "../ai/tools/historical-normalizer.js";
import { runDocumentAnalysisWorkflow } from "../ai/workflows/index.js";
import { logger } from "../logs/index.js";
import { AnomalyDetectionService } from "./anomaly-detection/anomaly-detection.service.js";
import { CompositeScorer } from "./risk-scoring/composite-scorer.js";

const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;

/**
 * Service orchestrating Document OCR parsing pipelines and fraud heuristics workflows
 */
export class AnalysisService {
  private documentService: any;
  private historicalRepository: any;
  private anomalyDetectionService: AnomalyDetectionService;
  private compositeScorer: CompositeScorer;

  constructor(documentService: any, historicalRepository: any) {
    this.documentService = documentService;
    this.historicalRepository = historicalRepository;
    this.anomalyDetectionService = new AnomalyDetectionService();
    this.compositeScorer = new CompositeScorer();
  }

  /**
   * Run the full analysis workflow: OCR file parsing, heuristic rule matching,
   * risk scoring, and updating database status.
   * @param documentId Target Document ObjectId string
   * @param userId Creator Analyst User ObjectId string
   */
  async analyzeDocument(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);
    document.status = DOCUMENT_STATUSES.PROCESSING;
    await document.save();

    try {
      const { ocrCache } = await import("../infrastructure/cache/ocr-cache.js");
      let ocrResult = await ocrCache.get(documentId.toString());

      if (!ocrResult) {
        ocrResult = await this.performOCRAnalysis(document.filePath);
        await ocrCache.set(documentId.toString(), ocrResult);
      }
      const workflow = await this.runWorkflow(document, ocrResult.text);

      await this.documentService.updateOcrResult(document, {
        ...ocrResult,
        structuredData: workflow.structuredData,
      });

      try {
        await this.historicalRepository.create({
          key: document._id.toString(),
          value: {
            documentId: document._id,
            userId: userId,
            ocrConfidence: ocrResult.confidence,
            structuredData: workflow.structuredData,
            anomalies: workflow.anomalies,
          },
          source: "analysis.service",
        });
      } catch (historyError) {
        logger.warn("Failed to persist analysis history", { error: historyError });
      }

      return {
        documentId: document._id,
        ocr: {
          ...ocrResult,
          structuredData: workflow.structuredData,
        },
        anomalies: workflow.anomalies,
        memory: workflow.memory,
        historicalContext: workflow.historicalContext,
        status: DOCUMENT_STATUSES.COMPLETED,
      };
    } catch (error: unknown) {
      document.status = DOCUMENT_STATUSES.FAILED;
      document.statusMessage = error instanceof Error ? error.message : String(error);
      await document.save();
      throw error;
    }
  }

  /**
   * Run OCR extraction only, skipping workflow heuristic checks
   * @param documentId Target Document ObjectId string
   * @param userId Creator Analyst User ObjectId string
   */
  async extractOcr(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);
    document.status = DOCUMENT_STATUSES.PROCESSING;
    await document.save();

    try {
      const { ocrCache } = await import("../infrastructure/cache/ocr-cache.js");
      let ocrResult = await ocrCache.get(documentId.toString());

      if (!ocrResult) {
        ocrResult = await this.performOCRAnalysis(document.filePath);
        await ocrCache.set(documentId.toString(), ocrResult);
      }

      const workflow = runDocumentAnalysisWorkflow({
        document,
        text: ocrResult.text,
        historicalRecords: [],
      });

      await this.documentService.updateOcrResult(document, {
        ...ocrResult,
        structuredData: workflow.structuredData,
      });

      return {
        documentId: document._id,
        ocr: {
          ...ocrResult,
          structuredData: workflow.structuredData,
        },
      };
    } catch (error: unknown) {
      document.status = DOCUMENT_STATUSES.FAILED;
      document.statusMessage = error instanceof Error ? error.message : String(error);
      await document.save();
      throw error;
    }
  }

  /**
   * Retrieve document analysis status properties
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async getStatus(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);
    return {
      documentId: document._id,
      status: document.status,
      statusMessage: document.statusMessage,
      ocrConfidence: document.ocrConfidence,
    };
  }

  /**
   * Retrieve structured OCR document extraction results
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async getResults(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);

    if (!document.ocrText) {
      throw new NotFoundError("Analysis result");
    }

    return {
      documentId: document._id,
      ocrText: document.ocrText,
      ocrConfidence: document.ocrConfidence,
      structuredData: document.structuredData,
      status: document.status,
    };
  }

  /**
   * Run rule analysis only against already analyzed document text
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async detectAnomaly(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);

    if (!document.ocrText) {
      throw new ValidationError("Document has not been analyzed yet");
    }

    const workflow = await this.runWorkflow(document, document.ocrText);

    return workflow.anomalies.length > 0
      ? {
          anomalies: workflow.anomalies,
          deterministicAnomalies: workflow.deterministicAnomalies,
          riskScore: workflow.riskScore,
          riskLevel: workflow.riskLevel
        }
      : {
          anomalies: [
            {
              type: "manual_review",
              severity: "low",
              description: "No strong automated anomaly detected in the current ruleset.",
              affectedField: "document",
              confidence: 0.55,
              suggestedAction: "Perform normal underwriting review.",
            },
          ],
          deterministicAnomalies: [],
          riskScore: workflow.riskScore,
          riskLevel: workflow.riskLevel
        };
  }

  /**
   * Compute fraud risk score from document anomalies list
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async calculateRiskScore(documentId: any, userId: any) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);
    const text = document.ocrText || (await this.performOCRAnalysis(document.filePath)).text;
    const workflow = await this.runWorkflow(document, text);

    return {
      documentId: document._id,
      anomalies: workflow.anomalies,
      deterministicAnomalies: workflow.deterministicAnomalies,
      historicalContext: workflow.historicalContext,
      riskScore: workflow.riskScore,
      riskLevel: workflow.riskLevel,
      recommendations: workflow.anomalies.map(a => a.suggestedAction).filter(Boolean)
    };
  }

  /**
   * Real OCR execution using OcrWorker
   * @param filePath Local path to file
   */
  async performOCRAnalysis(filePath: string) {
    const ocrWorker = new (await import("../infrastructure/ocr/ocr-worker.js")).OcrWorker();
    return ocrWorker.processFile(filePath);
  }

  /**
   * Run the backend AI Langchain parsing/fraud workflows along with deterministic rules
   * @param document Document db object
   * @param text OCR extracted text block
   */
  async runWorkflow(document: any, text: string) {
    const rawHistorical = await this.historicalRepository.findAll({}, { sort: { createdAt: -1 }, limit: 5 });
    const historicalRecords = normalizeHistoricalRecords(rawHistorical);

    // Run AI analysis
    const aiWorkflow = await runDocumentAnalysisWorkflow({ document, text, historicalRecords });

    // Run deterministic rules
    const deterministicAnomalies = await this.anomalyDetectionService.evaluateDocument(
      document,
      aiWorkflow.structuredData,
      rawHistorical
    );

    // Combine anomalies
    const allAnomalies = [...aiWorkflow.anomalies, ...deterministicAnomalies];

    // Compute composite risk score
    const compositeRiskScore = this.compositeScorer.calculateRiskScore(allAnomalies);
    const riskLevel = this.compositeScorer.determineRiskLevel(compositeRiskScore);

    return {
      ...aiWorkflow,
      anomalies: allAnomalies,
      deterministicAnomalies,
      riskScore: compositeRiskScore,
      riskLevel: riskLevel
    };
  }
}
