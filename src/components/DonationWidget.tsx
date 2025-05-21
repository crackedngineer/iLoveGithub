"use client";

import React, { useState } from "react";
import { Heart, X, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAppLocation } from "./AppLocationProvider";
import DonationModal from "./DonationModal";

const DonationWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [showBuyMePopover, setShowBuyMePopover] = useState(false);
  const { isInIndia } = useAppLocation();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setShowBuyMePopover(false);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-md bg-pink-600 text-white hover:bg-pink-500 transition-all duration-300 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            aria-label={
              isOpen ? "Close donation menu" : "Donate and support us"
            }
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Heart className="h-5 w-5 text-red-300" fill="currentColor" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className={`w-80 sm:w-72 p-0 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-xl transition-all duration-300 overflow-hidden ${
            showBuyMePopover ? "h-[420px]" : "h-auto"
          }`}
        >
          {!showBuyMePopover ? (
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Support Us
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                  Help us keep building great tools.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1 pt-0 pb-2">
                <Button
                  onClick={() => setShowBuyMePopover(true)}
                  className="w-full justify-start text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  variant="ghost"
                >
                  <Coffee className="h-4 w-4 mr-2 text-yellow-600" />
                  Buy me a coffee
                </Button>

                <Button
                  onClick={() => {
                    setIsOpen(false);
                    setIsDonationModalOpen(true);
                  }}
                  className="w-full justify-start text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  variant="ghost"
                >
                  <Heart className="h-4 w-4 mr-2 text-blue-600" />
                  {isInIndia ? "Support via UPI" : "Make a donation"}
                </Button>
              </CardContent>

              <CardFooter className="pt-0 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  Maybe later
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="w-full overflow-hidden rounded-lg bg-white dark:bg-gray-900">
              <div className="w-full h-[370px] overflow-hidden">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                    {/* Replace this with a spinner if desired */}
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <iframe
                  onLoad={() => setIframeLoaded(true)}
                  src="https://www.buymeacoffee.com/widget/page/crackedngineer?description=Support%20me%20on%20Buy%20me%20a%20coffee!&color=%231a1a1a&font-color=%23ffffff&btn-color=%23ffdd00"
                  className="w-full h-full border-0"
                  allowTransparency
                  loading="lazy"
                />
              </div>
              <div className="p-2 border-t dark:border-gray-700">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    setShowBuyMePopover(false);
                    setIframeLoaded(false); // reset for next time
                  }}
                >
                  ← Back
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        isIndiaLocation={isInIndia}
      />
    </div>
  );
};

export default DonationWidget;
