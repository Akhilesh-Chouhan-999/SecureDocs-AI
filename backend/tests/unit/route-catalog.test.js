import { routeCatalog } from "../../src/docs/index.js";

describe("route catalog", () => {
  it("includes the newly added workflow routes", () => {
    const paths = routeCatalog.map((route) => `${route.method} ${route.path}`);

    expect(paths).toContain("GET /api/history");
    expect(paths).toContain("POST /api/reports/:reportId/review");
    expect(paths).toContain("POST /api/jobs/:jobId/retry");
  });

  it("keeps the documented route count in sync", () => {
    expect(routeCatalog).toHaveLength(36);
  });
});
