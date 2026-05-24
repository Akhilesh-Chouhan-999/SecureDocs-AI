import { Document } from "@langchain/core/documents";
import { IProcessor } from "../../core/interfaces/index.js";

export class IngestionProcessor implements IProcessor<string, Document> {

  async process(filePath: string): Promise<Document> {
    // Placeholder for ingestion logic
    const content = `Processed from ${filePath}`;
    return new Document({ pageContent: content });
  }

}
