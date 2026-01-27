import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database).toBeDefined();
      const databaseConfig = responseBody.dependencies.database;

      expect(databaseConfig.max_connections).toEqual(100);
      expect(databaseConfig.opened_connections).toEqual(1);
      expect(databaseConfig.version).toEqual("16.0");
    });
  });
});
