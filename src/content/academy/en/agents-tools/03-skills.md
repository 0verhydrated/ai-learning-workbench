---
title: "Skills: package a repeatable procedure"
description: "Build a weekly-report skill with valid metadata, focused references, and evidence-based verification."
order: 3
course: agents-tools
lang: en
duration: "20 min"
---

## Instructions are not capabilities

An **Agent Skill** is a directory containing `SKILL.md`: YAML metadata followed by Markdown instructions. It packages procedural knowledge—how to carry out a recurring task—and can include reference documents, templates, or scripts. It does not train the model or automatically grant new execution permissions. [1][2]

A **tool** executes an operation through a defined interface. A **skill** explains a procedure that may use tools. A **plugin** is a host-specific extension package that may register executable functionality, interfaces, or bundled skills. **MCP** is a protocol through which external programs expose capabilities. A reporting skill might use an MCP search tool supplied by an integration, but installing the instructions does not install that server or authorize access to its data.

## Progressive disclosure

Loading every procedure into every conversation wastes context. Agent Skills uses three stages: discover a skill through its name and description, load its full instructions when relevant, then read supporting files only when needed. Hermes implements this on-demand pattern too. Host discovery locations and additional metadata can differ, so distinguish the portable format from product extensions. [1][3]

The specification requires `name` and `description`. The name must match its directory, use lowercase alphanumeric characters and hyphens, and avoid leading, trailing, or consecutive hyphens. Optional `metadata` maps string keys to string values. Keep the main instructions focused; link directly to references rather than building a maze of nested documents. [2]

## Worked example: a weekly-report skill

This example needs no scripts or network. Its input is a user-supplied table, and its output is a draft, never a sent message. The package layout is:

```text
weekly-report/
  SKILL.md
  references/status-rules.md
```

Put this content in `SKILL.md` in a host-supported skill directory. This is skill-file content, not a command to run:

```markdown
---
name: weekly-report
description: "Use for weekly reports. Draft from cited task records."
metadata:
  owner: "delivery-team"
  version: "1.0"
---

## Inputs
Require the reporting interval and task records with IDs,
status, owner, and evidence. Ask for missing inputs.

## Procedure
1. Read [status rules](references/status-rules.md).
2. Filter records to the requested interval; preserve IDs.
3. Deduplicate identical IDs. Flag conflicting duplicates.
4. Group completed work, blockers, and next actions.
5. Attach a record ID to each factual bullet.
6. Return a draft. Do not send or publish it.

## Verification
Reconcile unique input IDs with grouped IDs. Report exclusions.
Do not count blocked or unverified work as completed.
Mark missing owners and dates as unknown; never invent them.
```

The supporting `references/status-rules.md` contains the actual decision rule:

```markdown
## Status rules
- Done requires status=done and nonempty evidence.
- Blocked requires status=blocked; retain the stated blocker.
- Everything else is a next action, not a completion.
- Conflicting duplicate IDs require clarification before totals.
```

Now apply it to these authored example records, all inside the requested interval:

| ID | Status | Owner | Evidence or blocker |
|---|---|---|---|
| T-11 | done | Mina | Review accepted: review-11 |
| T-12 | blocked | Jun | Waiting for test account |
| T-13 | done | unknown | No evidence provided |

The resulting draft should say:

```text
Completed: T-11 — review accepted (review-11); owner Mina.
Blocked: T-12 — waiting for test account; owner Jun.
Next: T-13 — obtain completion evidence; owner unknown.
Coverage: T-11, T-12, T-13. Excluded: none.
```

T-13 moves to next actions because its `done` label lacks the required evidence. The coverage line lets a reviewer check that every input ID appears once; the unknown owner remains unknown. This is a manually worked example, not a claim that an agent ran the skill.

## Limits and safe reuse

Even a carefully written skill can reference unavailable tools, outdated commands, or unsafe scripts. Review bundled code and its dependencies before execution; use restricted credentials, a sandbox, and approval controls where appropriate. A Markdown instruction saying “do not send” expresses intent; the host should separately withhold sending capability when drafting only.

The specification's `allowed-tools` field is experimental and support varies. Do not treat it as a portable security boundary. Likewise, a downloaded skill claiming to override all previous instructions has no authority to do so. [2]

## Exercise: conflicting duplicates

Add another T-12 row marked `done`, but keep the blocked row. Should the skill count it twice, prefer the last row, or stop the totals? Where should a long organization-specific status policy live?

<details>
<summary>Solution</summary>

Flag the conflicting ID and request clarification before totals. Silently taking the last row would invent a conflict-resolution policy. Keep the short conflict rule in `SKILL.md`; place the detailed status policy in a directly linked reference. Add the duplicate case to future checks and verify that totals stay on hold until the conflict is resolved.

</details>

## Sources

1. [Agent Skills — Overview](https://agentskills.io/home): directory format and progressive disclosure.
2. [Agent Skills — Specification](https://agentskills.io/specification): metadata, naming, references, and experimental tool declarations.
3. [Hermes — Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills): host-specific skill loading and management.
