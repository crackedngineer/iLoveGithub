"use client";

import {useEffect, useState} from "react";
import Loader from "./Loader";
import {useAuth} from "./AuthProvider";

export default function AuthGuard({children}: {children: React.ReactNode}) {
  const {session, signOut, loading} = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session || !("accessToken" in session)) return;

    const logoutTimer = setTimeout(() => {
      console.warn("No valid token, logging out...");
      setIsLoggingOut(true);
      signOut();
    }, 4500);

    return () => clearTimeout(logoutTimer);
  }, [session, signOut]);

  const shouldShowLoader = showInitialLoader || loading || isLoggingOut;

  return shouldShowLoader ? <Loader /> : <>{children}</>;
}
