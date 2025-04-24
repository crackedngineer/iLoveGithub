"use client"
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define types for AdSense window object
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  adSlot: string;
}

export default function AdBanner({ adSlot }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    try {
      if (isVisible && !isHidden) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error(err);
    }
  }, [isVisible, isHidden]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="relative">
        <button 
          onClick={toggleVisibility}
          className="absolute -top-8 right-4 bg-white dark:bg-gray-800 p-2 rounded-t-lg border border-gray-200 dark:border-gray-700 border-b-0 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isVisible ? "Hide ad" : "Show ad"}
        >
          {isVisible ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronUp size={16} />
          )}
        </button>
        
        <div className="p-2">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9989179882825871"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}