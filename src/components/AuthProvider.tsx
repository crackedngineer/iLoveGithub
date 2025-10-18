"use client";

import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {supabase} from "@/lib/supabaseClient";
import type {User, Session} from "@supabase/supabase-js";
import {handleUserEmail} from "@/lib/email";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen to session changes (sign in / sign out)
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // if (_event === "SIGNED_IN" && session?.user) {
      //   handleUserEmail(session.user);
      // }
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // GitHub Sign-In
  const signInWithGitHub = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("GitHub login failed:", error);
  };

  // Sign Out
  const signOut = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGitHub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Hook for easy usage
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
