"use client";

import {useEffect} from "react";
import {appVersion} from "@/lib/version";
import {RECENT_REPO_LOCAL_STORAGE_KEY} from "@/constants";

const AppVersionSync = () => {
  useEffect(() => {
    const LOCAL_STORAGE_KEY = "app_version";

    const storedVersion = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedVersion !== appVersion) {
      // New deployment detected
      localStorage.removeItem(RECENT_REPO_LOCAL_STORAGE_KEY);
      localStorage.setItem(LOCAL_STORAGE_KEY, appVersion);
      console.log("Cleared localStorage due to version change.");
    }
  }, []);

  return null;
};

export default AppVersionSync;
