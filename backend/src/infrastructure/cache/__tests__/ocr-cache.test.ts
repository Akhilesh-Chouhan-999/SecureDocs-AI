import { jest } from "@jest/globals";

// Mock ioredis using unstable_mockModule for ESM
jest.unstable_mockModule("ioredis", () => {
  return {
    default: jest.fn().mockImplementation(() => {
      const store = new Map();
      return {
        get: jest.fn(async (key: string) => store.get(key) || null),
        set: jest.fn(async (key: string, value: string) => store.set(key, value)),
        on: jest.fn(),
      };
    }),
  };
});

describe("OCR Cache Layer", () => {
  let ocrCache: any;

  beforeAll(async () => {
    const module = await import("../ocr-cache.js");
    ocrCache = module.ocrCache;
  });

  it("should return null on cache miss", async () => {
    const result = await ocrCache.get("missing-doc-id");
    expect(result).toBeNull();
  });

  it("should successfully set and retrieve OCR results", async () => {
    const mockData = { text: "Hello World", confidence: 1.0 };
    await ocrCache.set("doc-123", mockData);

    const result = await ocrCache.get("doc-123");
    expect(result).toBeDefined();
    expect(result.text).toBe("Hello World");
    expect(result.confidence).toBe(1.0);
  });
});
