// Create a new file: src/app/api/auth/[...nextauth]/auth.ts
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
      user.username = profile?.login ?? "GitHubUser"; // GitHub username
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
  events: {
    createUser: authEvents.createUser,
    signIn: authEvents.signIn,
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
