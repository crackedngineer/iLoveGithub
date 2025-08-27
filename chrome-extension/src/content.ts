import { GitHubTool } from "./types";
import { fetchTools } from "./utils";

class GitHubToolsOverlay {
  private overlay: HTMLDivElement | null = null;
  private currentRepo: { owner: string; repo: string } | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.detectRepository();
    await this.createOverlay();
    this.addEventListeners();
  }

  private detectRepository(): void {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/]+)\/([^\/]+)/);
    
    if (match) {
      this.currentRepo = {
        owner: match[1],
        repo: match[2]
      };
    }
  }

  private async createOverlay(): Promise<void> {
    if (!this.currentRepo) return;

    // Remove existing overlay
    const existingOverlay = document.getElementById('github-tools-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    this.overlay = document.createElement('div');
    this.overlay.id = 'github-tools-overlay';
    this.overlay.className = 'github-tools-overlay';
    this.overlay.innerHTML = await this.getOverlayHTML();

    document.body.appendChild(this.overlay);
    
    // Add click handlers
    this.addToolClickHandlers();
  }

  private async getOverlayHTML(): Promise<string> {
    if (!this.currentRepo) return '';

    const tools = await this.getAvailableTools();
    
    return `
      <div class="github-tools-container">
        <div class="github-tools-header">
          <div class="github-tools-title">
            <span class="github-tools-icon">🛠️</span>
            GitHub Tools
          </div>
          <div class="github-tools-repo">${this.currentRepo.owner}/${this.currentRepo.repo}</div>
          <button class="github-tools-close" id="close-tools">×</button>
        </div>
        


        <div class="github-tools-section">
          <h3>📊 Repository Analytics</h3>
          <div class="analytics-loading">Loading analytics...</div>
        </div>

        <div class="github-tools-section">
          <h3>🔗 Available Tools</h3>
          <div class="github-tools-grid">
            ${tools.map((tool: GitHubTool) => `
              <div class="github-tool-item" data-url="${tool.url}" style="border-left: 4px solid ${tool.color}">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-info">
                  <div class="tool-name">${tool.name}</div>
                  <div class="tool-description">${tool.description}</div>
                </div>
                <div class="tool-arrow">→</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private async getAvailableTools(): Promise<GitHubTool[]> {
    if (!this.currentRepo) return [];

    const { owner, repo } = this.currentRepo;
    
    const githubTools: GitHubTool[] = await fetchTools();
    return githubTools.filter((tool: GitHubTool) => 
      tool.url.includes('{owner}') && tool.url.includes('{repo}')
    ).map((tool: GitHubTool) => ({
      ...tool,
      url: tool.url.replace('{owner}', owner).replace('{repo}', repo)
    }));
  }

  private addToolClickHandlers(): void {
    if (!this.overlay) return;

    const toolItems = this.overlay.querySelectorAll('.github-tool-item');
    toolItems.forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
          this.trackToolUsage(item.querySelector('.tool-name')?.textContent || 'Unknown');
        }
      });
    });

    const closeBtn = this.overlay.querySelector('#close-tools');
    // const closeBtn = this.overlay.querySelector('#close-tools');
    closeBtn?.addEventListener('click', () => {
      this.hideOverlay();
    });

    const searchBtn = this.overlay.querySelector('#search-btn');
    const searchInput = this.overlay.querySelector('#repo-search') as HTMLInputElement;
    
    const handleSearch = () => {
      const query = searchInput?.value.trim();
      if (query) {
        window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank');
      }
    };

    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  private addEventListeners(): void {
    // Add floating action button
    this.createFloatingButton();

    // Listen for URL changes and window resize
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          this.detectRepository();
          this.repositionFloatingButton();
          if (this.overlay && this.overlay.style.display !== 'none') {
            this.createOverlay();
          }
        }, 500);
      }
    }).observe(document, { subtree: true, childList: true });

    // Reposition button on window resize
    window.addEventListener('resize', () => {
      this.repositionFloatingButton();
    });
  }

  private repositionFloatingButton(): void {
    const fab = document.getElementById('github-tools-fab');
    if (fab) {
      this.positionFloatingButton(fab);
    }
  }

  private createFloatingButton(): void {
    const existingBtn = document.getElementById('github-tools-fab');
    if (existingBtn) {
      existingBtn.remove();
    }

    const fab = document.createElement('div');
    fab.id = 'ilovegithub-tools-fab';
    fab.className = 'ilovegithub-tools-fab';
    fab.innerHTML = `
        <img src="https://raw.githubusercontent.com/crackedngineer/iLoveGithub/refs/heads/master/public/icons/favicon.png" 
            id="ilovegithub-fab-icon"
            alt="iLoveGitHub" 
            style="width:32px;height:32px;"
        />
    `;
    fab.title = 'iLoveGitHub Tools';

    fab.addEventListener('click', () => {
      this.toggleOverlay();
    });

    // Position the button to align with GitHub's main content
    this.positionFloatingButton(fab);
    document.body.appendChild(fab);
  }

  private positionFloatingButton(fab: HTMLElement): void {
    // Try to align with GitHub's main content area
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.application-main') || 
                       document.querySelector('[data-pjax-container]') ||
                       document.querySelector('.container-xl');
    
    if (mainContent) {
      const rect = mainContent.getBoundingClientRect();
      const rightEdge = rect.right;
      
      // Position 20px to the right of content area, or fallback to standard position
      if (rightEdge > 0 && rightEdge < window.innerWidth - 76) {
        fab.style.right = `${window.innerWidth - rightEdge - 76}px`;
      } else {
        fab.style.right = '20px';
      }
    } else {
      fab.style.right = '20px';
    }
    
    fab.style.bottom = '20px';
  }

  private toggleOverlay(): void {
    if (!this.overlay) {
      this.createOverlay();
    //   this.loadAnalytics();
    } else {
      if (this.overlay.style.display === 'none') {
        this.showOverlay();
      } else {
        this.hideOverlay();
      }
    }
  }

  private showOverlay(): void {
    if (this.overlay) {
      this.overlay.style.display = 'block';
    //   this.loadAnalytics();
    }
  }

  private hideOverlay(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }

  private async loadAnalytics(): Promise<void> {
    if (!this.currentRepo || !this.overlay) return;

    const analyticsContainer = this.overlay.querySelector('.analytics-loading');
    if (!analyticsContainer) return;

    try {
      // Simulate loading analytics (in real implementation, you'd fetch from GitHub API)
      analyticsContainer.textContent = 'Loading analytics...';
      
      setTimeout(() => {
        const mockData = this.generateMockAnalytics();
        analyticsContainer.innerHTML = `
          <div class="analytics-grid">
            <div class="analytics-item">
              <div class="analytics-value">${mockData.stars}</div>
              <div class="analytics-label">⭐ Stars</div>
            </div>
            <div class="analytics-item">
              <div class="analytics-value">${mockData.forks}</div>
              <div class="analytics-label">🍴 Forks</div>
            </div>
            <div class="analytics-item">
              <div class="analytics-value">${mockData.issues}</div>
              <div class="analytics-label">🐛 Issues</div>
            </div>
            <div class="analytics-item">
              <div class="analytics-value">${mockData.prs}</div>
              <div class="analytics-label">🔄 PRs</div>
            </div>
          </div>
          <div class="analytics-chart">
            <canvas id="activity-chart" width="300" height="100"></canvas>
          </div>
        `;
        this.renderActivityChart();
      }, 1000);
    } catch (error) {
      analyticsContainer.innerHTML = '<div class="analytics-error">Failed to load analytics</div>';
    }
  }

  private generateMockAnalytics() {
    return {
      stars: Math.floor(Math.random() * 10000),
      forks: Math.floor(Math.random() * 1000),
      issues: Math.floor(Math.random() * 100),
      prs: Math.floor(Math.random() * 50)
    };
  }

  private renderActivityChart(): void {
    const canvas = document.getElementById('activity-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple activity chart
    const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10));
    const max = Math.max(...data);
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;

    ctx.fillStyle = '#6366f1';
    data.forEach((value, index) => {
      const barHeight = (value / max) * height * 0.8;
      ctx.fillRect(index * barWidth, height - barHeight, barWidth - 1, barHeight);
    });
  }

  private trackToolUsage(toolName: string): void {
    chrome.runtime.sendMessage({
      type: 'TRACK_TOOL_USAGE',
      data: { toolName, repo: this.currentRepo }
    });
  }
}

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GitHubToolsOverlay();
  });
} else {
  new GitHubToolsOverlay();
}