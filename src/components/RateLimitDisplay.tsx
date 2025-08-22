import React from "react";
import {Battery, BatteryLow, BatteryMedium} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Skeleton} from "@/components/ui/skeleton";
import {useApiLimit} from "./ApiLimitContext";

export function RateLimitDisplay() {
  const {rateLimit, isApiLimitLoading, getColor, getPercentage, getResetTime, apiLimitError} =
    useApiLimit();
  const percentage = getPercentage();
  const isLow = percentage < 30;
  const color = getColor();

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
            {percentage < 20 ? (
              <BatteryLow className={`h-4 w-4 text-${color || "gray-500"}}`} />
            ) : percentage < 50 ? (
              <BatteryMedium className={`h-4 w-4 text-${color || "gray-500"}}`} />
            ) : (
              <Battery className={`h-4 w-4 text-${color || "gray-500"}}`} />
            )}

            <div className="text-xs font-medium whitespace-nowrap">
              <span className={isLow ? "text-red-500" : "text-github-gray dark:text-gray-300"}>
                {rateLimit.remaining}/{rateLimit.limit}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">GitHub API Rate Limit</p>
            <p className="text-xs text-gray-500">
              {rateLimit.remaining} / {rateLimit.limit} remaining
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${`bg-${color}`}`}
                style={{width: `${percentage}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Resets in {getResetTime()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
