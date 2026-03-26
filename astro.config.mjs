import mdx from "@astrojs/mdx";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import AutoImport from "astro-auto-import";
import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://zetax.jp",
  adapter: cloudflare(),
  redirects: {
    "/admin": "/keystatic",
  },
  // i18n configuration must match src/config/translations.json.ts
  i18n: {
    defaultLocale: "ja",
    locales: ["en", "ja"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      // Shiki Themes: https://shiki.style/themes
      theme: "css-variables",
      wrap: false,
    },
  },
  integrations: [
    // example auto import component into mdx files
    AutoImport({
      imports: [
        // https://github.com/delucis/astro-auto-import
        "@components/Admonition/Admonition.astro",
      ],
    }),
    mdx(),
    react(),
    icon(),
    keystatic(),
    sitemap(),
    compress({
      HTML: true,
      JavaScript: true,
      CSS: false, // enabling this can cause issues
      Image: false, // astro:assets handles this. Enabling this can dramatically increase build times
      SVG: false, // astro-icon handles this
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});