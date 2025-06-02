import { NextConfig } from "next";
import GithubToolsList from "./tools.json";
import { rootDomain } from "@/lib/utils";

const iframeOrigins = GithubToolsList.filter((tool) => tool.iframe).map(
  (tool) => `https://${tool.name}.${rootDomain}`
);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...iframeOrigins],
  async headers() {
    return [
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // 🛡️ Block iframe embedding (old browsers)
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';", // 🛡️ Block iframe embedding (modern browsers)
          },
        ],
      },
    ];
  },
};

export default nextConfig;
