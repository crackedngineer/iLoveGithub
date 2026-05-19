"use client";

import {useState, useEffect, useCallback, useMemo} from "react";
import {useParams} from "next/navigation";
import Image from "next/image";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Sun,
  Moon,
  Shuffle,
  RotateCcw,
  Settings2,
  Palette,
  Layout,
  Github,
} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {fetchRepoDetails} from "@/services/github";
import {useAuth} from "@/components/AuthProvider";
import {generateVisualifyCard} from "@/services/visualify";

interface RepoMeta {
  name: string;
  full_name: string;
  description: string;
  owner: {login: string; avatar_url: string};
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
}

type ThemeKey = "light" | "dark" | "slate" | "sunset";
type PatternKey = "plus" | "circuit" | "topography";
type FontKey = "inter" | "roboto-mono" | "lexend";
type LayoutKey = "socialify" | "bannerbear" | "cyber" | "vibrant";

const THEMES: Record<
  ThemeKey,
  {bg: string; fg: string; accent: string; card: string; label: string}
> = {
  light: {bg: "#ffffff", fg: "#1f2937", accent: "#3b82f6", card: "#f9fafb", label: "Light"},
  dark: {bg: "#0d1117", fg: "#e6edf3", accent: "#58a6ff", card: "#161b22", label: "Dark"},
  slate: {bg: "#1e293b", fg: "#e2e8f0", accent: "#38bdf8", card: "#334155", label: "Slate"},
  sunset: {bg: "#1a1025", fg: "#fde68a", accent: "#f97316", card: "#2d1b3d", label: "Sunset"},
};

const FONT_FAMILIES: Record<FontKey, string> = {
  inter: "'Inter', sans-serif",
  "roboto-mono": "'Roboto Mono', monospace",
  lexend: "'Lexend', sans-serif",
};

const patternSvg = (pattern: PatternKey, color: string) => {
  const c = encodeURIComponent(color);
  if (pattern === "plus")
    return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${c}' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
  if (pattern === "circuit")
    return `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='${c}' stroke-opacity='0.1' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='${c}' fill-opacity='0.15'/%3E%3Ccircle cx='10' cy='10' r='2' fill='${c}' fill-opacity='0.15'/%3E%3Ccircle cx='90' cy='90' r='2' fill='${c}' fill-opacity='0.15'/%3E%3Cpath d='M50 10v40M10 50h40' stroke='${c}' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`;
  return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c10-10 30-10 40 0s30 10 40 0' fill='none' stroke='${c}' stroke-opacity='0.12' stroke-width='1'/%3E%3C/svg%3E")`;
};

const GitVisualify = () => {
  const params = useParams<{slug: string[]}>();
  const [owner, repoName] = params.slug || [];
  const {session} = useAuth();

  const [repo, _setRepo] = useState<RepoMeta | null>(null);
  const [loading, _setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [pattern, setPattern] = useState<PatternKey>("plus");
  const [font, setFont] = useState<FontKey>("inter");
  const [layout, setLayout] = useState<LayoutKey>("socialify");
  const [padding, setPadding] = useState(32);

  const [show, setShow] = useState({
    name: true,
    owner: true,
    language: true,
    stars: true,
    forks: false,
    issues: false,
    description: true,
  });

  const token = useMemo(() => {
    return session?.provider_token;
  }, [session?.provider_token]);

  const fetchRepo = useCallback(async () => {
    await fetchRepoDetails(owner, repoName, token);
  }, [owner, repoName, token]);

  // Auto-load from URL slug on mount
  useEffect(() => {
    if (owner && repoName) {
      fetchRepoDetails(owner, repoName, token);
    }
  }, [owner, repoName, token]);

  const buildGenerateParams = useCallback(() => {
    if (!repo) return null;
    return new URLSearchParams({
      owner: repo.owner.login,
      repo: repo.name,
      theme,
      layout,
      font,
      pattern,
      showName: String(show.name),
      showOwner: String(show.owner),
      showLanguage: String(show.language),
      showStars: String(show.stars),
      showForks: String(show.forks),
      showIssues: String(show.issues),
      showDescription: String(show.description),
    });
  }, [repo, theme, layout, font, pattern, show]);

  const downloadPng = useCallback(async () => {
    if (!repo) {
      toast.error("No repository data to generate preview.");
      return;
    }
    try {
      const params = buildGenerateParams()!;
      const res = await fetch(`/api/visualify/generate?${params}`);
      if (!res.ok) throw new Error("Generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo.name}-social.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }, [repo, buildGenerateParams]);

  const copyMarkdown = useCallback(() => {
    if (!repo) return;
    const params = buildGenerateParams()!;
    const imageUrl = `${window.location.origin}/api/visualify/generate?${params}`;
    const md = `[![${repo.full_name} social preview](${imageUrl})](https://github.com/${repo.full_name})`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  }, [repo, buildGenerateParams]);

  const t = THEMES[theme];

  const previewCardUrl = useMemo(() => {
    console.log(`Preview URL: ${generateVisualifyCard(repoName, owner, theme, layout, 600, 300)}`);
    return generateVisualifyCard(repoName, owner, theme, layout, 900, 300);
  }, [repoName, owner, theme, layout]);

  const layouts: {key: LayoutKey; label: string; subtitle: string}[] = [
    {key: "socialify", label: "The Socialify", subtitle: "Centered"},
    {key: "bannerbear", label: "The Bannerbear", subtitle: "Minimalist"},
    {key: "cyber", label: "The Cyber", subtitle: "Monospace Grid"},
    {key: "vibrant", label: "The Vibrant", subtitle: "Mesh Gradient"},
  ];

  const isDark = theme === "dark" || theme === "slate" || theme === "sunset";

  const randomize = () => {
    const themes: ThemeKey[] = ["light", "dark", "slate", "sunset"];
    const patterns: PatternKey[] = ["plus", "circuit", "topography"];
    const fonts: FontKey[] = ["inter", "roboto-mono", "lexend"];
    const layoutKeys: LayoutKey[] = ["socialify", "bannerbear", "cyber", "vibrant"];
    setTheme(themes[Math.floor(Math.random() * themes.length)]);
    setPattern(patterns[Math.floor(Math.random() * patterns.length)]);
    setFont(fonts[Math.floor(Math.random() * fonts.length)]);
    setLayout(layoutKeys[Math.floor(Math.random() * layoutKeys.length)]);
  };

  const resetAll = () => {
    setTheme("dark");
    setPattern("plus");
    setFont("inter");
    setLayout("socialify");
    setPadding(32);
    setShow({
      name: true,
      owner: true,
      language: true,
      stars: true,
      forks: false,
      issues: false,
      description: true,
    });
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-5xl mx-auto w-full">
      {/* Repo URL Input */}
      <div className="w-full flex gap-2">
        <Input
          placeholder="https://github.com/owner/repo"
          value={owner && repoName ? `${owner}/${repoName}` : ""}
          onChange={() => {}}
          onKeyDown={(e) => e.key === "Enter" && fetchRepo()}
          className="bg-[#111827] border-gray-700/50 text-gray-200 placeholder:text-gray-600 h-11 text-sm rounded-xl"
        />
        <Button
          onClick={fetchRepo}
          className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-6 rounded-xl font-medium shrink-0"
        >
          Generate
        </Button>
      </div>

      {/* Live Preview */}
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-gray-800/50">
        <div className="aspect-[2/1] w-full relative bg-[#111827]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="w-full space-y-6">
                <Skeleton className="h-16 w-3/4 mx-auto bg-gray-800/60" />
                <Skeleton className="h-6 w-1/2 mx-auto bg-gray-800/60" />
                <div className="flex justify-center gap-3">
                  <Skeleton className="h-8 w-24 rounded-full bg-gray-800/60" />
                  <Skeleton className="h-8 w-24 rounded-full bg-gray-800/60" />
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 [&>div]:!w-full [&>div]:!h-full">
              {previewCardUrl ? (
                <Image
                  src={previewCardUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  width={900}
                  height={300}
                  unoptimized
                />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-gray-400 hover:text-white hover:bg-gray-800/60 gap-2 rounded-lg text-xs"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? "Light" : "Dark"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={randomize}
            className="text-gray-400 hover:text-white hover:bg-gray-800/60 gap-2 rounded-lg text-xs"
          >
            <Shuffle size={14} /> Random
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-gray-400 hover:text-white hover:bg-gray-800/60 gap-2 rounded-lg text-xs"
          >
            <RotateCcw size={14} /> Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={copyMarkdown}
            disabled={!repo}
            variant="outline"
            size="sm"
            className="border-gray-700/50 text-gray-300 hover:bg-gray-800/60 gap-2 rounded-lg text-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Markdown"}
          </Button>
          <Button
            onClick={downloadPng}
            disabled={!repo}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-lg text-xs font-medium px-5"
          >
            <Download size={14} /> Download
          </Button>
        </div>
      </div>

      {/* Tabbed Configuration */}
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="w-full bg-[#111827] border border-gray-800/50 rounded-xl p-1 h-auto gap-1">
          <TabsTrigger
            value="presets"
            className="flex-1 rounded-lg text-xs data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 py-2.5 gap-1.5"
          >
            <Sparkles size={13} /> Presets
          </TabsTrigger>
          <TabsTrigger
            value="main"
            className="flex-1 rounded-lg text-xs data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 py-2.5 gap-1.5"
          >
            <Settings2 size={13} /> Main
          </TabsTrigger>
          <TabsTrigger
            value="background"
            className="flex-1 rounded-lg text-xs data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 py-2.5 gap-1.5"
          >
            <Palette size={13} /> Background
          </TabsTrigger>
          <TabsTrigger
            value="elements"
            className="flex-1 rounded-lg text-xs data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 py-2.5 gap-1.5"
          >
            <Layout size={13} /> Elements
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {layouts.map((l) => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                className={`group rounded-xl border-2 p-3 transition-all text-left ${
                  layout === l.key
                    ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : "border-gray-800/50 hover:border-gray-600/50 bg-[#111827]"
                }`}
              >
                <div className="w-full aspect-[2/1] rounded-lg overflow-hidden mb-2.5 relative bg-[#0a0e17]">
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: "scale(0.12)",
                      transformOrigin: "top left",
                      width: 1280,
                      height: 640,
                    }}
                  >
                    {(() => {
                      const _oldLayout = layout;
                      const el = (
                        <div
                          className="relative overflow-hidden"
                          style={{
                            width: 1280,
                            height: 640,
                            backgroundColor: l.key === "vibrant" ? undefined : t.bg,
                            backgroundImage:
                              l.key === "vibrant"
                                ? `linear-gradient(135deg, ${t.accent}88, ${t.bg}, ${t.accent}44)`
                                : patternSvg(pattern, t.fg),
                            fontFamily: FONT_FAMILIES[l.key === "cyber" ? "roboto-mono" : font],
                            color: t.fg,
                          }}
                        >
                          <div
                            className="absolute rounded-2xl flex"
                            style={{
                              inset: 32,
                              backgroundColor: t.card + "dd",
                              flexDirection: l.key === "bannerbear" ? "row" : "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 20,
                              padding: "0 48px",
                            }}
                          >
                            <Github size={48} style={{color: t.fg, opacity: 0.6}} />
                            <div style={{textAlign: l.key === "bannerbear" ? "left" : "center"}}>
                              <div style={{fontSize: 36, fontWeight: 700}}>
                                {repo?.name || "repo-name"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      return el;
                    })()}
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-200 truncate">{l.label}</p>
                <p className="text-[10px] text-gray-500">{l.subtitle}</p>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Main Tab */}
        <TabsContent value="main" className="mt-4">
          <div className="bg-[#111827] border border-gray-800/50 rounded-xl p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 block">Theme</p>
                <Select value={theme} onValueChange={(v) => setTheme(v as ThemeKey)}>
                  <SelectTrigger className="bg-[#0a0e17] border-gray-700/50 text-gray-200 rounded-lg h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-gray-700/50">
                    {Object.entries(THEMES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 block">Font</p>
                <Select value={font} onValueChange={(v) => setFont(v as FontKey)}>
                  <SelectTrigger className="bg-[#0a0e17] border-gray-700/50 text-gray-200 rounded-lg h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-gray-700/50">
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto-mono">Roboto Mono</SelectItem>
                    <SelectItem value="lexend">Lexend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 block">Padding: {padding}px</p>
              <Slider
                value={[padding]}
                onValueChange={(v) => setPadding(v[0])}
                min={0}
                max={80}
                step={4}
                className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
          </div>
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="mt-4">
          <div className="bg-[#111827] border border-gray-800/50 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5 block">Pattern</p>
              <Select value={pattern} onValueChange={(v) => setPattern(v as PatternKey)}>
                <SelectTrigger className="bg-[#0a0e17] border-gray-700/50 text-gray-200 rounded-lg h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-gray-700/50">
                  <SelectItem value="plus">Plus</SelectItem>
                  <SelectItem value="circuit">Circuit</SelectItem>
                  <SelectItem value="topography">Topography</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setTheme(k)}
                  className={`rounded-lg p-3 border-2 transition-all ${theme === k ? "border-blue-500/60" : "border-gray-700/30 hover:border-gray-600/50"}`}
                  style={{backgroundColor: v.bg}}
                >
                  <div className="w-full h-6 rounded" style={{backgroundColor: v.accent}} />
                  <p className="text-[10px] mt-1.5 font-medium" style={{color: v.fg}}>
                    {v.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Elements Tab */}
        <TabsContent value="elements" className="mt-4">
          <div className="bg-[#111827] border border-gray-800/50 rounded-xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(show) as (keyof typeof show)[]).map((key) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 text-sm cursor-pointer rounded-lg border px-3 py-2.5 transition-all ${
                    show[key]
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-gray-700/30 text-gray-500 hover:border-gray-600/50"
                  }`}
                >
                  <Checkbox
                    checked={show[key]}
                    onCheckedChange={(v) => setShow((s) => ({...s, [key]: !!v}))}
                    className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                  />
                  <span className="capitalize text-xs font-medium">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default GitVisualify;
