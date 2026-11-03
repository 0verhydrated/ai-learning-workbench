---
title: "Delegate to agents without giving away control"
description: "Scope autonomous work, isolate branches with worktrees, and review evidence before integration."
order: 11
part: 'Advanced practice'
duration: '18 min'
---

## Delegate a task, not ownership

A coding agent can inspect files, edit code, run commands, and repeat those steps with less supervision than a chat assistant. That autonomy makes a clear task boundary more important. The agent should know which files it may change, what counts as success, and which actions require your approval.

For the reading list, adding tests for corrupt storage is a reasonable delegated task. "Improve the app however you like" is not. The first has a defined interface and observable results; the second invites product decisions, dependency changes, and broad rewrites.

Choose permissions based on the task. A test-writing agent does not need deployment access, personal documents, browser sessions, or production credentials. Tool permission controls are stronger than a sentence asking the agent to behave carefully, although both can be useful.

## Use worktrees for concurrent edits

Git worktrees let one repository have separate working directories checked out on different branches. They reduce accidental collisions when you and an agent work at the same time. From the reading-list repository, after checking your current state, you could run:

```sh
git status --short
git worktree add ../reading-list-storage-tests -b agent/storage-tests
```

The new directory starts from the current committed revision. Uncommitted changes in your original directory are not automatically included, so commit the intended baseline first or explain that those changes are excluded. Give the agent the exact worktree path instead of letting it discover a similarly named directory.

A worktree is not a sandbox. It shares repository metadata and does not prevent a process from reading other accessible files or using the network. Use operating-system or tool-level isolation when you need a stronger boundary. Separate directories also do not prevent logical conflicts between two changes to the same interface.

## Write an actionable delegation brief

```text
Task: add deterministic tests for parseBooks and loadBooks.
Worktree: ../reading-list-storage-tests
Allowed changes: storage.test.mjs only.
Cases: valid empty list, malformed JSON, duplicate IDs, wrong field
types, and a storage object whose getItem throws.
Do not change application code, install packages, access secrets,
or publish anything. If the current API blocks a test, report it.
Run node --test storage.test.mjs and report actual output and limits.
Finish with the changed files, assumptions, and unverified behavior.
```

The brief gives the agent a stopping rule when the task does not fit its allowed scope. Otherwise it might "helpfully" alter the parser to make a convenient test pass. Review any request to expand scope against the original goal.

Parallelize independent work. One agent can inspect accessibility while another writes parser tests, provided their outputs do not modify the same files. Do not ask several agents to redesign the shared data format independently and expect automatic integration to resolve the disagreement.

## Review the work, then integrate it

Read the diff yourself. Check whether assertions describe intended behavior, whether tests really ran, and whether failures were hidden by skipped cases or weakened expectations. A second agent can review the patch, but agreement between agents is not independent proof of correctness.

After approving the branch, merge it into your intended integration branch and rerun relevant checks there. A test that passed in an isolated worktree may fail alongside changes made elsewhere. Keep publication separate from merging; passing tests does not authorize an agent to deploy.

Inspect the worktree for uncommitted changes before removing it with `git worktree remove`. Avoid force-removal as routine cleanup because it can discard unfinished work. Keep useful findings in the project documentation rather than relying on an agent's temporary session memory.

## Exercise: choose the approval boundary

An agent writing storage tests asks to install a browser automation package and read your deployment token. Decide whether either request fits the task, and specify what evidence you want instead.

<details><summary>Check the boundary</summary>

Neither request is necessary for pure parser and storage-adapter tests. Ask it to use Node's built-in runner and injected fake storage. If it discovers a browser-only behavior that deserves automation, record that as a separate proposal with its dependency and permission costs. A deployment token has no role in this test task and should remain inaccessible.

</details>
