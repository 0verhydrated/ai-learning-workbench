---
title: "Evaluation and observability"
description: "Separate software correctness from model quality, then instrument the workflow without leaking private data."
order: 3
course: automation
lang: en
duration: "24 min"
---

## Two different questions

A **unit test** checks a narrow software contract: does a parser reject a missing date? An **evaluation**, or eval, measures how well model-assisted behavior meets task criteria across examples: does a bilingual summary preserve qualifications and attribute claims? Passing parser tests leaves summary accuracy unchecked; a persuasive summary tells you nothing about whether the retry handler works.

OpenAI's evaluation guide describes defining a task, running test inputs, and analyzing results [1]. Use that methodology independently of any particular hosted product. This lesson uses a local evaluator, not an Evals API integration; check current product availability before choosing hosted tooling.

## Build a dataset before choosing a winner

A **ground-truth dataset** pairs representative inputs with reviewed expected answers or rubrics. For news, preserve a source excerpt, publication date, relevant claims, and acceptable translations. Include ordinary stories, conflicting dates, insufficient evidence, prompt-injection text, and Korean qualifiers such as “예정” rather than only easy English announcements.

Separate a development set from a held-out set that prompt authors do not repeatedly optimize against. Version the dataset, prompt, model identifier, and configuration together. Compare a candidate with the baseline on the same examples; repeat sampled model runs when variability matters. Report category-level failures and uncertainty, not only one average. A small curated set is useful for finding regressions, not proof of general reliability.

## Check the evaluator offline

The following standard-library program uses **fictional, handwritten fixtures**. It makes no network requests and runs no model. Its intentionally weak candidate drops one qualifier and invents another fact, so the evaluator should detect two failures. This is a test of the checking machinery, not measured model performance.

```python
fixtures = [
    {"id": "a", "gold": {"date": "2026-11-01", "status": "planned"},
     "candidate": {"date": "2026-11-01", "status": "launched"}},
    {"id": "b", "gold": {"date": "2026-11-02", "status": "launched"},
     "candidate": {"date": "2026-11-02", "status": "launched"}},
    {"id": "c", "gold": {"date": None, "status": "unknown"},
     "candidate": {"date": "2026-11-03", "status": "unknown"}},
]
results = []
for row in fixtures:
    actual, expected = row["candidate"], row["gold"]
    passed = set(actual) == set(expected) and actual == expected
    results.append((row["id"], passed))
assert results == [("a", False), ("b", True), ("c", False)]
print({"passed": sum(ok for _, ok in results), "total": len(results)})
```

Deterministic checks are suitable for schemas, required fields, allowed identifiers, and exact extracted facts. They cannot establish that an entire narrative is supported. Add claim-to-source review and a rubric for completeness, meaning preservation, and uncertainty. If using a model judge, calibrate it against human labels; judges can favor verbosity, their own style, or answer order. Blind candidate identity, randomize presentation, and inspect disagreements. Never let an untrusted candidate define its own grading instructions.

## Observe the actual run

**Observability** means understanding system behavior through emitted signals. OpenTelemetry distinguishes logs, metrics, and traces; a trace contains spans representing units of work [2]. For the news pipeline, create a root run span and child spans for retrieval, verification, summarization, validation, approval, and publication.

Record run ID, stage, duration, retry count, tool error class, prompt version, and model identifier. Track latency distributions, queue delay, failed validations, and missed deliveries. Record token usage when supplied and label computed cost as an estimate based on a versioned price table. Missing usage is unknown, not zero. A successful tool response is not evidence of a successful user outcome.

Keep telemetry privacy-safe: omit credentials, raw private documents, full prompts, and sensitive query strings by default. Use allowlisted attributes, access control, retention limits, and reviewed redaction. Correlation IDs should connect operational events without becoming a second store of personal content.

## Exercise: a higher average can hide a regression

**Exercise:** Unit tests pass, the average judge score rises, but Korean summaries turn planned releases into completed launches. Should the candidate ship?

<details>
<summary>Answer</summary>

No. Add reviewed qualifier cases and a Korean factuality gate, inspect judge disagreement, and compare on untouched holdout cases. The average hides a critical regression. Trace the affected stage without logging private source text. Passing tests, fluent prose, and healthy latency are separate signals; none substitutes for grounded meaning.

</details>

## Sources

1. [OpenAI: working with evals](https://developers.openai.com/api/docs/guides/evals)
2. [OpenTelemetry: observability primer](https://opentelemetry.io/docs/concepts/observability-primer/)
