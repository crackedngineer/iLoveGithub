"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  fetchRateLimit,
  RateLimitError,
  RateLimitResponse,
} from "@/services/githubService";

interface ApiLimitContextType {
  rateLimit: RateLimitResponse | null;
  isApiLimitLoading: boolean;
  apiLimitError: string | null;
  remaining: number;
  limit: number;
  used: number;
  reset: number;
  getPercentage: () => number;
  getColor: () => string;
  getResetTime: () => string;
}

const ApiLimitContext = createContext<ApiLimitContextType | undefined>(
  undefined
);

export const ApiLimitProvider = ({ children }: { children: ReactNode }) => {
  const [rateLimit, setRateLimit] = useState<RateLimitResponse | null>(null);
  const [isApiLimitLoading, setIsApiLimitLoading] = useState(false);
  const [apiLimitError, setApiLimitError] = useState<string | null>(null);

  useEffect(() => {
    const checkRateLimit = async () => {
      setIsApiLimitLoading(true);
      try {
        const limitData = await fetchRateLimit();
        setRateLimit(limitData);

        if (limitData.remaining === 0) {
          throw new RateLimitError(limitData);
        }
      } catch (err: any) {
        const message =
          err instanceof RateLimitError
            ? "GitHub API rate limit exceeded."
            : "Failed to fetch GitHub rate limit.";
        setApiLimitError(message);
      } finally {
        setIsApiLimitLoading(false);
      }
    };

    checkRateLimit();
  }, []);

  const getPercentage = () =>
    rateLimit ? Math.round((rateLimit.remaining / rateLimit.limit) * 100) : 0;

  const getColor = () => {
    const percent = getPercentage();
    if (percent > 50) return "github-green";
    if (percent > 20) return "yellow-500";
    return "red-500";
  };

  const getResetTime = () => {
    if (!rateLimit) return "N/A";
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = rateLimit.reset - now;
    if (secondsRemaining <= 0) return "Resetting now...";
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <ApiLimitContext.Provider
      value={{
        rateLimit,
        isApiLimitLoading,
        apiLimitError,
        remaining: rateLimit?.remaining ?? 0,
        limit: rateLimit?.limit ?? 60,
        used: rateLimit?.used ?? 0,
        reset: rateLimit?.reset ?? 0,
        getPercentage,
        getColor,
        getResetTime,
      }}
    >
      {children}
    </ApiLimitContext.Provider>
  );
};

export const useApiLimit = () => {
  const context = useContext(ApiLimitContext);
  if (!context) {
    throw new Error("useApiLimit must be used within an ApiLimitProvider");
  }
  return context;
};
