"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { appVersion } from "@/lib/version";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  // Show loader for a fixed duration on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Logout if session is unauthenticated but contains accessToken (invalid state)
  useEffect(() => {
    if (status !== "unauthenticated" || !session || !("accessToken" in session))
      return;

    const logoutTimer = setTimeout(() => {
      console.warn("No valid token, logging out...");
      setIsLoggingOut(true);
      signOut({ callbackUrl: "/" });
    }, 4500);

    return () => clearTimeout(logoutTimer);
  }, [status, session]);

  const shouldShowLoader =
    showInitialLoader || status === "loading" || isLoggingOut;

  return shouldShowLoader ? <Loader version={appVersion} /> : <>{children}</>;
}
