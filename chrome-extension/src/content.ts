import {Tool, RepoInfo} from "./types";

class ContentHandler {
  private tools: Tool[];

  constructor() {
    this.tools = [];
    this.initialize();
  }

  private async initialize() {
    const tools = await chrome.runtime.sendMessage({type: "FETCH_TOOLS", data: this.getRepoInfo()});
    this.tools = tools.data || [];
    this.init();
  }

  private init(): void {
    if (this.isRepoPage()) {
      this.createFloatingButton();
    }
  }

  private isRepoPage(): boolean {
    const path = window.location.pathname;
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length >= 2) {
      const excludedPaths = ["settings", "notifications", "explore", "marketplace", "sponsors"];
      return !excludedPaths.includes(pathParts[0]);
    }
    return false;
  }

  private getRepoInfo(): RepoInfo | null {
    const path = window.location.pathname;
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1],
        default_branch: "main",
      };
    }
    return null;
  }

  private createFloatingButton(): void {
    const existing = document.getElementById("github-tools-btn");
    if (existing) existing.remove();

    const button = document.createElement("button");
    button.id = "github-tools-btn";
    button.innerHTML = "🔧";
    button.title = "Open in GitHub Tools";
    button.className = "github-tools-floating-btn";

    const popup = document.createElement("div");
    popup.id = "github-tools-popup";
    popup.className = "github-tools-popup hidden";
    popup.innerHTML = this.createPopupContent();

    document.body.appendChild(button);
    document.body.appendChild(popup);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!popup.contains(e.target as Node) && e.target !== button) {
        popup.classList.add("hidden");
      }
    });

    this.addToolClickHandlers();
    this.addSearchHandler();
    this.addLoginHandler();
  }

  private addSearchHandler(): void {
    const searchInput = document.getElementById("repo-search") as HTMLInputElement | null;
    const searchBtn = document.getElementById("search-btn");

    if (searchInput && searchBtn) {
      const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
          window.open(
            `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
            "_blank",
          );
          document.getElementById("github-tools-popup")?.classList.add("hidden");
        }
      };

      searchBtn.addEventListener("click", performSearch);
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performSearch();
        }
      });
    }
  }

  private addLoginHandler(): void {
    const loginBtn = document.getElementById("github-login");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        window.open("https://github.com/login", "_blank");
        document.getElementById("github-tools-popup")?.classList.add("hidden");
      });
    }
  }

  private createPopupContent(): string {
    const repoInfo = this.getRepoInfo();
    if (!repoInfo) return '<div class="error">Could not detect repository</div>';

    let content = `
      <div class="popup-header">
        <h3>🔧 iLoveGithub</h3>
        <div class="repo-info">${repoInfo.owner}/${repoInfo.repo}</div>
      </div>
      <div class="tools-list">
    `;

    this.tools.forEach((tool, index) => {
      content += `
        <div class="tool-item" data-tool-index="${index}">
          <img src="${tool.icon}" class="tool-icon" />
          <div class="tool-details">
            <div class="tool-name">${tool.name}</div>
            <div class="tool-description">${tool.description}</div>
          </div>
          <span class="tool-arrow">→</span>
        </div>
      `;
    });

    content += "</div>";
    return content;
  }

  private addToolClickHandlers(): void {
    const toolItems = document.querySelectorAll<HTMLElement>(".tool-item");
    toolItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const toolIndex = parseInt((e.currentTarget as HTMLElement).dataset.toolIndex ?? "-1");
        if (toolIndex >= 0) {
          this.openTool(toolIndex);
        }
      });
    });
  }

  private openTool(toolIndex: number): void {
    const tool = this.tools[toolIndex];
    const repoInfo = this.getRepoInfo();

    if (!repoInfo) {
      console.error("Could not get repository information");
      return;
    }

    const url = tool.url
      .replace("{owner}", repoInfo.owner)
      .replace("{repo}", repoInfo.repo)
      .replace("{branch}", repoInfo.default_branch || "main");

    window.open(url, "_blank");
    document.getElementById("github-tools-popup")?.classList.add("hidden");
  }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ContentHandler();
  });
} else {
  new ContentHandler();
}

// Handle page navigation (for GitHub SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      new ContentHandler();
    }, 1000);
  }
}).observe(document, {subtree: true, childList: true});
