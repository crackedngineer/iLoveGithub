"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { appVersion } from "@/lib/version";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Check if session is unauthenticated and if there's no access token
      if (status === "unauthenticated" && session && "accessToken" in session) {
        console.log("No valid token, logging out...");
        setIsLoggingOut(true); // Set logout state
        signOut({ callbackUrl: "/" }); // Redirect to home or login page after logout
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [status, session]);

  // While session is loading, display a loading spinner or message
  if (status === "loading" || isLoggingOut) {
    return <Loader version={appVersion} />;
  }

  return <>{children}</>;
}
