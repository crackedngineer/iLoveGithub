import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHostnameFromUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (err) {
    console.error("Invalid URL:", urlString);
    return null;
  }
}

export function extractSubdomainFromHostname(hostname: string): string | null {
  const root = rootDomain.split(":")[0]; // Remove port

  if (hostname === root || hostname === `www.${root}`) {
    return null;
  }

  // Handle local development subdomains (e.g. org.localhost)
  if (hostname.endsWith(".localhost") || hostname.startsWith("127.0.0.1")) {
    const fullUrlMatch = root.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Generic subdomain handling
  const isSubdomain =
    hostname !== root && hostname !== `www.${root}` && hostname.endsWith(`.${root}`);

  return isSubdomain ? hostname.replace(`.${root}`, "") : null;
}
