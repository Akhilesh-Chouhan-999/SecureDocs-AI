import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

class ReportGenerationAgent {
  static async generateReport(fraudAnalysis: any, documentData: any) {
    try {
      const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY || "test-api-key",
        modelName: "gpt-4",
        temperature: 0.4,
      });

      const template = `
Generate a professional fraud risk report based on the analysis:

Document: {documentType}
Customer: {customerName}
Analysis Date: {date}

FRAUD ANALYSIS:
{analysis}

ANOMALIES DETECTED:
{anomalies}

RISK SCORE: {riskScore}/100
RISK LEVEL: {riskLevel}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Red Flags Identified
4. Recommendations
5. Confidence Level

Format as clean, professional text suitable for bank underwriters.
      `;

      const prompt = PromptTemplate.fromTemplate(template);
      const parser = new StringOutputParser();
      
      const chain = prompt.pipe(llm as any).pipe(parser as any);

      const reportText = await chain.invoke({
        documentType: documentData.documentType || "Unknown",
        customerName: documentData.ownerName || "Unknown",
        date: new Date().toLocaleDateString(),
        analysis: fraudAnalysis.summary || "No summary provided",
        anomalies: JSON.stringify(fraudAnalysis.anomalies || []),
        riskScore: fraudAnalysis.riskScore,
        riskLevel: fraudAnalysis.riskLevel,
      });

      return {
        reportText,
        timestamp: new Date(),
        documentId: documentData._id,
      };
    } catch (error: any) {
      console.error("Report Generation Error:", error);
      throw error;
    }
  }
}

export default ReportGenerationAgent;
