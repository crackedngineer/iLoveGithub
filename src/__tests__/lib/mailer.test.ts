// Use inline jest.fn() in factories — no outer-variable references (temporal dead zone).
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

jest.mock("@/components/emails/templates/WelcomeEmail", () => ({
  generateWelcomeEmail: jest.fn().mockReturnValue("<p>Welcome!</p>"),
}));

jest.mock("@/components/emails/templates/WelcomeBackEmail", () => ({
  generateWelcomeBackEmail: jest.fn().mockReturnValue("<p>Welcome back!</p>"),
}));

import nodemailer from "nodemailer";
import {sendEmail, sendWelcomeBackEmail, sendWelcomeEmail} from "@/lib/mailer";

const mockCreateTransport = nodemailer.createTransport as jest.Mock;

/** Helper: configure what createTransport returns for the next call. */
function setupTransport(sendMailImpl = jest.fn().mockResolvedValue({messageId: "msg-id"})) {
  const transporter = {sendMail: sendMailImpl};
  mockCreateTransport.mockReturnValue(transporter);
  return {sendMail: sendMailImpl, transporter};
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "error").mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("sendEmail", () => {
  it("sends the email and resolves on success", async () => {
    const {sendMail} = setupTransport();
    await expect(
      sendEmail({to: "u@e.com", subject: "Hello", html: "<p>Hi</p>"}),
    ).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("passes recipient, subject, and html to sendMail", async () => {
    const {sendMail} = setupTransport();
    await sendEmail({to: "u@e.com", subject: "S", html: "<b>Body</b>"});
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({to: "u@e.com", subject: "S", html: "<b>Body</b>"}),
    );
  });

  it("strips HTML tags to produce a plain-text fallback when text is not provided", async () => {
    const {sendMail} = setupTransport();
    await sendEmail({to: "u@e.com", subject: "S", html: "<b>Bold</b>"});
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({text: "Bold"}));
  });

  it("uses the explicit text value when provided", async () => {
    const {sendMail} = setupTransport();
    await sendEmail({to: "u@e.com", subject: "S", html: "<b>Bold</b>", text: "Custom text"});
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({text: "Custom text"}));
  });

  it("retries up to 3 times then throws when all attempts fail", async () => {
    jest.spyOn(global, "setTimeout").mockImplementation((fn) => {
      (fn as () => void)();
      return 0 as unknown as NodeJS.Timeout;
    });
    const failingSendMail = jest.fn().mockRejectedValue(new Error("SMTP down"));
    setupTransport(failingSendMail);

    await expect(sendEmail({to: "u@e.com", subject: "S", html: "<p>H</p>"})).rejects.toThrow(
      "SMTP down",
    );
    expect(failingSendMail).toHaveBeenCalledTimes(3);
  });

  it("succeeds on the second attempt when the first attempt fails", async () => {
    jest.spyOn(global, "setTimeout").mockImplementation((fn) => {
      (fn as () => void)();
      return 0 as unknown as NodeJS.Timeout;
    });
    const partialFailSendMail = jest
      .fn()
      .mockRejectedValueOnce(new Error("Transient"))
      .mockResolvedValueOnce({messageId: "retry-id"});
    setupTransport(partialFailSendMail);

    await expect(
      sendEmail({to: "u@e.com", subject: "S", html: "<p>H</p>"}),
    ).resolves.toBeUndefined();
    expect(partialFailSendMail).toHaveBeenCalledTimes(2);
  });

  it("uses production SMTP host when EMAIL_SERVER env var is set", async () => {
    process.env.EMAIL_SERVER = "smtp://mail.example.com";
    process.env.EMAIL_SERVER_HOST = "mail.example.com";
    setupTransport();
    await sendEmail({to: "u@e.com", subject: "S", html: "<p>H</p>"});
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({host: "mail.example.com"}),
    );
    delete process.env.EMAIL_SERVER;
    delete process.env.EMAIL_SERVER_HOST;
  });
});

describe("sendWelcomeEmail", () => {
  it("sends to the given address with the user's name in the subject", async () => {
    const {sendMail} = setupTransport();
    await sendWelcomeEmail("alice@example.com", "Alice");
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@example.com",
        subject: expect.stringContaining("Alice"),
      }),
    );
  });

  it("defaults to 'there' when no name is provided", async () => {
    const {sendMail} = setupTransport();
    await sendWelcomeEmail("u@e.com");
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({subject: expect.stringContaining("there")}),
    );
  });
});

describe("sendWelcomeBackEmail", () => {
  it("sends to the given address with the user's name in the subject", async () => {
    const {sendMail} = setupTransport();
    await sendWelcomeBackEmail("bob@example.com", "Bob");
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "bob@example.com",
        subject: expect.stringContaining("Bob"),
      }),
    );
  });
});
