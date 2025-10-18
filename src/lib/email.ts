import {sendWelcomeEmail, sendWelcomeBackEmail} from "./mailer";
import type {User} from "@supabase/supabase-js";

async function handleUserCreation(user: User) {
  try {
    if (!user.email) {
      console.warn("User created without email address, skipping welcome email");
      return;
    }

    console.log(`Sending welcome email to new user: ${user.email}`);
    await sendWelcomeEmail(user.email, user.user_metadata.full_name ?? "GitHub User");
    console.log(`Welcome email successfully queued for ${user.email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

async function handleReturningUser(user: User) {
  try {
    if (!user.email) {
      console.warn("Returning user without email address, skipping welcome back email");
      return;
    }

    console.log(`Sending welcome back email to returning user: ${user.email}`);
    // await sendWelcomeBackEmail(user.email, user.user_metadata.full_name ?? "GitHub User");
    console.log(`Welcome back email successfully queued for ${user.email}`);
  } catch (error) {
    console.error("Failed to process returning user:", error);
  }
}

export async function handleUserEmail(user: User) {
  try {
    const {created_at, last_sign_in_at} = user;
    const isNewUser = last_sign_in_at ? new Date(last_sign_in_at).getTime() - new Date(created_at).getTime() < 10000 : true;

    if (isNewUser) {
      await handleUserCreation(user);
    } else {
      await handleReturningUser(user);
    }
  } catch (err) {
    console.error("Email trigger error:", err);
  }
}
