import React from "react";

interface ToolLoadingProps {
  tool: string;
  owner: string;
  repo: string;
}

const ToolLoading: React.FC<ToolLoadingProps> = ({tool, owner, repo}) => {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center
                    bg-white dark:bg-gray-950 z-50 px-4 text-center"
    >
      {/* Dot-grid ambient texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-gray-400/20 dark:text-gray-600/15 bg-dot-grid"
      />

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[500px] h-[300px] -z-10 blur-3xl
                   bg-[radial-gradient(ellipse_at_center,_#0366d618_0%,_transparent_70%)]
                   dark:bg-[radial-gradient(ellipse_at_center,_#0366d625_0%,_transparent_70%)]"
      />

      {/* Spinner */}
      <div className="relative mb-6">
        <div
          className="w-12 h-12 rounded-full border-2 border-github-blue/20
                        border-t-github-blue animate-spin"
        />
      </div>

      {/* Breadcrumb */}
      <p className="font-mono text-xs text-muted-foreground mb-2">
        {owner}/{repo}
      </p>

      {/* Tool name */}
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">{tool}</h1>

      <p className="text-sm text-muted-foreground">Checking iframe support and loading tool…</p>
    </div>
  );
};

export default ToolLoading;
