import js from "@eslint/js";
import next from "@next/eslint-plugin-next";

export default [
  {
    ignores: ["lib/generated/**"],
  },
  js.configs.recommended,
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...next.configs["core-web-vitals"].rules,
    },
  },
];
