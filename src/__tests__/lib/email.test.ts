jest.mock("@/lib/mailer", () => ({
  sendWelcomeEmail: jest.fn(),
  sendWelcomeBackEmail: jest.fn(),
}));

import {handleUserEmail} from "@/lib/email";
import {sendWelcomeEmail, sendWelcomeBackEmail} from "@/lib/mailer";
import type {User} from "@supabase/supabase-js";

const mockSendWelcome = sendWelcomeEmail as jest.Mock;
const mockSendWelcomeBack = sendWelcomeBackEmail as jest.Mock;

function makeUser(overrides: Partial<User & {last_sign_in_at?: string | null}> = {}): User {
  const now = new Date().toISOString();
  return {
    id: "user-1",
    aud: "authenticated",
    email: "user@example.com",
    created_at: now,
    last_sign_in_at: null,
    user_metadata: {full_name: "Test User"},
    ...overrides,
  } as User;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "log").mockImplementation();
  jest.spyOn(console, "error").mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("handleUserEmail", () => {
  describe("new user detection", () => {
    it("sends a welcome email when last_sign_in_at is null (first sign-in)", async () => {
      mockSendWelcome.mockResolvedValueOnce(undefined);
      await handleUserEmail(makeUser({last_sign_in_at: null}));
      expect(mockSendWelcome).toHaveBeenCalledTimes(1);
      expect(mockSendWelcomeBack).not.toHaveBeenCalled();
    });

    it("sends a welcome email when last_sign_in_at is within 10 seconds of created_at", async () => {
      mockSendWelcome.mockResolvedValueOnce(undefined);
      const created_at = new Date("2024-01-01T12:00:00.000Z").toISOString();
      const last_sign_in_at = new Date("2024-01-01T12:00:05.000Z").toISOString();
      await handleUserEmail(makeUser({created_at, last_sign_in_at}));
      expect(mockSendWelcome).toHaveBeenCalledTimes(1);
    });

    it("sends a welcome-back email when last_sign_in_at is more than 10 seconds after created_at", async () => {
      mockSendWelcomeBack.mockResolvedValueOnce(undefined);
      const created_at = new Date("2024-01-01T12:00:00.000Z").toISOString();
      const last_sign_in_at = new Date("2024-01-01T13:00:00.000Z").toISOString();
      await handleUserEmail(makeUser({created_at, last_sign_in_at}));
      expect(mockSendWelcomeBack).toHaveBeenCalledTimes(1);
      expect(mockSendWelcome).not.toHaveBeenCalled();
    });
  });

  describe("email address handling", () => {
    it("passes the user's email to sendWelcomeEmail", async () => {
      mockSendWelcome.mockResolvedValueOnce(undefined);
      await handleUserEmail(makeUser({email: "hello@example.com", last_sign_in_at: null}));
      expect(mockSendWelcome).toHaveBeenCalledWith("hello@example.com", expect.any(String));
    });

    it("passes the user's full_name to sendWelcomeEmail", async () => {
      mockSendWelcome.mockResolvedValueOnce(undefined);
      const user = makeUser({
        last_sign_in_at: null,
        user_metadata: {full_name: "Alice Smith"},
      });
      await handleUserEmail(user);
      expect(mockSendWelcome).toHaveBeenCalledWith(expect.any(String), "Alice Smith");
    });

    it("falls back to 'GitHub User' when full_name is absent", async () => {
      mockSendWelcome.mockResolvedValueOnce(undefined);
      const user = makeUser({last_sign_in_at: null, user_metadata: {}});
      await handleUserEmail(user);
      expect(mockSendWelcome).toHaveBeenCalledWith(expect.any(String), "GitHub User");
    });

    it("skips sending when new user has no email address", async () => {
      const user = makeUser({email: undefined, last_sign_in_at: null});
      await handleUserEmail(user);
      expect(mockSendWelcome).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("without email"));
    });

    it("skips sending when returning user has no email address", async () => {
      const created_at = "2024-01-01T12:00:00.000Z";
      const last_sign_in_at = "2024-01-01T14:00:00.000Z";
      const user = makeUser({email: undefined, created_at, last_sign_in_at});
      await handleUserEmail(user);
      expect(mockSendWelcomeBack).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("without email"));
    });
  });

  describe("error handling", () => {
    it("does not throw when sendWelcomeEmail rejects", async () => {
      mockSendWelcome.mockRejectedValueOnce(new Error("SMTP failure"));
      await expect(handleUserEmail(makeUser({last_sign_in_at: null}))).resolves.toBeUndefined();
    });

    it("logs an error when sendWelcomeEmail rejects", async () => {
      mockSendWelcome.mockRejectedValueOnce(new Error("SMTP failure"));
      await handleUserEmail(makeUser({last_sign_in_at: null}));
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send welcome email"),
        expect.any(Error),
      );
    });
  });
});
