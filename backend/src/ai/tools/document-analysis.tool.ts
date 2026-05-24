import { StructuredTool } from "@langchain/core/tools";

import { z } from "zod";

export class DocumentAnalysisTool extends StructuredTool {
  schema = z.object({ input: z.string() }) as any;
  name = "document-analysis";
  description = "Analyzes a document for fraud.";

  protected async _call(arg: any): Promise<string> {
    return "Document analysis result.";
  }
}
