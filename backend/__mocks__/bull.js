import { jest } from "@jest/globals";

export default jest.fn().mockImplementation(() => ({
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
