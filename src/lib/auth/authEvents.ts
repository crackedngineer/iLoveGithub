import { type User } from "next-auth";
import { sendWelcomeEmail, sendWelcomeBackEmail } from "@/lib/mailer";

// Handle user creation and welcome email
async function handleUserCreation(user: User): Promise<void> {
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

// Handle returning user login
async function handleReturningUser(user: User): Promise<void> {
  try {
    if (!user.email) {
      console.warn("Returning user without email address, skipping welcome back email");
      return;
    }
    
    // Get the last login time from your database
    // This is just a placeholder - implement your database query
    const lastLogin = await getUserLastLogin(user.id);
    const daysSinceLastLogin = calculateDaysBetween(lastLogin, new Date());
    
    // Only send welcome back email if it's been more than 30 days
    if (daysSinceLastLogin > 30) {
      console.log(`Sending welcome back email to returning user: ${user.email}`);
      await sendWelcomeBackEmail(user.email, user.name ?? "GitHub User", lastLogin);
      console.log(`Welcome back email successfully queued for ${user.email}`);
    } else {
      console.log(`User ${user.email} returned within 30 days, skipping welcome back email`);
    }
    
    // Update the last login time in your database
    await updateUserLastLogin(user.id);
  } catch (error) {
    console.error("Failed to process returning user:", error);
  }
}

// Database helper functions (implement these based on your database)
async function getUserLastLogin(userId: string): Promise<Date> {
  // Example implementation with Prisma
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   select: { lastLogin: true }
  // });
  // return user?.lastLogin || new Date(0);
  
  // Placeholder implementation
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago as example
}

async function updateUserLastLogin(userId: string): Promise<void> {
  // Example implementation with Prisma
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { lastLogin: new Date() }
  // });
  
  // Placeholder implementation
  console.log(`Updated last login for user ${userId} to ${new Date().toISOString()}`);
}

function calculateDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// NextAuth events configuration
const authEvents = {
  createUser: async ({ user }: { user: User }) => {
    await handleUserCreation(user);
  },
  signIn: async ({ user, account, isNewUser }: { user: User; account: any; isNewUser?: boolean }) => {
    if (isNewUser) {
      console.log(`New user signed in: ${user.email}`);
      // Initial sign-in is handled by createUser event
    } else {
      console.log(`Returning user signed in: ${user.email}`);
      await handleReturningUser(user);
    }
  },
};

export default authEvents;