import { jest, describe, beforeEach, afterEach, it, expect } from "@jest/globals";

const mockSendMail = jest.fn().mockResolvedValue({ messageId: "123" } as never);
const mockCreateTestAccount = jest.fn().mockResolvedValue({ user: "test@ethereal.email", pass: "password" } as never);
const mockCreateTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail } as never);

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTestAccount: mockCreateTestAccount,
    createTransport: mockCreateTransport,
    getTestMessageUrl: jest.fn().mockReturnValue("http://ethereal.url")
  }
}));

describe("NotificationService", () => {
  let service: any;
  let nodemailer: any;

  beforeEach(async () => {
    nodemailer = (await import("nodemailer")).default;
    const { NotificationService } = await import("../notification.service.js");
    service = new NotificationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize ethereal email for development", async () => {
    await new Promise(process.nextTick);
    
    expect(mockCreateTestAccount).toHaveBeenCalled();
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.ethereal.email",
      })
    );
  });

  it("should send analysis complete email", async () => {
    await new Promise(process.nextTick);

    await service.sendAnalysisCompleteEmail("user@example.com", "doc-123", "low");

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: expect.stringContaining("Analysis Complete"),
        html: expect.stringContaining("low"),
      })
    );
  });

  it("should send critical fraud alert email", async () => {
    await new Promise(process.nextTick);

    await service.sendCriticalFraudAlert("admin@example.com", "doc-999", 95);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@example.com",
        subject: expect.stringContaining("CRITICAL RISK DETECTED"),
        html: expect.stringContaining("95/100"),
      })
    );
  });
});
