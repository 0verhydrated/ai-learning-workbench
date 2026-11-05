import { test, expect } from "@playwright/test";

test("theme follows the OS, persists an explicit choice, and stays across lessons", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Switch to light mode" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.getByRole("link", { name: "Start learning", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect(page.locator("h1")).toHaveText(
    "Models, apps, and choosing the right tool",
  );
});

test("walkthroughs progress, replay, switch with a keyboard, and link to the correct lesson", async ({
  page,
}) => {
  await page.goto("./");
  const panel = page.locator('[data-panel="mcp"]');
  await panel.getByRole("button", { name: "Run example" }).click();
  await expect(panel.locator(".step-done")).toHaveCount(1);
  await panel.getByRole("button", { name: "Next step" }).click();
  await panel.getByRole("button", { name: "Next step" }).click();
  await expect(panel).toHaveClass(/is-complete/);
  await expect(page.getByRole("status")).toContainText("Example complete");
  await panel.getByRole("button", { name: "Replay example" }).click();
  await expect(panel.locator(".step-done")).toHaveCount(1);
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  await expect(panel).toBeHidden();
  const skills = page.locator('[data-panel="skills"]');
  await expect(skills).toBeVisible();
  await expect(
    skills.getByRole("link", { name: "Build a skill" }),
  ).toHaveAttribute("href", /03-skills/);
  await page
    .getByRole("button", { name: "Skills", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "Tools", exact: true }),
  ).toBeFocused();
  await expect(page.locator('[data-panel="tools"]')).toBeVisible();
  await page.getByRole("button", { name: ".md files", exact: true }).click();
  await expect(page.locator('[data-panel="markdown"]')).toContainText(
    "AGENTS.md",
  );
});

test("mobile navigation, chapter menu, language selection, and disclosures work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-nav")).toBeHidden();
  const code = page.locator('[data-panel="mcp"] .demo-code');
  await expect(code).not.toHaveAttribute("open", "");
  await code.locator("summary").click();
  await expect(code.locator("pre")).toBeVisible();
  await page.locator(".language-menu summary").click();
  await page
    .locator(".language-menu")
    .getByRole("link", { name: "한국어" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.goto("ko/courses/agents-tools/02-mcp/");
  await page.locator("#menu-toggle").click();
  await expect(page.locator("#sidebar")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#sidebar")).toBeHidden();
  await page.locator(".language-menu summary").click();
  await expect(page.locator('.language-menu [lang="en"]')).toHaveAttribute(
    "href",
    "/vibe-coding-book/courses/agents-tools/02-mcp/",
  );
});

for (const language of ["", "ko/"])
  for (const mode of ["light", "dark"] as const) {
    test(`${language || "en"} ${mode}: responsive pages have no horizontal overflow`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: mode });
      for (const width of [375, 768, 1280, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ["", "courses/agents-tools/02-mcp/", "news/"]) {
          await page.goto(language + route);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await expect(page.locator("h1")).toBeVisible();
        }
      }
    });
  }

test("courses, language links, and all example material remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322/vibe-coding-book/");
  await expect(page.locator(".course-tile")).toHaveCount(4);
  await expect(page.locator("[data-panel]")).toHaveCount(4);
  for (const panel of await page.locator("[data-panel]").all())
    await expect(panel).toBeVisible();
  await page.locator(".language-menu summary").click();
  await expect(page.locator('.language-menu [lang="ko"]')).toBeVisible();
  await context.close();
});

test("capture the shipped experience in both modes and languages", async ({
  page,
}) => {
  for (const mode of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" });
    for (const [name, route, width, height] of [
      ["home", "", 1440, 900],
      ["phone", "", 375, 812],
      ["korean", "ko/", 1440, 900],
      ["lesson", "courses/agents-tools/02-mcp/", 1440, 900],
      ["news", "news/", 1440, 900],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `.hallmark/qa/${name}-${mode}.png`,
        fullPage: name === "home",
      });
    }
  }
});

test("both themes maintain readable token contrast", async ({ page }) => {
  await page.goto("./");
  for (const mode of ["light", "dark"]) {
    await page.evaluate(
      (value) => (document.documentElement.dataset.mode = value),
      mode,
    );
    const pairs = await page.evaluate(() => {
      const probe = document.createElement("span");
      document.body.append(probe);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      const luminance = (token: string) => {
        probe.style.color = `var(${token})`;
        ctx.fillStyle = getComputedStyle(probe).color;
        ctx.fillRect(0, 0, 1, 1);
        const rgb = Array.from(ctx.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((v) => {
            const s = v / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const ratio = (a: string, b: string) => {
        const x = luminance(a),
          y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const checks = [
        ...["--color-paper", "--color-paper-2", "--color-paper-3"].flatMap(
          (bg) => [
            ["--color-ink", bg, 4.5],
            ["--color-muted", bg, 4.5],
            ["--color-focus", bg, 3],
          ],
        ),
        ["--color-accent-ink", "--color-accent", 4.5],
      ] as [string, string, number][];
      const results = checks.map(([fg, bg, min]) => ({
        fg,
        bg,
        min,
        ratio: ratio(fg, bg),
      }));
      probe.remove();
      return results;
    });
    for (const pair of pairs)
      expect(
        pair.ratio,
        `${mode}: ${pair.fg} on ${pair.bg}`,
      ).toBeGreaterThanOrEqual(pair.min);
  }
});
