import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/out/**", "**/venv/**"],
  },

  nextPlugin.configs.recommended,
  nextPlugin.configs["core-web-vitals"],

  ...tsPlugin.configs["flat/recommended"],

  jsxA11y.flatConfigs.recommended,

  {
    files: ["**/app/layout.tsx"],
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
