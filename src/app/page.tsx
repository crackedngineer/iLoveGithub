"use client";
import "./style.css";
import { useRouter } from "next/navigation";
import RepoSearch from "@/components/RepoSearch";
import AppLayout from "@/components/AppLayout";
import { Introduction } from "@/components/Introduction";

export default function Home() {
  const router = useRouter();

  return (
    <AppLayout>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />
        <RepoSearch
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
