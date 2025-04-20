import dbConnect from "@/lib/mongoose";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { type JWT } from "next-auth/jwt";
import { User as UserModel } from "@/models/User";
import { Session, User, Account, Profile } from "next-auth";
import { createUser } from "@/lib/auth/authEvents";

interface ExtendedToken extends JWT {
  accessToken?: string;
  githubProfile?: Record<string, any>;
}

interface ExtendedSession extends Session {
  accessToken?: string;
  githubProfile?: Record<string, any>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      await dbConnect();

      if (!account || !profile) return false;

      const email = user.email;

      // // Only create user if not already in DB
      let userDoc = await UserModel.findOne({ username: user.username });

      if (!userDoc) {
        console.log(`User ${user.email} not found. Creating new user.`);
        userDoc = await createUser({
          id: user.id,
          email: user.email,
          name: user.name ?? "GitHub User",
          username: user?.username ?? "github-username",
        });
        console.log(`User created in DB for ${user.email}`);
      }

      return true;
    },

    async jwt({ token, account, profile }): Promise<ExtendedToken> {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          githubProfile: profile,
        };
      }
      return token as ExtendedToken;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedToken;

      return {
        ...session,
        accessToken: extendedToken.accessToken,
        githubProfile: extendedToken.githubProfile,
      };
    },
  },
  // Removed events block as it's no longer needed
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
