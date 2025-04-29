"use client";

import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if session is unauthenticated and if there's no access token
    if (status === "unauthenticated" && session && "accessToken" in session) {
      console.log("No valid token, logging out...");
      setIsLoggingOut(true); // Set logout state
      signOut({ callbackUrl: "/" }); // Redirect to home or login page after logout
    }
  }, [status, session]);

  // While session is loading, display a loading spinner or message
  if (status === "loading" || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Warming things up...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
