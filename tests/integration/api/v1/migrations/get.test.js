import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations(3); // Run just the necessary migrations for create user and session
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration".',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const defaultUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(defaultUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration".',
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("With `read:migration`", async () => {
      const privilegedUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(activatedUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
      expect(Object.keys(responseBody[0])).toEqual(["name", "timestamp"]);
    });
  });
});
