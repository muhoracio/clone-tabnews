import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import { v4 as uuid, version as uuidVersion } from "uuid";
import activation from "models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent token", async () => {
      const randomActivationToken = uuid();
      const activationTokenResponse = await fetch(
        `http://localhost:3000/api/v1/activations/${randomActivationToken}`,
        {
          method: "PATCH",
        },
      );
      expect(activationTokenResponse.status).toBe(404);

      const activationTokenResponseBody = await activationTokenResponse.json();
      expect(activationTokenResponseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With expired token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILISECONDS),
      });

      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      jest.useRealTimers();

      const activationTokenResponse = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(activationTokenResponse.status).toBe(404);

      const activationTokenResponseBody = await activationTokenResponse.json();
      expect(activationTokenResponseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With already used token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const activationTokenResponse1 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(activationTokenResponse1.status).toBe(200);

      const activationTokenResponse2 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(activationTokenResponse2.status).toBe(404);

      const activationTokenResponse2Body =
        await activationTokenResponse2.json();
      expect(activationTokenResponse2Body).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With valid token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const activationTokenResponse = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(activationTokenResponse.status).toBe(200);

      const activationTokenResponseBody = await activationTokenResponse.json();

      expect(uuidVersion(activationTokenResponseBody.id)).toBe(4);
      expect(uuidVersion(activationTokenResponseBody.user_id)).toBe(4);
      expect(activationTokenResponseBody.user_id).toBe(createdUser.id);

      expect(Date.parse(activationTokenResponseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(activationTokenResponseBody.used_at)).not.toBeNaN();
      expect(Date.parse(activationTokenResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(activationTokenResponseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(activationTokenResponseBody.expires_at);
      const createdAt = new Date(activationTokenResponseBody.created_at);

      const expirationTimeInMilisseconds = expiresAt - createdAt;
      expect(
        activation.EXPIRATION_IN_MILISECONDS - expirationTimeInMilisseconds,
      ).toBeLessThan(1000);

      const activatedUser = await user.findOneByUsername(createdUser.username);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);
    });

    test("With valid token, but already activated user", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não pode mais utilizar tokens de ativação.",
        action: "Entre em contato com o suporte.",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With valid token, but already logged in user", async () => {
      const user1 = await orchestrator.createUser();
      await orchestrator.activateUser(user1);
      const user1SessionObject = await orchestrator.createSession(user1.id);

      const user2 = await orchestrator.createUser();
      const user2ActivationToken = await activation.create(user2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${user2ActivationToken.id}`,
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${user1SessionObject.token}`,
          },
        },
      );
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action:
          'Verifique se o seu usuário possui a feature "read:activation_token".',
        status_code: 403,
      });
    });
  });
});
