import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { type JWT } from "next-auth/jwt";
import { Session, User, Account, Profile } from "next-auth";
import authEvents from "@/lib/auth/authEvents";

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
      try {
        user.username = profile?.login ?? "GitHubUser";
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Returning false redirects to `pages.error` page
      }
    },

    async jwt({ token, account, profile }): Promise<ExtendedToken> {
      try {
        if (account && profile) {
          return {
            ...token,
            accessToken: account.access_token,
            githubProfile: profile,
          };
        }
        return token as ExtendedToken;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        throw new Error("JWT callback error");
      }
    },

    async session({ session, token }): Promise<ExtendedSession> {
      try {
        const extendedToken = token as ExtendedToken;

        return {
          ...session,
          accessToken: extendedToken.accessToken,
          githubProfile: extendedToken.githubProfile,
        };
      } catch (error) {
        console.error("Error in session callback:", error);
        throw new Error("Session callback error");
      }
    },
  },
  events: {
    createUser: authEvents.createUser,
    signIn: authEvents.signIn,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: process.env.NODE_ENV === "development",
};
