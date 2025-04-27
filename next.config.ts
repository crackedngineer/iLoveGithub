import { NextConfig } from "next";
import { GithubToolsList } from "@/constants";

const nextConfig: NextConfig = {
  async headers() {
    return [
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
  images: {
    remotePatterns: Object.values(GithubToolsList)
      .map((item) => {
        try {
          const url = new URL(item.icon);
          const protocol = url.protocol.replace(":", "") as "http" | "https"; // Ensure correct type

          return { protocol, hostname: url.hostname };
        } catch {
          return null; // Handle invalid URLs
        }
      })
      .filter(
        (
          pattern
        ): pattern is { protocol: "http" | "https"; hostname: string } =>
          pattern !== null
      ), // Type-safe filtering
  },
};

export default nextConfig;
