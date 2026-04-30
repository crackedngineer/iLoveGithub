import {ReactNode} from "react";
import {RefreshCw} from "lucide-react";
import {usePullToRefresh} from "@/hooks/usePullToRefresh";
import {cn} from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

const PullToRefresh = ({children, onRefresh, className}: PullToRefreshProps) => {
  const {containerRef, isPulling, isRefreshing, pullDistance, progress} = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10",
          (isPulling || isRefreshing) && pullDistance > 10 ? "opacity-100" : "opacity-0",
        )}
        style={{
          top: Math.max(pullDistance - 50, -50),
          height: 50,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-lg transition-transform",
            isRefreshing && "animate-spin",
          )}
          style={{
            transform: `rotate(${progress * 360}deg) scale(${0.5 + progress * 0.5})`,
          }}
        >
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${pullDistance}px)` : "translateY(0)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
