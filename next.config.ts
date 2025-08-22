import GithubToolsList from "./tools.json";
import { rootDomain } from "@/lib/utils";

/**
 * Dynamically generate iframe tool origins like https://toolname.example.com
 */
const iframeOrigins = GithubToolsList.filter((tool) => tool.iframe).map(
  (tool) => `https://${tool.name}.${rootDomain}`,
);

/**
 * Custom config (use in your own code if needed)
 */
const customConfig = {
  allowedDevOrigins: [...iframeOrigins],
};

/**
 * Next.js config
 */
const nextConfig = {
  reactStrictMode: true,

  /** Allow remote images from Vercel Blob storage */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },

  /** Custom headers for security */
  async headers() {
    return [
      {
        source: "/(.*)", // Apply headers to all routes
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // For older browsers
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';", // For modern browsers
          },
        ],
      },
    ];
  },
};

// Export both if needed in your app
export default {
  ...nextConfig,
  ...customConfig,
};
