import nodemailer, { Transporter } from "nodemailer";
import { logger } from "../logs/index.js";

/**
 * Service managing email notifications (using Ethereal for development)
 */
export class NotificationService {

  private transporter: Transporter | null = null;
  private initialized = false;

  constructor() {
    this.init().catch((err) => {
      logger.error("Failed to initialize NotificationService", err);
    });
  }

  /**
   * Initializes the SMTP transporter. For development, we auto-create an Ethereal account.
   */
  private async init() {
    try {
      if (process.env.NODE_ENV === "production") {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Generate test SMTP service account from ethereal.email
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`Ethereal Email initialized: ${testAccount.user}`);
      }
      this.initialized = true;
    } catch (error) {
      logger.error("Failed to setup nodemailer transporter", error);
      throw error;
    }
  }

  /**
   * Send an email detailing the completion of a document analysis
   */
  async sendAnalysisCompleteEmail(
    email: string,
    documentId: string,
    riskLevel: string,
  ) {
    if (!this.initialized || !this.transporter) {
      logger.warn(
        "NotificationService not fully initialized, skipping email delivery.",
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"SecureDocs AI" <noreply@securedocs.ai>',
        to: email,
        subject: `Analysis Complete: Document ${documentId.slice(-6)}`,
        html: `
          <h2>Document Analysis Completed</h2>
          <p>Your document (ID: ${documentId}) has been successfully processed.</p>
          <p><strong>Resulting Risk Level:</strong> <span style="text-transform: capitalize;">${riskLevel}</span></p>
          <p>Log in to your SecureDocs dashboard to review the full details and generate a final report.</p>
        `,
      });

      logger.info(`Analysis completion email sent to ${email}`);
      if (process.env.NODE_ENV !== "production") {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      logger.error(`Failed to send analysis complete email to ${email}`, error);
      throw error;
    }
  }

  /**
   * Send an urgent alert for documents flagged with Critical risk
   */
  async sendCriticalFraudAlert(
    email: string,
    documentId: string,
    riskScore: number,
  ) {
    if (!this.initialized || !this.transporter) {
      logger.warn(
        "NotificationService not fully initialized, skipping email delivery.",
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"SecureDocs AI Security" <security@securedocs.ai>',
        to: email,
        subject: `🚨 CRITICAL RISK DETECTED: Document ${documentId.slice(-6)}`,
        html: `
          <h2 style="color: red;">Critical Fraud Alert</h2>
          <p>The system has flagged a recently uploaded document with a <strong>CRITICAL</strong> risk score.</p>
          <ul>
            <li><strong>Document ID:</strong> ${documentId}</li>
            <li><strong>Risk Score:</strong> ${riskScore}/100</li>
          </ul>
          <p>Please review this document immediately in the SecureDocs dashboard.</p>
        `,
      });

      logger.info(`Critical fraud alert email sent to ${email}`);
      if (process.env.NODE_ENV !== "production") {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      logger.error(`Failed to send critical fraud alert to ${email}`, error);
      throw error;
    }
  }

}
