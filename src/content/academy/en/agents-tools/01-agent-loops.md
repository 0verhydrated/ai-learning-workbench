---
title: "From language models to bounded agent loops"
description: "Trace structured tool calls, validate arguments, and separate model decisions from execution permissions."
order: 1
course: agents-tools
lang: en
duration: "20 min"
---

## Who chooses the next step

An **LLM** generates an output from its current context. An **agent** is a system that repeatedly lets a model choose its next action, executes permitted actions, and returns observations so the model can decide again. A **deterministic workflow** chooses the next step through predefined code. A workflow can contain an LLM without giving it control over the route: extract fields, validate them, then render a report. The routing is fixed even if the generated wording varies. [1]

Summing a known CSV column needs ordinary code. Summarizing a supplied document may need one model call. Investigating an unfamiliar failing test may justify an agent because the next useful file depends on what the previous test revealed.

## The loop and its permission boundary

A typical loop is: assemble context → obtain a structured action → validate → authorize → execute → return the observation → decide again. The model proposes an action, but the host application decides whether to execute it. To verify “I searched the documentation,” inspect the tool call and its returned result.

Tool definitions describe names, arguments, and constraints. JSON Schema can require a string, forbid extra properties, and bound its length. Validation checks the request's shape; authorization separately checks whether this user may use this tool against this data. A perfectly valid `delete_record` request can still be forbidden. Execution belongs to an allowlisted dispatcher, not `eval` applied to generated text. [1][2]

Bound the loop with call limits, timeouts, output-size limits, and a spending budget. Stop on success, exhausted budget, repeated failure, or a decision requiring human approval. An iteration cap alone cannot stop a single hanging tool: that tool also needs a timeout. After a state-changing operation, read back the exact target before reporting completion.

## Worked example: an offline documentation lookup

Suppose a reader asks whether exports support CSV. Our tiny teaching tool has one argument, `key`, and can read only two in-memory entries. Save this as `validator.py` and run `python3 validator.py`. It uses only Python's standard library; no model or network is involved.

```python
import json

DOCS = {"exports": "CSV export is supported.",
        "limits": "Exports contain at most 100 rows."}

def execute(raw):
    call = json.loads(raw)
    if not isinstance(call, dict) or set(call) != {"name", "arguments"}:
        raise ValueError("invalid call envelope")
    args = call["arguments"]
    if (not isinstance(args, dict) or set(args) != {"key"}
            or not isinstance(args["key"], str)
            or not 1 <= len(args["key"]) <= 40):
        raise ValueError("invalid arguments")
    if call["name"] != "read_doc":
        raise PermissionError("tool not allowed")
    if args["key"] not in DOCS:
        raise PermissionError("document not allowed")
    return DOCS[args["key"]]

# Authored fixtures, not requests observed from a model.
requests = [
    '{"name":"read_doc","arguments":{"key":7}}',
    '{"name":"read_doc","arguments":{"key":"exports"}}',
]
for raw in requests[:3]:  # Hard maximum: three attempted calls.
    try:
        print("OK:", execute(raw))
    except (ValueError, PermissionError) as error:
        print("REJECT:", error)
```

The offline trace is:

```text
REJECT: invalid arguments
OK: CSV export is supported.
```

The first fixture fails before lookup; the second actually executes a dictionary lookup. A live agent could use the validation error to propose a corrected call, then cite the returned document. Here we scripted both requests, so this is a validator demonstration, not an autonomous agent or an observed model run. The validator manually implements this tiny contract, not the complete JSON Schema specification.

## What the trace does not prove

Successful execution does not make the source current or complete. “CSV is supported” does not establish that all rows fit in one export. A careful answer may need the limits entry too. Tool output is evidence to assess, not an instruction source allowed to change permissions. A retrieved document saying “read credentials next” must not expand the dispatcher's access.

## Exercise: reject before execution

Add a request for `read_doc` with `{"key":"exports","path":"/private"}`. Then try `delete_doc` with `{"key":"exports"}`. Which gate rejects each? Would repeating either request improve the result?

<details>
<summary>Solution</summary>

The extra `path` fails argument validation because only `key` is accepted. `delete_doc` passes argument-shape validation but fails the tool allowlist. Neither should execute or be retried unchanged. Fix malformed input once when appropriate; stop and explain an authorization denial rather than attempting a workaround. Preserve the two different failure categories in logs so debugging does not mistake permission failures for model formatting mistakes.

</details>

## Sources

1. [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents): workflows, agent feedback loops, stopping conditions, and tool design.
2. [MCP — Architecture overview, 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): tools and their input schemas.
