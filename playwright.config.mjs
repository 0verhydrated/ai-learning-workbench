import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4322/vibe-coding-book/",
    colorScheme: "light",
    launchOptions: { executablePath: process.env.CHROME_PATH },
  },
  webServer: {
    command: "node tests/browser/serve.mjs",
    url: "http://127.0.0.1:4322/vibe-coding-book/",
    reuseExistingServer: !process.env.CI,
  },
});
