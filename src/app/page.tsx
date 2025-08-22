"use client";

import "./style.css";
import {useRouter} from "next/navigation";
import RepoSearch from "@/components/RepoSearch";
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
  const url = window?.location?.href || "";

  if (hasSubdomain(url)) {
    const protocol = window.location.protocol;
    window.location.href = `${protocol}//${rootDomain}`;
  }

  return (
    <AppLayout>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />
        <RepoSearch
          trending={true}
          onRepoSubmit={(owner: string, repo: string) => {
            if (owner.trim() && repo.trim()) {
              router.push(`/${owner}/${repo}`);
            }
          }}
          value={""}
        />
      </main>
    </AppLayout>
  );
}
