import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after sign in
      if (account) {
        token.accessToken = account.access_token;
        token.githubProfile = profile;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.githubProfile = token.githubProfile;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };