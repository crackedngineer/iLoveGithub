import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    githubProfile?: any;
  }
  interface User {
    id: string;
    githubId: string;
    email: string;
    name?: string;
    username: string;
  }

  interface Profile {
    login?: string;
  }

  interface JWT {
    username?: string;
  }
}
