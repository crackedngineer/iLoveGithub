import { Tool } from "./lib/types";

export const DefaultGithubRepo = {
  owner: "subhomoy-roy-choudhury",
  repo: "iLoveGithub",
};

export const GithubToolsList: Tool[] = [
  {
    name: "github1s",
    title: "github1s",
    description: "One second to read GitHub code with VS Code.",
    homepage: "https://github1s.com",
    url: "https://github1s.com/{owner}/{repo}",
    icon: "https://github1s.com/favicon.ico",
    category: "Development",
    iframe: true,
  },
  {
    name: "github-dev",
    title: "Github Dev",
    description: "",
    homepage: "https://github.dev",
    url: "https://github.dev/{owner}/{repo}",
    icon: "https://github.com/favicon.ico",
    category: "Development",
    iframe: false,
  },
  {
    name: "gitdiagram",
    title: "GitDiagram",
    description:
      "Turn any GitHub repository into an interactive diagram for visualization.",
    homepage: "https://stackblitz.com/",
    url: "https://gitdiagram.com/{owner}/{repo}",
    icon: "https://gitdiagram.com/favicon.ico",
    category: "Analytics",
    iframe: true,
  },
  {
    name: "stackblitz",
    title: "StackBlitz",
    description:
      "Turn text into working web apps. Bolt handles the code while you focus on your vision, letting you create and launch applications directly from your browser.",
    homepage: "https://gitdiagram.com/",
    url: "https://stackblitz.com/~/github.com/{owner}/{repo}",
    icon: "https://stackblitz.com/_astro/favicon.svg",
    category: "Development",
    iframe: false,
  },
  {
    name: "vscode",
    title: "Visual Studio Code",
    description:
      "Visual Studio Code for the Web provides a free, zero-install Microsoft Visual Studio Code experience running entirely in your browser, allowing you to quickly and safely browse source code repositories and make lightweight code changes.",
    homepage: "https://code.visualstudio.com/docs/setup/vscode-web",
    url: "https://vscode.dev/github/{owner}/{repo}",
    icon: "https://code.visualstudio.com/assets/favicon.ico",
    category: "Development",
    iframe: false,
  },
  {
    name: "gitingest",
    title: "Gitingest",
    description:
      "Turn any Git repository into a simple text digest of its codebase.",
    homepage: "https://gitingest.com/",
    url: "https://gitingest.com/{owner}/{repo}",
    icon: "https://gitingest.com/static/favicon.ico",
    category: "Analytics",
    iframe: true,
  },
  {
    name: "uithub",
    title: "uithub",
    description: "Easily Ask Your LLM Coding Questions",
    homepage: "https://uithub.com/",
    url: "https://uithub.com/{owner}/{repo}",
    icon: "https://uithub.com/favicon-32x32.png",
    category: "Analytics",
    iframe: true,
  },
  {
    name: "gitpodcast",
    title: "GitPodcast",
    description:
      "Turn any GitHub repository into an engaging podcast in seconds.",
    homepage: "https://www.gitpodcast.com/",
    url: "https://www.gitpodcast.com/{owner}/{repo}",
    icon: "https://www.gitpodcast.com/favicon.ico",
    category: "Analytics",
    iframe: true,
  },
  {
    name: "socialify",
    title: "Github Socialify",
    description: "Socialify your GitHub project to share with the world",
    homepage: "https://socialify.git.ci/",
    url: "https://socialify.git.ci/{owner}/{repo}",
    icon: "https://socialify.git.ci/favicon.ico",
    category: "Widgets",
    iframe: true,
  },
  {
    name: "gitsummarize",
    title: "GitSummarize",
    description:
      "Turn any GitHub repository into a comprehensive AI-powered documentation hub.",
    homepage: "https://gitsummarize.com/",
    url: "https://gitsummarize.com/{owner}/{repo}",
    icon: "https://gitsummarize.com/favicon.ico",
    category: "Analytics",
    iframe: true,
  },
  {
    name: "explaingithub",
    title: "ExplainGithub",
    description:
      "ExplainGitHub is an intelligent code exploration platform that helps developers understand GitHub repositories more efficiently. By leveraging AI-powered analysis, it allows users to navigate and comprehend unfamiliar codebases with ease.",
    homepage: "https://explaingithub.com/",
    url: "https://explaingithub.com/{owner}/{repo}",
    icon: "https://explaingithub.com/favicon.ico",
    category: "Analytics",
    iframe: false,
  },
];
