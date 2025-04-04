import { NextConfig } from "next";
import { GithubToolsList } from "@/constants";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/",
  images: {
    unoptimized: true,
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
