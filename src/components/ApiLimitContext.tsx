"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiLimitContextType {
  apiHits: number;
  incrementHits: () => void;
  hasReachedLimit: boolean;
  resetHits: () => void;
}

const ApiLimitContext = createContext<ApiLimitContextType | undefined>(
  undefined
);

export const ApiLimitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [apiHits, setApiHits] = useState<number>(0);

  useEffect(() => {
    const storedHits = localStorage.getItem("api_hits");
    if (storedHits) {
      setApiHits(parseInt(storedHits, 10));
    }
  }, []);

  const incrementHits = () => {
    setApiHits((prev) => {
      const newHits = prev + 1;
      localStorage.setItem("api_hits", newHits.toString());
      return newHits;
    });
  };

  const resetHits = () => {
    localStorage.setItem("api_hits", "0");
    setApiHits(0);
  };

  const hasReachedLimit =
    apiHits >= Number(process.env.NEXT_PUBLIC_MAX_REPO_LIMIT);

  return (
    <ApiLimitContext.Provider
      value={{ apiHits, incrementHits, hasReachedLimit, resetHits }}
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
