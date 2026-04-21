import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import hooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
      "react-hooks": hooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...hooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "off",
      
      // Downgrade aggressive React 19 / Compiler rules to warnings for migration stability
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      
      // React 19 specific suggestions
      "react-hooks/set-state-in-effect": "off", // Disabling this as it's too disruptive for pre-existing logic
      "react-hooks/error-boundaries": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn"
    },
  },
  {
    ignores: [".next/*", "node_modules/*", "public/*"],
  },
];
