---
title: "Deploy, verify, and keep a way back"
description: "Publish the static reading list with correct paths, honest configuration, accessibility checks, and rollback planning."
order: 12
part: 'Advanced practice'
duration: '20 min'
---

## Publish only what the browser needs

The reading list is a static application. A host serves HTML, CSS, and JavaScript; the visitor's browser handles interaction and localStorage. You do not need an application server or database for this design. Choose a static host whose deployment process you can inspect and whose previous releases you can restore.

Prepare a publish directory containing the page, styles, browser modules, and any required assets. Do not upload your repository metadata, credentials, personal notes, or development-only files by accident. If your host deploys directly from a repository, inspect its publish-directory setting rather than assuming the repository root is appropriate.

Before deploying, run the tests and local browser checklist, then record the commit you intend to publish. Treat the upload result as confirmation that the host accepted files. You still need to open the published page and verify that those files work together there.

## Test the deployed base path

Some hosts publish at a domain root, while others use a project prefix such as `/reading-list/`. Root-relative paths begin at the domain root and may point to the wrong place under that prefix.

```html
<!-- Relative to the document's directory -->
<link rel="stylesheet" href="./styles.css">
<script type="module" src="./app.js"></script>
```

Imports inside JavaScript modules resolve relative to the importing module's URL. Check those paths too, including filename capitalization: a local filesystem may tolerate a mismatch that the host does not. Confirm that the host serves `.mjs` files with a JavaScript MIME type if you used that extension.

Open the exact published URL, inspect the Network panel for failed requests, and refresh it directly. Check the host's trailing-slash behavior for a project directory. Relative links can resolve differently if a directory URL is treated as a file URL. Avoid adding a `base` element casually because it changes the resolution of many URLs across the document.

## Keep browser configuration public

A plain browser script does not automatically have access to your terminal's environment variables. Build tools may substitute configured values into output, but anything shipped to the browser is visible to visitors. A variable named `SECRET` does not stay secret after substitution.

This application needs no API keys. If a later feature requires a private credential, it needs a trusted server-side boundary or a different design. Do not solve the problem by embedding the key in JavaScript or localStorage.

The deployed site also has a different origin from your local server. Your development list will not automatically appear online. Explain that behavior rather than treating it as data loss. Preview deployments with different hostnames likewise have separate storage. Path prefixes on the same origin, however, share localStorage, which is why the namespaced key matters.

## Verify people can use the release

Use the published page to add a title, toggle it, and refresh to check the saved state. Submit an invalid title and a title that looks like markup; the latter should display literally. Repeat the interaction with only a keyboard, watching for visible focus, understandable control names, and a sensible focus position after each update.

Check a narrow screen and browser zoom. Look for clipped controls, horizontal scrolling, unreadable contrast, and status messages that rely only on color. An automated accessibility scan can find some problems but cannot establish that the interaction makes sense. Read the page with assistive technology when possible and document what you actually checked.

## Plan rollback before you need it

Keep a deployment or commit whose behavior you have verified, and learn how the host restores it before a release breaks loading. After restoring it, check the public URL again. Inspect the assets the browser requests: caches can delay delivery of the restored version, and a single reload may not show what visitors receive.

Rolling back code does not roll back localStorage. A future data-format migration may make older code unable to read newer data. Keep migrations separate, test compatibility, and provide recovery or export before changing saved formats. This course's versioned key makes that decision visible; it does not solve migration automatically.

## Exercise: write a release record

Record the deployed URL, source commit, checks performed, known limitations, and rollback target. Include one statement about where reading-list data lives.

<details><summary>Check your release record</summary>

Separate checks you performed from checks you still plan to run. State that the list stays in the visitor's browser for that origin, and list browsers or accessibility checks you did not test. Identify the prior deployment or commit to restore, including the limit of that action: restoring code cannot recover erased browser data. This gives the next release decision a record of what was checked and what remains unknown.

</details>
