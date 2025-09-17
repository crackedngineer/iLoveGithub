import {Tool} from "./types";
import {fetchTools} from "./utils";

interface AnalyticsData {
  toolName: string;
  repo: {owner: string; repo: string};
  timestamp: number;
}

class BackgroundService {
  private analytics: AnalyticsData[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    // Load stored analytics
    // this.loadAnalytics();

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle extension icon click
    // chrome.action.onClicked.addListener((tab) => {
    //   this.handleActionClick(tab);
    // });

    // Handle installation
    chrome.runtime.onInstalled.addListener(() => {
      this.handleInstallation();
    });
  }

  // private async loadAnalytics(): Promise<void> {
  //   try {
  //     const result = await chrome.storage.local.get(["analytics"]);
  //     this.analytics = result.analytics || [];
  //   } catch (error) {
  //     console.error("Failed to load analytics:", error);
  //   }
  // }

  // private async saveAnalytics(): Promise<void> {
  //   try {
  //     await chrome.storage.local.set({analytics: this.analytics});
  //   } catch (error) {
  //     console.error("Failed to save analytics:", error);
  //   }
  // }

  private handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void {
    switch (message.type) {
      case "TRACK_TOOL_USAGE":
        this.trackToolUsage(message.data);
        sendResponse({success: true});
        break;

      case "GET_ANALYTICS":
        sendResponse({analytics: this.analytics});
        break;

      case "FETCH_TOOLS":
        this.handleFetchTools({
          owner: message.data.owner,
          repo: message.data.repo,
          default_branch: message.data.default_branch || "master",
        })
          .then((tools: Tool[]) => sendResponse({success: true, data: tools}))
          .catch((error: Error) => sendResponse({success: false, error: error.message}));
        break;

      case "GET_REPO_INFO":
        this.getRepositoryInfo(message.data.owner, message.data.repo)
          .then((info) => sendResponse({success: true, data: info}))
          .catch((error) => sendResponse({success: false, error: error.message}));
        break;

      default:
        sendResponse({success: false, error: "Unknown message type"});
    }
  }

  private trackToolUsage(data: {toolName: string; repo: {owner: string; repo: string}}): void {
    const analyticsEntry: AnalyticsData = {
      toolName: data.toolName,
      repo: data.repo,
      timestamp: Date.now(),
    };

    this.analytics.push(analyticsEntry);

    // Keep only last 1000 entries
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }

    // this.saveAnalytics();
  }

  private async getRepositoryInfo(owner: string, repo: string): Promise<any> {
    try {
      // In a real implementation, you would use GitHub API with proper authentication
      // This is a mock implementation
      return {
        owner,
        repo,
        stars: Math.floor(Math.random() * 10000),
        forks: Math.floor(Math.random() * 1000),
        issues: Math.floor(Math.random() * 100),
        pullRequests: Math.floor(Math.random() * 50),
        language: "JavaScript",
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error}`);
    }
  }

  private async handleFetchTools(data: {
    owner: string;
    repo: string;
    default_branch: string;
  }): Promise<any> {
    return await fetchTools(data.owner, data.repo, data.default_branch || "master");
  }

  // private handleActionClick(tab: chrome.tabs.Tab): void {
  //   if (tab.url?.includes("github.com")) {
  //     chrome.tabs.sendMessage(tab.id!, {type: "TOGGLE_OVERLAY"});
  //   } else {
  //     // If not on GitHub, open GitHub
  //     chrome.tabs.create({url: "https://github.com"});
  //   }
  // }

  private handleInstallation(): void {
    // Set up default storage
    // chrome.storage.local.set({
    //   analytics: [],
    //   settings: {
    //     autoShow: true,
    //     defaultTools: ["uithub", "github1s", "gitpod"],
    //   },
    // });
    // Show welcome message
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL("welcome.html"),
    // });
  }

  public getPopularTools(): {name: string; count: number}[] {
    const toolCounts = new Map<string, number>();

    this.analytics.forEach((entry) => {
      const current = toolCounts.get(entry.toolName) || 0;
      toolCounts.set(entry.toolName, current + 1);
    });

    return Array.from(toolCounts.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  public getRecentRepositories(): {owner: string; repo: string; lastUsed: number}[] {
    const repoMap = new Map<string, number>();

    this.analytics.forEach((entry) => {
      const key = `${entry.repo.owner}/${entry.repo.repo}`;
      repoMap.set(key, Math.max(repoMap.get(key) || 0, entry.timestamp));
    });

    return Array.from(repoMap.entries())
      .map(([repo, lastUsed]) => {
        const [owner, repoName] = repo.split("/");
        return {owner, repo: repoName, lastUsed};
      })
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 10);
  }
}

// Initialize background service
new BackgroundService();
