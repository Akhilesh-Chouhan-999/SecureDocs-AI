import { jest } from "@jest/globals";
// Setup file for Jest
jest.mock("bull", () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "mock-job-123" }),
    process: jest.fn(),
    on: jest.fn(),
    getJob: jest.fn().mockResolvedValue({
      getState: jest.fn().mockResolvedValue("completed"),
      progress: jest.fn().mockReturnValue(100),
      data: {}
    }),
    close: jest.fn()
  }));
});
