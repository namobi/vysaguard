import js from "@eslint/js";
import next from "@next/eslint-plugin-next";

export default [
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
