import dbConnect from "@/lib/mongoose";
import { User as UserModel } from "@/models/User";
import { sendWelcomeEmail, sendWelcomeBackEmail } from "../mailer";
import { User } from "next-auth";

function calculateDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function createUser({id, email, name, username}: {id: string, email: string, name: string, username: string}) {
  await dbConnect();
  const now = new Date();
  const userDoc = await UserModel.create({
    githubId: id,
    email: email,
    name: name,
    lastLogin: now,
    username: username,
  });
  return userDoc;
}

async function getUserLastLogin(username: string): Promise<Date> {
  await dbConnect();
  const user = await UserModel.findOne({ username: username }).select(
    "lastLogin"
  );

  // If user exists, return the lastLogin, otherwise return a default date
  return user?.lastLogin || new Date(0);
}

async function updateUserLastLogin(username: string): Promise<void> {
  await dbConnect();
  await UserModel.findOneAndUpdate(
    { username: username },
    { lastLogin: new Date() },
    { new: true }
  );
}

export async function handleUserCreation(user: User): Promise<void> {
  try {
    await dbConnect();

    if (!user.email) {
      console.warn(
        "User created without email address, skipping welcome email"
      );
      return;
    }

    console.log(`Sending welcome email to new user: ${user.email}`);
    await sendWelcomeEmail(user.email, user.name ?? "GitHub User");
    console.log(`Welcome email successfully queued for ${user.email}`);

    // Initialize lastLogin on creation (optional)
    await UserModel.findByIdAndUpdate(user.id, { lastLogin: new Date() });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function handleReturningUser(user: User): Promise<void> {
  try {
    await dbConnect();

    if (!user.email) {
      console.warn(
        "Returning user without email address, skipping welcome back email"
      );
      return;
    }

    // Find user by GitHub/NextAuth ID (authId)
    let userDoc = await UserModel.findOne({ username: user.username });

    // If user not found, create new user
    if (!userDoc) {
      console.log(`User ${user.email} not found. Creating new user.`);
      userDoc = await createUser({
        id: user.id,
        email: user.email,
        name: user.name ?? "GitHub User",
        username: user.username,
      });
      console.log(`User created in DB for ${user.email}`);
    }

    const lastLogin = await getUserLastLogin(user.username);
    const daysSinceLastLogin = calculateDaysBetween(lastLogin, new Date());

    if (daysSinceLastLogin > 30) {
      console.log(
        `Sending welcome back email to returning user: ${user.email}`
      );
      await sendWelcomeBackEmail(
        user.email,
        user.name ?? "GitHub User",
        lastLogin
      );
      console.log(`Welcome back email successfully queued for ${user.email}`);
    } else {
      console.log(
        `User ${user.email} returned within 30 days, skipping welcome back email`
      );
    }

    await updateUserLastLogin(user.id);
  } catch (error) {
    console.error("Failed to process returning user:", error);
  }
}

// NextAuth events configuration
const authEvents = {
  createUser: async ({ user }: { user: User }) => {
    await handleUserCreation(user);
  },
  signIn: async ({
    user,
    account,
    isNewUser,
  }: {
    user: User;
    account: any;
    isNewUser?: boolean;
  }) => {
    if (!isNewUser) {
      console.log(`Returning user signed in: ${user.email}`);
      await handleReturningUser(user);
    }
  },
};

export default authEvents;
