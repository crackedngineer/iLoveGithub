import React from "react";
import { BatteryLow } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiLimit } from "./ApiLimitContext";

export function RateLimitDisplay() {
  const {
    rateLimit,
    isApiLimitLoading,
    getColor,
    getPercentage,
    getResetTime,
    apiLimitError,
  } = useApiLimit();
  const percentage = getPercentage();
  const isLow = percentage < 30;
  const color = getColor();

  const getRateLimitIcon = () => {
    return <BatteryLow className={`h-4 w-4 text-${color}`} />;
  };

  if (isApiLimitLoading && !rateLimit) {
    return (
      <div className="flex items-center gap-2 px-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (apiLimitError || !rateLimit) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {getRateLimitIcon()}
            <div className="text-xs font-medium whitespace-nowrap">
              <span
                className={
                  isLow ? "text-red-500" : "text-gray-600 dark:text-gray-300"
                }
              >
                {rateLimit.remaining}/{rateLimit.limit}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              GitHub API Rate Limit
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {rateLimit.remaining} / {rateLimit.limit} remaining
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full`}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color, // Ensure `color` is a valid CSS color string
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Resets in {getResetTime()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
