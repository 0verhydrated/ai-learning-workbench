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

## GitHub Pages

Target repository: `0verhydrated/vibe-coding-book`.
Expected URL: https://0verhydrated.github.io/vibe-coding-book/

`astro.config.mjs` sets the Pages origin and repository base. Internal page and asset links use `import.meta.env.BASE_URL`. If the repository name or owner changes, update the config and verify links again.

Select **GitHub Actions** as the repository's Pages source. Pushes to `main` run `.github/workflows/deploy.yml`: install, type check, build, test, upload the static artifact, then deploy. `workflow_dispatch` supports manual redeployment. GitHub's short-lived Actions token handles publishing; no personal access token needs to be stored in this repository.

Only the deploy job receives Pages write and OIDC permissions. Generated output, dependencies, local environment files, and private-key files are ignored. Never add real secrets to Markdown examples or client code. The Google Fonts stylesheet is an optional external request; local serif/sans fallbacks are defined.

A successful workflow does not replace checking the live homepage, chapter navigation, CSS loading, and a mobile viewport. To roll back, revert the faulty commit and push the revert to `main`.
