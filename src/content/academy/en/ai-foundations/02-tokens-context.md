---
title: "Tokens, context, and what the assistant remembers"
description: "Budget a request, distinguish memory from context, and understand compaction and caching."
order: 2
course: ai-foundations
lang: en
duration: '15 min'
---

## Text is not counted in words

A **token** is a unit produced by a tokenizer and represented by a numerical identifier. Depending on the tokenizer, a unit can correspond to a word, part of a word, punctuation, or bytes. A model needs the tokenizer and vocabulary compatible with its training; splitting text on spaces is not an accurate substitute.[4]

This matters for bilingual applications. English and Korean sentences expressing the same idea need not consume the same number of tokens. Korean particles and endings, English compounds, code identifiers, emoji, and mixed-language text can split differently. Neither character count nor an English words-to-tokens shortcut reliably predicts another language's bill. Measure representative inputs using the actual model tokenizer or the provider's token-counting facility. Include message formatting and tool definitions when the API counts them.

For example, compare “Please reset my password” with “비밀번호를 재설정해 주세요.” Do not infer token counts from the visible spaces. Record the tokenizer name, both counts, and whether special message tokens were included. This is a measurement procedure, not a claim that one language always costs more.

## A context window is a working budget

**Context** is the information available to a model for a particular request. Its **context window** limits that working space. The prompt includes more than your latest sentence: instructions, conversation history, tool results, retrieved passages, and multimodal inputs can all consume capacity. Input and output share the window, while maximum output is a separate limit; reasoning models may also need space for internal reasoning.[5]

Consider a fictional model with an 8,000-token window. Reserve 1,500 tokens for generation and 500 for safety margin. Your input allowance is therefore 6,000. Suppose instructions take 700, history 1,800, the question 200, and retrieved passages 2,600. Input totals 5,300, leaving 700 tokens within your planned allowance. A new 900-token passage would exceed that plan by 200, even though the input alone remains below 8,000.

Run this offline with Python 3; the counts are invented teaching data, not tokenizer measurements:

```python
window, generation, margin = 8000, 1500, 500
parts = {"instructions": 700, "history": 1800,
         "question": 200, "retrieval": 2600}
allowance = window - generation - margin
remaining = allowance - sum(parts.values())
print(allowance, remaining, remaining - 900)
assert (allowance, remaining, remaining - 900) == (6000, 700, -200)
```

Generation here is a combined planning reserve, including reasoning where applicable; do not count the same reasoning tokens twice. Actual accounting and output-limit semantics depend on the API. A comfortable budget also does not guarantee that every relevant detail will be used correctly.

## Storage, compaction, and caching solve different problems

An app's **memory** is stored information it can retrieve later: preferences, conversation records, or project notes. Storage is not automatically active context. The app must select and include relevant information, or expose a tool that retrieves it. A conversation identifier is a mechanism for managing state, not evidence that unlimited history fits in one request.

**Compaction** replaces earlier material with a smaller representation. A plain-language summary can lose exceptions, exact identifiers, failed attempts, or the source behind a claim. Some services provide specialized compacted state rather than an ordinary summary. Either way, preserve authoritative artifacts outside the chat and retrieve exact details when needed. A summary saying “tests passed” is not a substitute for the test command, output, and code revision.

**Prompt caching** reuses computation for an eligible unchanged prompt prefix. It is not long-term memory, does not enlarge the context window, and does not mean the previous answer is replayed. Stable instructions before changing task data can help reuse, but eligibility, breakpoints, retention, and pricing depend on the provider and model.[6]

## Exercise: repair an overloaded request

Use the fictional budget above. You need the new 900-token passage because it contains an exception to the policy. Suggest a safe change, then name three facts a compacted project note should retain.

<details>
<summary>Suggested answer</summary>

Remove or shorten at least 200 input tokens to preserve the planned margin, preferably irrelevant history or redundant retrieval rather than the policy exception. Keep the current goal, exact constraints and identifiers, and pointers to authoritative files or test evidence. Also retain unresolved questions when they affect the decision. Recount the revised request; deleting 200 characters does not necessarily delete 200 tokens. Caching alone does not fix an over-budget request.

</details>

## Sources

[4] https://huggingface.co/learn/llm-course/chapter2/4
[5] https://developers.openai.com/api/docs/guides/conversation-state
[6] https://developers.openai.com/api/docs/guides/prompt-caching
