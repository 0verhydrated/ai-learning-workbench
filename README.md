# The Vibe Coding Book

A reading-first Astro course with Markdown lessons, practical examples, and exercises. No authentication, chatbot, backend, or API keys.

## Local development

Use Node.js 24 (supported LTS) and npm. Install the locked dependencies:

```sh
npm ci
npm run dev
```

Open http://localhost:4321/vibe-coding-book/ . The repository base path also applies locally.

```sh
npm run check
npm run build
npm test
npm run preview
```

## Content

Edit lessons in `src/content/lessons/`. The content collection accepts `.md` and `.mdx`. Frontmatter requires `title`, `description`, `order`, `part`, and `duration`. Chapter navigation and heading tables of contents are generated from content. Duration values are approximate reading estimates.

## Languages

English pages retain their original URLs. Korean pages live under `/vibe-coding-book/ko/`, with the same lesson IDs. The language menu links to the corresponding lesson rather than resetting to the introduction. Ordinary links work without JavaScript; no browser-language redirect or preference cookie is used.

- English lessons: `src/content/lessons/`
- Korean lessons: `src/content/korean/` (matching filenames and order)
- Shared interface translations: `src/i18n.ts`
- Introduction pages: `src/pages/index.astro` and `src/pages/ko/index.astro`

Keep the `part` frontmatter values in English; the interface translates them. Translate titles, descriptions, explanations, prompts, and exercises without changing executable identifiers or commands. Update both language versions when changing lesson content. Each page includes its language, canonical URL, and alternate-language metadata. Tests verify lesson parity, matching language links, and that Korean previous/next links stay in Korean.

## AI News

The English `/news/` and Korean `/ko/news/` pages share `src/data/news.json`. Each issue contains three source-linked summaries, original publication dates, an explicit coverage window, and concrete suggested experiments. Selection prioritizes useful skills, MCP integrations, libraries, and techniques—not big-tech headlines or policy debates. Popularity claims require dated evidence. The language menu preserves the news page.

The approved Hermes job is enabled for **Sunday 08:00 KST (Asia/Seoul)**. It researches the news and updates only the data file; the existing GitHub Actions workflow builds and deploys the resulting commit. Publication occurs after research and deployment, not exactly at the scheduled start time. This requires the local machine to be awake and online with the Hermes gateway running; it is not a GitHub-hosted research scheduler. It uses the configured model/search services.

See [the news update procedure](docs/news-update.md) for source verification, safe isolated-worktree updates, tests, and failure handling. If research or verification fails, the old issue stays live with its original update date. No API keys are shipped in the site.

## GitHub Pages

Target repository: `0verhydrated/vibe-coding-book`.
Expected URL: https://0verhydrated.github.io/vibe-coding-book/

`astro.config.mjs` sets the Pages origin and repository base. Internal page and asset links use `import.meta.env.BASE_URL`. If the repository name or owner changes, update the config and verify links again.

Select **GitHub Actions** as the repository's Pages source. Pushes to `main` run `.github/workflows/deploy.yml`: install, type check, build, test, upload the static artifact, then deploy. `workflow_dispatch` supports manual redeployment. GitHub's short-lived Actions token handles publishing; no personal access token needs to be stored in this repository.

Only the deploy job receives Pages write and OIDC permissions. Generated output, dependencies, local environment files, and private-key files are ignored. Never add real secrets to Markdown examples or client code. The Google Fonts stylesheet is an optional external request; local serif/sans fallbacks are defined.

A successful workflow does not replace checking the live homepage, chapter navigation, CSS loading, and a mobile viewport. To roll back, revert the faulty commit and push the revert to `main`.
