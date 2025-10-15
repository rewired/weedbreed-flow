import js from "@eslint/js";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true
      }
    },
    plugins: {
      react
    },
    rules: {
      "react/react-in-jsx-scope": "off"
    }
  },
  prettier
];