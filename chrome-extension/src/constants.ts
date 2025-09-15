export const BASE_URL = "https://ilovegithub.oderna.in";
export const LOGO_URL =
  "https://raw.githubusercontent.com/crackedngineer/ilovegithub/master/public/icons/favicon.png";

// DOM IDs and Classes
export const DOM_IDS = {
  FLOATING_BUTTON: "tools-btn",
  POPUP: "tools-popup",
  TOOL_SEARCH: "tool-search",
} as const;

export const CSS_CLASSES = {
  FLOATING_BUTTON: "tools-floating-btn",
  POPUP: "tools-popup",
  POPUP_HIDDEN: "tools-popup-hidden",
  POPUP_VISIBLE: "tools-popup-visible",
  TOOL_ITEM: "tool-item",
  TOOLS_LIST: "tools-list",
} as const;

// Animation and UI constants
export const UI_CONSTANTS = {
  POPUP_ANIMATION_DELAY: 300,
  SPA_NAVIGATION_DELAY: 1000,
  FLOATING_BUTTON_SIZE: 50,
  POPUP_WIDTH: 380,
  POPUP_MAX_HEIGHT: 600,
  TOOLS_LIST_MAX_HEIGHT: 350,
} as const;

// GitHub page paths to exclude
export const EXCLUDED_GITHUB_PATHS = [
  "settings",
  "notifications",
  "explore",
  "marketplace",
  "sponsors",
] as const;

// Message types for extension communication
export const MESSAGE_TYPES = {
  FETCH_TOOLS: "FETCH_TOOLS",
} as const;

// Environment constants
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
