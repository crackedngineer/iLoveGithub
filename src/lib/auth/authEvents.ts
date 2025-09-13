import {sendWelcomeEmail} from "../mailer";
import {sendWelcomeBackEmail} from "../mailer";
import {User} from "next-auth";

export async function handleUserCreation(user: User): Promise<void> {
  try {
    if (!user.email) {
      console.warn("User created without email address, skipping welcome email");
      return;
    }

    console.log(`Sending welcome email to new user: ${user.email}`);
    await sendWelcomeEmail(user.email, user.name ?? "GitHub User");
    console.log(`Welcome email successfully queued for ${user.email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function handleReturningUser(user: User): Promise<void> {
  try {
    if (!user.email) {
      console.warn("Returning user without email address, skipping welcome back email");
      return;
    }

    console.log(`Sending welcome back email to returning user: ${user.email}`);
    await sendWelcomeBackEmail(user.email, user.name ?? "GitHub User");
    console.log(`Welcome back email successfully queued for ${user.email}`);
  } catch (error) {
    console.error("Failed to process returning user:", error);
  }
}

// NextAuth events configuration
const authEvents = {
  createUser: async ({user}: {user: User}) => {
    await handleUserCreation(user);
  },
  signIn: async ({user, account, isNewUser}: {user: User; account: any; isNewUser?: boolean}) => {
    if (!isNewUser) {
      console.log(`Returning user signed in: ${user.email}`);
      await handleReturningUser(user);
    }
  },
};

export default authEvents;
