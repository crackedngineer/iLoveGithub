import {Tool, RepoInfo, UIState, ExtensionElements, RepoAnalytics} from "./types";
import {debugLog, isRepoPage, getRepoInfo, filterTools} from "./helpers";
import {
  updateToolsListHTML,
  loadTools,
  createElement,
  addEventListenerWithCleanup,
  generatePopupHTML,
} from "./utils";
import {CSS_CLASSES, UI_CONSTANTS, DOM_IDS, LOGO_URL} from "./constants";

class ContentHandler {
  private elements: ExtensionElements = {
    floatingButton: null,
    popup: null,
    searchInput: null,
    toolsList: null,
  };

  private state: UIState = {
    isPopupOpen: false,
    isLoading: false,
    error: null,
    searchQuery: "",
    filteredTools: [],
  };

  private cleanupFunctions: (() => void)[] = [];
  private tools: Tool[] = [];
  private analytics: RepoAnalytics | null = null;
  private repoInfo: RepoInfo | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      debugLog("Initializing ContentHandler");

      if (!isRepoPage()) {
        debugLog("Not a repository page, skipping initialization");
        return;
      }

      this.repoInfo = getRepoInfo();
      if (!this.repoInfo) {
        this.setError("Could not detect repository information");
        return;
      }

      this.setLoading(true);

      await this.loadToolsData();
      this.createFloatingButton();
      this.setLoading(false);
    } catch (error) {
      debugLog("Initialization error:", error);
      this.setError("Failed to initialize extension");
      this.setLoading(false);
    }
  }

  /**
   * Load tools from extension storage
   */
  private async loadToolsData(): Promise<void> {
    this.tools = await loadTools(this.repoInfo);
    this.state.filteredTools = [...this.tools];
  }

  /**
   * State Management
   */
  private setError(error: string): void {
    this.state.error = error;
    debugLog("Error set:", error);
  }

  private setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    debugLog("Loading state:", isLoading);
  }

  private createFloatingButton(): void {
    const existing = document.getElementById("tools-btn");
    if (existing) existing.remove();

    const button = createElement("button", {
      id: "tools-btn",
      className: "tools-floating-btn",
      innerHTML: `<img class='tools-btn-icon' src="${LOGO_URL}" alt='iLoveGitHub Tools'/>`,
      title: "Open in iLoveGitHub",
      "aria-label": "Open in iLoveGitHub",
    });
    document.body.appendChild(button);
    this.elements.floatingButton = button;

    // Add event listener
    const cleanup = addEventListenerWithCleanup(
      button,
      "click",
      this.handleFloatingButtonClick.bind(this),
      {passive: true},
    );
    this.cleanupFunctions.push(cleanup);

    debugLog("Floating button created");
  }

  /**
   * Create and show popup
   */
  private createPopup(): void {
    if (!this.repoInfo) {
      this.setError("Could not detect repository");
      return;
    }

    const popup = createElement("div", {
      id: DOM_IDS.POPUP,
      className: `${CSS_CLASSES.POPUP} ${CSS_CLASSES.POPUP_HIDDEN}`,
    });

    popup.innerHTML = generatePopupHTML(
      this.repoInfo,
      this.analytics,
      this.state.filteredTools,
      this.tools,
      this.state.searchQuery,
    );

    document.body.appendChild(popup);
    this.elements.popup = popup;

    // Show with animation
    requestAnimationFrame(() => {
      popup.classList.remove(CSS_CLASSES.POPUP_HIDDEN);
      popup.classList.add(CSS_CLASSES.POPUP_VISIBLE);
    });

    this.bindPopupEvents();
    debugLog("Popup created");
  }

  /**
   * Bind event listeners to popup elements
   */
  private bindPopupEvents(): void {
    if (!this.elements.popup) return;

    // Tool search
    this.elements.searchInput = this.elements.popup.querySelector(`#${DOM_IDS.TOOL_SEARCH}`);
    if (this.elements.searchInput) {
      const cleanup = addEventListenerWithCleanup(
        this.elements.searchInput,
        "input",
        this.handleToolSearch.bind(this),
      );
      this.cleanupFunctions.push(cleanup);
    }

    // Tool items
    const toolItems = this.elements.popup.querySelectorAll(`.${CSS_CLASSES.TOOL_ITEM}`);
    toolItems.forEach((item) => {
      const cleanup = addEventListenerWithCleanup(
        item as HTMLElement,
        "click",
        this.handleToolClick.bind(this),
      );
      this.cleanupFunctions.push(cleanup);
    });

    // Outside click
    const outsideClickCleanup = addEventListenerWithCleanup(
      document,
      "click",
      this.handleOutsideClick.bind(this),
    );
    this.cleanupFunctions.push(outsideClickCleanup);
  }

  private handleOutsideClick(e: Event): void {
    const target = e.target as HTMLElement;

    if (
      this.state.isPopupOpen &&
      this.elements.popup &&
      this.elements.floatingButton &&
      !this.elements.popup.contains(target) &&
      target !== this.elements.floatingButton
    ) {
      this.hidePopup();
    }
  }

  private handleToolSearch(e: Event): void {
    const target = e.target as HTMLInputElement;
    const query = target.value.toLowerCase().trim();
    this.state.searchQuery = query;
    this.updateFilteredTools(query);
  }

  private handleToolClick(e: Event): void {
    const target = e.currentTarget as HTMLElement;
    const toolIndex = parseInt(target.dataset["toolIndex"] || "0", 10);

    if (toolIndex >= 0 && toolIndex < this.tools.length && this.repoInfo) {
      const tool = this.tools[toolIndex];
      window.open(tool.url, "_blank");
      this.hidePopup();
    }
  }

  /**
   * Update filtered tools and refresh UI
   */
  private updateFilteredTools(query: string): void {
    this.state.filteredTools = filterTools(this.tools, query);
    this.updateToolsList();
  }

  /**
   * Update tools list in DOM
   */
  private updateToolsList(): void {
    if (!this.elements.popup) return;

    const toolsList = this.elements.popup.querySelector(`.${CSS_CLASSES.TOOLS_LIST}`);
    if (!toolsList) return;

    // Update HTML
    toolsList.innerHTML = updateToolsListHTML(this.state.filteredTools, this.tools);

    // Re-bind tool click events
    const newToolItems = toolsList.querySelectorAll(`.${CSS_CLASSES.TOOL_ITEM}`);
    newToolItems.forEach((item) => {
      const cleanup = addEventListenerWithCleanup(
        item as HTMLElement,
        "click",
        this.handleToolClick.bind(this),
      );
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Event Handlers
   */
  private handleFloatingButtonClick(e: Event): void {
    e.stopPropagation();
    this.togglePopup();
  }

  /**
   * UI State Management
   */
  private togglePopup(): void {
    if (this.state.isPopupOpen) {
      this.hidePopup();
    } else {
      this.showPopup();
    }
  }

  private showPopup(): void {
    if (!this.state.isPopupOpen) {
      this.createPopup();
      this.state.isPopupOpen = true;
      debugLog("Popup shown");
    }
  }

  private hidePopup(): void {
    if (this.state.isPopupOpen && this.elements.popup) {
      this.elements.popup.classList.remove(CSS_CLASSES.POPUP_VISIBLE);
      this.elements.popup.classList.add(CSS_CLASSES.POPUP_HIDDEN);

      setTimeout(() => {
        if (this.elements.popup) {
          this.elements.popup.remove();
          this.elements.popup = null;
        }
      }, UI_CONSTANTS.POPUP_ANIMATION_DELAY);

      this.state.isPopupOpen = false;
      debugLog("Popup hidden");
    }
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
