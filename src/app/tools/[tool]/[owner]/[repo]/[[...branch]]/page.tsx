"use client";
import * as React from "react";
import {useState, useEffect} from "react";
import GithubToolsList from "../../../../../../../tools.json";
import {replaceUrlVariables} from "@/app/helper";
import {notFound, useParams} from "next/navigation";
import ToolViewer from "@/components/ToolViewer";
import ToolLoading from "@/components/ToolLoading";
import {Tool} from "@/lib/types";

async function checkIframeSupport(url: string): Promise<{
  allowed: boolean;
  reason?: string;
  redirectedUrl?: string;
}> {
  try {
    // Normalize URL
    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      console.error("❌ Invalid URL format");
      return {allowed: false, reason: "Invalid URL format"};
    }

    // Fetch headers with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(normalizedUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      // Add headers to mimic browser request
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    console.log(`\n🔍 Checking iframe support for: ${res.url}\n`);

    // Check X-Frame-Options (case-insensitive)
    const xfo = res.headers.get("x-frame-options")?.toLowerCase();
    if (xfo) {
      console.log(`🧱 X-Frame-Options: ${xfo}`);
      if (xfo === "deny") {
        console.log("❌ Iframe blocked by X-Frame-Options: DENY");
        return {
          allowed: false,
          reason: "X-Frame-Options: DENY",
          redirectedUrl: res.url,
        };
      }
      if (xfo === "sameorigin") {
        console.log("⚠️ Iframe only allowed for same origin (X-Frame-Options: SAMEORIGIN)");
        return {
          allowed: false,
          reason: "X-Frame-Options: SAMEORIGIN (cross-origin blocked)",
          redirectedUrl: res.url,
        };
      }
      // ALLOW-FROM is obsolete but check anyway
      if (xfo.startsWith("allow-from")) {
        console.log(`⚠️ X-Frame-Options uses obsolete ALLOW-FROM directive`);
      }
    }

    // Check Content-Security-Policy frame-ancestors
    const csp = res.headers.get("content-security-policy")?.toLowerCase();
    if (csp) {
      // Extract frame-ancestors directive
      const frameAncestorsMatch = csp.match(/frame-ancestors\s+([^;]+)/);
      if (frameAncestorsMatch) {
        const directive = frameAncestorsMatch[1].trim();
        console.log(`🧱 CSP frame-ancestors: ${directive}`);

        if (directive === "'none'") {
          console.log("❌ Iframe blocked by CSP: frame-ancestors 'none'");
          return {
            allowed: false,
            reason: "CSP frame-ancestors 'none'",
            redirectedUrl: res.url,
          };
        }
        if (directive === "'self'") {
          console.log("⚠️ Iframe only allowed for same origin (CSP: frame-ancestors 'self')");
          return {
            allowed: false,
            reason: "CSP frame-ancestors 'self' (cross-origin blocked)",
            redirectedUrl: res.url,
          };
        }
      }
    }

    console.log("✅ Iframe embedding appears to be allowed!");
    return {allowed: true, redirectedUrl: res.url};
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        console.error("⚠️ Request timeout - server took too long to respond");
        return {allowed: false, reason: "Request timeout"};
      }
      console.error(`⚠️ Error checking ${url}:`, err.message);
      return {allowed: false, reason: err.message};
    }
    console.error("⚠️ Unknown error occurred");
    return {allowed: false, reason: "Unknown error"};
  }
}

function fetchBranchName(params: {branch?: string | string[]}): string | undefined {
  if (!params.branch || params.branch.length !== 1) {
    return;
  }
  return params.branch?.[0];
}

export default function ToolsPage() {
  const params = useParams() as {tool: string; owner: string; repo: string; branch?: string};
  const {tool, owner, repo} = params;
  const branch = fetchBranchName(params);

  const toolData = GithubToolsList.find((item: Tool) => item.name === tool);

  const toolLink = toolData?.url
    ? replaceUrlVariables(toolData.url, {
        owner,
        repo,
        branch: branch || "",
      })
    : null;

  const [showViewer, setShowViewer] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const iframeSupport = await checkIframeSupport(toolLink || "");
      if (toolData?.iframe || iframeSupport.allowed) {
        setShowViewer(true);
      } else {
        window.location.href = toolLink!;
      }
    })();
  }, [toolLink, toolData]);

  if (!branch) {
    return notFound();
  }

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {toolLink && showViewer ? (
        <ToolViewer url={toolLink} name={`${owner}/${repo}`} />
      ) : (
        <ToolLoading tool={tool} owner={owner} repo={repo} />
      )}
    </div>
  );
}
