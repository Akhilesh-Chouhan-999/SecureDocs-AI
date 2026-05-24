import { Document } from "@langchain/core/documents";
import { IProcessor } from "../../core/interfaces/index.js";

export class DocumentParser implements IProcessor<Buffer, Document> {

  async process(data: Buffer): Promise<Document> {
    // Placeholder for parsing logic
    const content = data.toString("utf-8");
    return new Document({ pageContent: content });
  }

}
