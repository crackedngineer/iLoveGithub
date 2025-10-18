"use client";

import {useEffect, useState} from "react";
import Loader from "./Loader";
import {useAuth} from "./AuthProvider";

export default function AuthGuard({children}: {children: React.ReactNode}) {
  const {loading} = useAuth();
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoader = showInitialLoader || loading;

  return shouldShowLoader ? <Loader /> : <>{children}</>;
}
