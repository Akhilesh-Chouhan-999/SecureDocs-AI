import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import * as pdfParseModule from "pdf-parse";
import LanguageDetect from "languagedetect";
import { NotFoundError, ValidationError } from "../../errors/index.js";
import { logger } from "../../logs/index.js";

const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
const lngDetector = new LanguageDetect();

export class OcrWorker {

  private imageExtensions = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
    ".webp",
    ".bmp",
  ]);

  async processFile(filePath: string) {
    const extension = path.extname(String(filePath || "")).toLowerCase();
    const startTime = Date.now();

    logger.info("OCR Worker started", { filePath });

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    if (extension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      // Multi-page PDF handling optimization (Limit to 10 pages max to prevent memory exhaustion)
      const parsedData = await pdfParse(dataBuffer, { max: 10 });
      const duration = Date.now() - startTime;
      logger.info("OCR Worker completed (PDF text extraction)", {
        filePath,
        durationMs: duration,
        confidence: 1.0,
      });

      return {
        text: parsedData.text || "",
        confidence: 1.0,
        warning: null,
        words: [] as string[],
        structuredData: this.parseStructuredData(parsedData.text || ""),
      };
    } else if (this.imageExtensions.has(extension)) {
      const worker = await Tesseract.createWorker("eng");

      try {
        const result = await worker.recognize(filePath);
        const text = String(result.data.text || "").trim();
        const confidence = Number(result.data.confidence || 0) / 100;
        const words = (result.data.words || [])
          .map((word: any) => String(word.text || "").trim())
          .filter(Boolean);

        const duration = Date.now() - startTime;
        logger.info("OCR Worker completed (Tesseract image)", {
          filePath,
          durationMs: duration,
          confidence,
        });

        if (confidence < 0.8) {
          throw new ValidationError(
            "OCR confidence is too low (less than 80%)",
            { confidence, filePath },
          );
        }

        return {
          text,
          confidence,
          warning: null,
          words,
          structuredData: this.parseStructuredData(text),
        };
      } finally {
        await worker.terminate();
      }
    }

    // Default Fallback for unsupported types
    const text = `Unsupported file type. Source file: ${filePath}`;
    return {
      text,
      confidence: 0,
      warning: "Unsupported format",
      words: [] as string[],
      structuredData: {},
    };
  }

  private parseStructuredData(text: string) {
    const structuredData: any = {};

    // 1. Language Detection
    const detectedLangs = lngDetector.detect(text, 1);
    structuredData.language =
      detectedLangs.length > 0 ? detectedLangs[0][0] : "unknown";

    // 2. Extract Borrower
    const borrowerMatch = text.match(/Borrower:\s*(.+)/i);
    if (borrowerMatch) {
      structuredData.borrowerName = borrowerMatch[1].trim();
    }

    // 3. Extract Income
    const incomeMatch = text.match(/Income:\s*(\d+)/i);
    if (incomeMatch) {
      structuredData.declaredIncome = parseInt(incomeMatch[1], 10);
    }

    // 4. Extract Date
    const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      structuredData.documentDate = dateMatch[1].trim();
    }

    // 5. Advanced Segmentation (Headers, Footers, Tables)
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (lines.length > 0) {
      structuredData.header = lines.slice(0, 3).join("\n");
      structuredData.footer = lines.slice(-3).join("\n");
    }

    // Attempt to locate a basic tabular section (lines with multiple spacing)
    const tableLines = lines.filter((line) => line.match(/(?:\s{2,}|\t)/g));
    if (tableLines.length > 2) {
      structuredData.tableDetected = true;
      structuredData.tabularData = tableLines.slice(0, 5); // Store snippet of table
    } else {
      structuredData.tableDetected = false;
    }

    return structuredData;
  }

}
