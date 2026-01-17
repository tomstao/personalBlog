import eslint from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import astroPlugin from "eslint-plugin-astro"
import solidPlugin from "eslint-plugin-solid"
import globals from "globals"

// Global functions defined in public/js/nav.js
const navGlobals = {
  updateHeaderNav: "readonly",
  updateDrawerNav: "readonly",
}

export default [
  eslint.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...navGlobals,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      solid: solidPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/triple-slash-reference": "off",
      "solid/reactivity": "warn",
      "solid/no-destructure": "warn",
      "solid/jsx-no-duplicate-props": "error",
    },
  },
  {
    files: ["**/*.config.{js,mjs,ts}", "tailwind.config.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["src/pages/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        URL: "readonly",
        Response: "readonly",
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".astro/", "public/js/"],
  },
]
