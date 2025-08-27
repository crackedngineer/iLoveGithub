interface PopupData {
  currentTab?: chrome.tabs.Tab;
  analytics: any[];
  popularTools: { name: string; count: number }[];
  recentRepos: { owner: string; repo: string; lastUsed: number }[];
}

class PopupManager {
  private data: PopupData = {
    analytics: [],
    popularTools: [],
    recentRepos: []
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    this.render();
    this.addEventListeners();
  }

  private async loadData(): Promise<void> {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.data.currentTab = tab;

      // Get analytics data
      const response = await chrome.runtime.sendMessage({ type: 'GET_ANALYTICS' });
      this.data.analytics = response.analytics || [];

      // Process analytics for popular tools and recent repos
      this.processAnalytics();
    } catch (error) {
      console.error('Failed to load popup data:', error);
    }
  }

  private processAnalytics(): void {
    const toolCounts = new Map<string, number>();
    const repoMap = new Map<string, number>();

    this.data.analytics.forEach((entry: any) => {
      // Count tool usage
      const current = toolCounts.get(entry.toolName) || 0;
      toolCounts.set(entry.toolName, current + 1);

      // Track recent repositories
      const repoKey = `${entry.repo.owner}/${entry.repo.repo}`;
      repoMap.set(repoKey, Math.max(repoMap.get(repoKey) || 0, entry.timestamp));
    });

    // Popular tools
    this.data.popularTools = Array.from(toolCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent repositories
    this.data.recentRepos = Array.from(repoMap.entries())
      .map(([repo, lastUsed]) => {
        const [owner, repoName] = repo.split('/');
        return { owner, repo: repoName, lastUsed };
      })
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 8);
  }

  private render(): void {
    const container = document.getElementById('popup-container');
    if (!container) return;

    const isGitHub = this.data.currentTab?.url?.includes('github.com');
    
    container.innerHTML = `
      <div class="popup-header">
        <div class="popup-title">
          <span class="popup-icon">🛠️</span>
          GitHub Tools
        </div>
        <div class="popup-subtitle">
          ${isGitHub ? this.getCurrentRepoName() : 'Not on GitHub'}
        </div>
      </div>

      ${isGitHub ? this.renderCurrentRepoTools() : this.renderGeneralTools()}

      <div class="popup-section">
        <h3>📊 Popular Tools</h3>
        ${this.renderPopularTools()}
      </div>

      <div class="popup-section">
        <h3>🕒 Recent Repositories</h3>
        ${this.renderRecentRepos()}
      </div>

      <div class="popup-footer">
        <button id="open-github" class="footer-btn">
          <span>🏠</span> GitHub Home
        </button>
        <button id="clear-data" class="footer-btn">
          <span>🗑️</span> Clear Data
        </button>
      </div>
    `;
  }

  private getCurrentRepoName(): string {
    if (!this.data.currentTab?.url) return '';
    
    const match = this.data.currentTab.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? `${match[1]}/${match[2]}` : 'GitHub';
  }

  private renderCurrentRepoTools(): string {
    const repoMatch = this.data.currentTab?.url?.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) return '';

    const [, owner, repo] = repoMatch;
    const tools = [
      { name: 'Uithub', icon: '👁️', url: `https://uithub.com/${owner}/${repo}` },
      { name: 'GitHub1s', icon: '💻', url: `https://github1s.com/${owner}/${repo}` },
      { name: 'GitPod', icon: '☁️', url: `https://gitpod.io/#https://github.com/${owner}/${repo}` },
      { name: 'CodeSandbox', icon: '📦', url: `https://codesandbox.io/s/github/${owner}/${repo}` }
    ];

    return `
      <div class="popup-section">
        <h3>🔗 Current Repository Tools</h3>
        <div class="tools-grid">
          ${tools.map(tool => `
            <button class="tool-btn" data-url="${tool.url}" data-tool="${tool.name}">
              <span class="tool-icon">${tool.icon}</span>
              <span class="tool-name">${tool.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderGeneralTools(): string {
    return `
      <div class="popup-section">
        <h3>🔍 Search GitHub</h3>
        <div class="search-container">
          <input type="text" id="github-search" placeholder="Search repositories..." />
          <button id="search-btn">🔍</button>
        </div>
      </div>
    `;
  }

  private renderPopularTools(): string {
    if (this.data.popularTools.length === 0) {
      return '<div class="empty-state">No usage data yet</div>';
    }

    return `
      <div class="popular-tools">
        ${this.data.popularTools.map(tool => `
          <div class="popular-tool">
            <span class="tool-name">${tool.name}</span>
            <span class="tool-count">${tool.count}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderRecentRepos(): string {
    if (this.data.recentRepos.length === 0) {
      return '<div class="empty-state">No recent repositories</div>';
    }

    return `
      <div class="recent-repos">
        ${this.data.recentRepos.map(repo => `
          <div class="recent-repo" data-owner="${repo.owner}" data-repo="${repo.repo}">
            <span class="repo-name">${repo.owner}/${repo.repo}</span>
            <span class="repo-time">${this.formatTime(repo.lastUsed)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  private addEventListeners(): void {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        const toolName = btn.getAttribute('data-tool');
        if (url) {
          chrome.tabs.create({ url });
          if (toolName) {
            this.trackToolUsage(toolName);
          }
          window.close();
        }
      });
    });

    // Search functionality
    const searchInput = document.getElementById('github-search') as HTMLInputElement;
    const searchBtn = document.getElementById('search-btn');
    
    const handleSearch = () => {
      const query = searchInput?.value.trim();
      if (query) {
        chrome.tabs.create({ url: `https://github.com/search?q=${encodeURIComponent(query)}` });
        window.close();
      }
    };

    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });

    // Recent repositories
    document.querySelectorAll('.recent-repo').forEach(repo => {
      repo.addEventListener('click', () => {
        const owner = repo.getAttribute('data-owner');
        const repoName = repo.getAttribute('data-repo');
        if (owner && repoName) {
          chrome.tabs.create({ url: `https://github.com/${owner}/${repoName}` });
          window.close();
        }
      });
    });

    // Footer buttons
    document.getElementById('open-github')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://github.com' });
      window.close();
    });

    document.getElementById('clear-data')?.addEventListener('click', () => {
      if (confirm('Clear all usage data?')) {
        chrome.storage.local.clear().then(() => {
          this.data.analytics = [];
          this.data.popularTools = [];
          this.data.recentRepos = [];
          this.render();
        });
      }
    });
  }

  private async trackToolUsage(toolName: string): Promise<void> {
    const repoMatch = this.data.currentTab?.url?.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      chrome.runtime.sendMessage({
        type: 'TRACK_TOOL_USAGE',
        data: { toolName, repo: { owner, repo } }
      });
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});