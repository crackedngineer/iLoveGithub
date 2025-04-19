import { generateWelcomeEmail } from "@/components/emails/templates/WelcomeEmail";
import { generateWelcomeBackEmail } from "@/components/emails/templates/WelcomeBackEmail";

function calculateDaysBetween(start: Date, end: Date): number {
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

import nodemailer from "nodemailer";

// Create a type for email options
type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// Create email transporter
const createTransporter = () => {
  // For production
  if (process.env.EMAIL_SERVER) {
    console.log(process.env.EMAIL_SERVER_USER);
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  // For development
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL,
      pass: process.env.ETHEREAL_PASSWORD,
    },
  });
};

// Send email with retry mechanism
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text } = options;
  const transporter = createTransporter();

  // Set up retry logic
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      const result = await transporter.sendMail({
        from:
          process.env.EMAIL_FROM || "iLoveGithub <no-reply@ilovegithub.com>",
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for plain text
      });

      console.log(`Email sent to ${to}: ${result.messageId}`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      console.warn(
        `Email send attempt ${retries} failed: ${lastError.message}`
      );

      // Wait before retrying
      if (retries < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  // Log the final failure
  console.error(`Failed to send email to ${to} after ${MAX_RETRIES} attempts`);
  throw lastError;
}

// Welcome email function
export async function sendWelcomeEmail(
  email: string,
  name: string = "there"
): Promise<void> {
  const htmlContent = generateWelcomeEmail({ name, email });

  const subject = `Welcome to iLoveGithub, ${name}!`;

  await sendEmail({
    to: email,
    subject,
    html: htmlContent,
  });
}

/**
 * Sends a welcome back email to returning users
 * @param email User's email address
 * @param name User's name
 * @param lastLogin User's last login date
 */
export async function sendWelcomeBackEmail(
  email: string,
  name: string = "there",
  lastLogin: Date
): Promise<void> {
  const formattedLastLogin = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(lastLogin);

  const daysSinceLastLogin = calculateDaysBetween(lastLogin, new Date());

  const htmlContent = generateWelcomeBackEmail({
    name,
    email,
    lastLogin: formattedLastLogin,
    daysSinceLastLogin,
  });

  const subject = `Welcome back to iLoveGithub, ${name}!`;

  await sendEmail({
    to: email,
    subject,
    html: htmlContent,
  });
}
