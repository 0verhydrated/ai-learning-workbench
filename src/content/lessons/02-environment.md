---
title: "Set up an environment you can explain"
description: "Prepare an editor, Node, Git, and a local server without making paid tools a prerequisite."
order: 2
part: 'Foundations'
duration: '15 min'
---

## Separate the tools from the project

You need a text editor, a browser with developer tools, Git, and a supported Node.js release. The browser runs the reading list. Node runs development utilities and, later, automated tests. Git records intentional snapshots of your files. Your editor helps you inspect and change text; it does not determine which framework you must use.

A paid coding assistant is optional. You can use a free service, a local model, or no assistant at all. Availability, quotas, and privacy terms vary, so choose based on your situation rather than treating a subscription as part of the application architecture. Never paste a provider's API key into the reading-list JavaScript.

Install software from its official distribution or a package manager you already trust. Follow the installation instructions for your operating system, then reopen your terminal if its PATH changed. A PATH is the list of directories your shell searches for commands.

## Verify before asking an assistant to repair things

Run these commands yourself and read their actual output:

```sh
node --version
npm --version
git --version
```

A version number establishes that the command is available, not that the whole environment is correct. If a command is missing, record the exact error and your operating system. Do not accept a random sequence of administrative commands as a substitute for diagnosis. An assistant should explain why a change is necessary before you grant broader permissions.

Create a dedicated directory so project files do not mix with personal documents:

```sh
mkdir reading-list
cd reading-list
git init
```

Use your editor to create `index.html`, `styles.css`, and `app.js`. Later lessons add small modules and tests. A framework and a build pipeline are unnecessary for this version. Open the directory itself in the editor so file searches and any assistant permissions have a clear boundary.

## Serve files over a local origin

Opening HTML directly as a file can behave differently from serving it over HTTP, particularly for modules and storage. Use a local static server. One option, if Python 3 is installed, is:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Run it inside `reading-list`, visit `http://127.0.0.1:8000`, and stop it with Control-C when finished. Binding to loopback limits ordinary network access to your own machine. Do not serve your home directory: a static server may expose any files under its serving directory.

If Python is unavailable, use a trusted editor server extension or inspect a Node static-server package before installing it. Node itself does not provide a built-in `node serve` command. Commands using `npx` may download and execute packages; read the package name and confirm that you intended that dependency.

The hostname and port matter. `localhost:8000` and `127.0.0.1:8000` are different origins, so they do not share localStorage. Choose one address and use it consistently while learning.

## Keep recoverable snapshots

Before your first commit, inspect what Git will record:

```sh
git status --short
git diff
git add index.html styles.css app.js
git diff --cached
git commit -m "Start reading list"
```

The commit may require your Git author configuration. Follow Git's message and use the identity you intend to publish. Add ignore rules for local secrets and dependency directories if those files become relevant; ignoring a file does not remove it from existing commits.

## Exercise: make an environment note

Record the commands that start your server and check your tools, the URL you use, and how you stop the server. Explain what you would inspect if the browser showed a directory listing instead of your page.

<details><summary>Check your setup</summary>

A directory listing usually means the serving directory lacks the expected index file. Check the terminal's working directory and the filename, including capitalization, before reinstalling anything. Your note should distinguish the server process from the browser tab: closing the tab does not stop the server. Keep real command output in your own notes rather than copying an example version number and calling it verification.

</details>
