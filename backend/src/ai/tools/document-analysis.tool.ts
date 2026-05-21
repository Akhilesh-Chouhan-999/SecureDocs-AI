import { Tool } from "@langchain/core/tools";

export class DocumentAnalysisTool extends Tool {
  name = "document-analysis";
  description = "Analyzes a document for fraud.";

  protected async _call(arg: any): Promise<string> {
    return "Document analysis result.";
  }
}
