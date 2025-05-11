import { Tool } from "./lib/types";

export const RECENT_REPO_LOCAL_STORAGE_KEY = "recent_github_repos";

export const RECENT_TRENDING_REPO_UI_MAXCOUNT = 4;

export const RECENT_TRENDING_REPO_CACHE_MAXCOUNT = 4;

export const DONATION_MERCHANT_NAME = "iLoveGithub";

export const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/crackedngineer";

export const SUBSTACK_NEWSLETTER_URL = "https://ilovegithub.substack.com/";

export const GITHUB_REPO_URL = "https://github.com/crackedngineer/iLoveGithub";

export const GITHUB_SUBMIT_TOOL_URL =
  "https://github.com/crackedngineer/iLoveGithub/issues/new?template=new-tool-request.yml";
  
export const DEMO_VIDEO_URL = "https://www.youtube.com/embed/eg5eAEnNEVY?si=_me67cuBbIloxm8o?autoplay=1"

export const DefaultGithubRepo = {
  owner: "crackedngineer",
  repo: "iLoveGithub",
};

export const ToolCategories = {
  DEVELOPMENT: "Development Tools",
  ANALYTICS: "Analytics & Insights",
  WIDGETS: "Widgets & UI",
} as const;

export const GithubToolsList: Tool[] = [
  {
    name: "github1s",
    title: "github1s",
    description: "One second to read GitHub code with VS Code.",
    homepage: "https://github1s.com",
    url: "https://github1s.com/{owner}/{repo}",
    icon: "/icons/tools/github1s.ico", // https://github1s.com/favicon.ico
    category: ToolCategories.DEVELOPMENT,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "github-dev",
    title: "Github Dev",
    description: "Open any GitHub repo in a browser-based VS Code editor.",
    homepage: "https://github.dev",
    url: "https://github.dev/{owner}/{repo}",
    icon: "/icons/tools/github.ico", // https://github.com/favicon.ico
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gitdiagram",
    title: "GitDiagram",
    description:
      "Turn any GitHub repository into an interactive diagram for visualization.",
    homepage: "https://gitdiagram.com/",
    url: "https://gitdiagram.com/{owner}/{repo}",
    icon: "/icons/tools/gitdiagram.ico", // https://gitdiagram.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "stackblitz",
    title: "StackBlitz",
    description: "Turn text into working web apps.",
    homepage: "https://stackblitz.com/",
    url: "https://stackblitz.com/~/github.com/{owner}/{repo}",
    icon: "/icons/tools/stackblitz.svg", // https://stackblitz.com/_astro/favicon.svg
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "vscode",
    title: "Visual Studio Code",
    description: "Edit projects using the full VS Code experience in-browser.",
    homepage: "https://code.visualstudio.com/docs/setup/vscode-web",
    url: "https://vscode.dev/github/{owner}/{repo}",
    icon: "/icons/tools/vscode.ico", // https://code.visualstudio.com/assets/favicon.ico
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gitingest",
    title: "Gitingest",
    description:
      "Turn any Git repository into a simple text digest of its codebase.",
    homepage: "https://gitingest.com/",
    url: "https://gitingest.com/{owner}/{repo}",
    icon: "/icons/tools/gitingest.ico", // https://gitingest.com/static/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "uithub",
    title: "uithub",
    description: "Easily Ask Your LLM Coding Questions.",
    homepage: "https://uithub.com/",
    url: "https://uithub.com/{owner}/{repo}",
    icon: "/icons/tools/uithub.png", // https://uithub.com/favicon-32x32.png
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gitpodcast",
    title: "GitPodcast",
    description:
      "Turn any GitHub repository into an engaging podcast in seconds.",
    homepage: "https://www.gitpodcast.com/",
    url: "https://www.gitpodcast.com/{owner}/{repo}",
    icon: "/icons/tools/gitpodcast.ico", // https://www.gitpodcast.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "socialify",
    title: "Github Socialify",
    description: "Socialify your GitHub project to share with the world.",
    homepage: "https://socialify.git.ci/",
    url: "https://socialify.git.ci/{owner}/{repo}",
    icon: "/icons/tools/socialify.ico", // https://socialify.git.ci/favicon.ico
    category: ToolCategories.WIDGETS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gitsummarize",
    title: "GitSummarize",
    description:
      "Turn any GitHub repository into a comprehensive AI-powered documentation hub.",
    homepage: "https://gitsummarize.com/",
    url: "https://gitsummarize.com/{owner}/{repo}",
    icon: "/icons/tools/gitsummarize.ico", // https://gitsummarize.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "explaingithub",
    title: "ExplainGithub",
    description: "Understand complex codebases with AI.",
    homepage: "https://explaingithub.com/",
    url: "https://explaingithub.com/{owner}/{repo}",
    icon: "/icons/tools/explaingithub.ico", // https://explaingithub.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gituml",
    title: "GitUML",
    description: "UML visualisation for Git repositories.",
    homepage: "https://www.gituml.com/",
    url: "https://www.gituml.com/ztree_scratchpad?user={owner}&repo={repo}&commit={default_branch}&repo-brand=github",
    icon: "/icons/tools/gituml.ico", // https://www.gituml.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "googlecolab",
    title: "Google Colaboratory",
    description:
      "Colaboratory is a research tool for machine learning education and research.",
    homepage: "https://colab.research.google.com/",
    url: "https://colab.research.google.com/github/{owner}/{repo}",
    icon: "/icons/tools/googlecolab.ico", // https://ssl.gstatic.com/colaboratory-static/common/8e5fae8429764217c8c60f7f0fea86be/img/favicon.ico
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "bolt",
    title: "Bolt.new",
    description: "Prompt, run, edit, and deploy full-stack web applications.",
    homepage: "https://bolt.new/",
    url: "https://bolt.new/~/github.com/{owner}/{repo}",
    icon: "/icons/tools/bolt-new.svg", // https://bolt.new/static/favicon.svg
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "codesandbox",
    title: "CodeSandbox",
    description: "Sandboxes built for scale.",
    homepage: "https://codesandbox.io/",
    url: "https://codesandbox.io/p/devbox/github/{owner}/{repo}",
    icon: "/icons/tools/codesandbox.ico", // https://codesandbox.io/favicon.ico
    category: ToolCategories.DEVELOPMENT,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "repo-surf",
    title: "Repo Surf",
    description:
      "repo-surf is a repository viewer that lets you dive through its commits and branches.",
    homepage: "https://repo.surf/",
    url: "https://repo.surf/{owner}/{repo}",
    icon: "/icons/tools/repo-surf.ico", // https://repo.surf/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "star-history",
    title: "GitHub Star History",
    description:
      "View and compare GitHub star history graph of open source projects.",
    homepage: "https://www.star-history.com/",
    url: "https://www.star-history.com/#{owner}/{repo}",
    icon: "/icons/tools/star-history.ico", // https://www.star-history.com/assets/favicon.ico
    category: ToolCategories.WIDGETS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "githubnext",
    title: "GitHubNext",
    description: "Visualizing a Codebase.",
    homepage: "https://githubnext.com/projects/repo-visualization/",
    url: "https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo={owner}%2F{repo}",
    icon: "/icons/tools/githubnext.svg", // https://githubnext.com/assets/images/next-octocat.svg
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "github.gg",
    title: "GitHub.gg",
    description:
      "Analyze GitHub repositories with insights about code quality, dependencies, and more.",
    homepage: "https://github.gg/",
    url: "https://github.gg/{owner}/{repo}",
    icon: "/icons/tools/github-gg.png", // https://github.gg/static/images/favicon/favicon-32x32.png
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "chatforgithub",
    title: "chatforgithub",
    description: "Context-driven LLM Interface.",
    homepage: "https://chat.forgithub.com/",
    url: "https://chat.forgithub.com/{owner}/{repo}",
    icon: "/icons/tools/chatforgithub.ico", // https://chat.forgithub.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "entelligence",
    title: "Entelligence.ai",
    description: "Empower and uplevel your engineering team",
    homepage: "https://www.entelligence.ai/",
    url: "https://www.entelligence.ai/{owner}/{repo}",
    icon: "/icons/tools/entelligence.svg", // https://www.entelligence.ai/assets/ent_logo_new_dark_mode.svg
    category: ToolCategories.ANALYTICS,
    iframe: false,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "git1file",
    title: "git1file",
    description: "Compress & Transform Git Repositories for AI",
    homepage: "https://git1file.com/",
    url: "https://git1file.com/{owner}/{repo}",
    icon: "/icons/tools/git1file.ico", // https://git1file.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "gitmcp",
    title: "GitMCP",
    description: "Instantly create a Remote MCP server for any GitHub project",
    homepage: "https://gitmcp.io/",
    url: "https://gitmcp.io/{owner}/{repo}",
    icon: "/icons/tools/gitmcp.png", // https://gitmcp.io//img/icon_black_cropped.png
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "flatgithub",
    title: "Flat Github",
    description:
      "A simple tool for exploring flat data files in GitHub repositories.",
    homepage: "https://flatgithub.com/",
    url: "https://flatgithub.com/{owner}/{repo}",
    icon: "/icons/tools/flatgithub.png", // https://flatgithub.com/favicon-32x32.png
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-03-28T15:39:45Z",
  },
  {
    name: "deepwiki",
    title: "DeepWiki",
    description: "Which repo would you like to understand?",
    homepage: "https://deepwiki.com/",
    url: "https://deepwiki.com/{owner}/{repo}",
    icon: "/icons/tools/deepwiki.ico", // https://deepwiki.com/favicon.ico
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-04-26T19:02:42.848Z",
  },
  {
    name: "talktogithub",
    title: "TalkToGitHub",
    description: "Repo to Convo in seconds!",
    homepage: "https://talktogithub.com/",
    url: "https://talktogithub.com/{owner}/{repo}",
    icon: "/icons/tools/talktogithub.svg", // https://www.talktogithub.com/favicon.svg
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-04-29T18:56:38Z",
  },
  {
    name: "answergit",
    title: "AnswerGit",
    description: "AI-Powered GitHub Repository Explorer",
    homepage: "https://answergit.vercel.app/",
    url: "https://answergit.vercel.app/{owner}/{repo}",
    icon: null,
    category: ToolCategories.ANALYTICS,
    iframe: true,
    created_at: "2025-05-09T05:13:49Z",
  },
];
