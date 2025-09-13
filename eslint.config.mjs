import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
  },
  plugins: {
    "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
  },
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
  },
  ignores: ["**/node_modules/**", "**/dist/**"],

  extends: [...compat.extends("next/core-web-vitals", "next/typescript")],
});
