"use client";
import React, {createContext, useContext, useEffect, useState} from "react";
import VideoModal from "./VideoModal";

interface DemoVideoContextType {
  openVideoModal: () => void;
}

const DemoVideoContext = createContext<DemoVideoContextType | undefined>(undefined);

export const useDemoVideo = () => {
  const context = useContext(DemoVideoContext);
  if (!context) {
    throw new Error("useDemoVideo must be used within a DemoVideoProvider");
  }
  return context;
};

export const DemoVideoProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasShownAutomatically, setHasShownAutomatically] = useState(false);

  useEffect(() => {
    // Check if the user has seen the video before
    const hasSeenVideo = localStorage.getItem("demoVideoSeen") === "true";
    const isMobile = window.innerWidth <= 768;

    if (!hasSeenVideo && !hasShownAutomatically && !isMobile) {
      // Show the video modal after 30 seconds if not seen before
      const timer = setTimeout(() => {
        setIsVideoModalOpen(true);
        setHasShownAutomatically(true);
        // Mark as seen
        localStorage.setItem("demoVideoSeen", "true");
      }, 6000); // 6 seconds

      return () => clearTimeout(timer);
    }
  }, [hasShownAutomatically]);

  // Prevent execution during SSR
  if (typeof window === "undefined") return;

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    // Mark as seen when manually opened as well
    localStorage.setItem("demoVideoSeen", "true");
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <DemoVideoContext.Provider value={{openVideoModal}}>
      {children}
      <VideoModal isOpen={isVideoModalOpen} onClose={closeVideoModal} />
    </DemoVideoContext.Provider>
  );
};

export default DemoVideoProvider;
