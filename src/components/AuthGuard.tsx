"use client";

import Loader from "./Loader";
import {useAuth} from "./AuthProvider";

export default function AuthGuard({children}: {children: React.ReactNode}) {
  const {loading} = useAuth();

  return loading ? <Loader /> : <>{children}</>;
}
