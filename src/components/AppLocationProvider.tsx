"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const isWithinIndia = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= 6.5546 &&
    latitude <= 35.6745 &&
    longitude >= 68.1114 &&
    longitude <= 97.3956
  );
};

type LocationContextType = {
  isInIndia: boolean | null;
  timeZone: string;
  error: string | null;
  loading: boolean;
};

const AppLocationContext = createContext<LocationContextType | undefined>(
  undefined
);

type Props = {
  children: ReactNode;
};

export const AppLocationProvider = ({ children }: Props) => {
  const [isInIndia, setIsInIndia] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const inIndia = isWithinIndia(coords.latitude, coords.longitude);
        setIsInIndia(inIndia);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  }, []);

  return (
    <AppLocationContext.Provider
      value={{ isInIndia, timeZone, error, loading }}
    >
      {children}
    </AppLocationContext.Provider>
  );
};

export const useAppLocation = (): LocationContextType => {
  const context = useContext(AppLocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
