"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import RepoExplorer from "@/components/RepoExplorer";
import AppLayout from "@/components/AppLayout";
import {Introduction} from "@/components/Introduction";
import {getHostnameFromUrl, extractSubdomainFromHostname, rootDomain} from "@/lib/utils";

function hasSubdomain(urlString: string): boolean {
  const hostname = getHostnameFromUrl(urlString);
  if (!hostname) return false;
  const subdomain = extractSubdomainFromHostname(hostname);
  return !!subdomain && subdomain !== "www";
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const url = window.location.href;
    if (hasSubdomain(url)) {
      window.location.href = `${window.location.protocol}//${rootDomain}`;
    }
  }, []);

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />
        <RepoExplorer
          trending={true}
          onRepoSubmit={(owner, repo) => {
            if (owner.trim() && repo.trim()) router.push(`/${owner}/${repo}`);
          }}
        />
      </div>
    </AppLayout>
  );
}
