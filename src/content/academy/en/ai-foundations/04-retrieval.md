---
title: "Embeddings, retrieval, and grounded answers"
description: "Choose relevant evidence with vector or hybrid search, preserve access boundaries, and test lexical retrieval offline."
order: 4
course: ai-foundations
lang: en
duration: "20 min"
---

## Bring evidence into the working context

The previous lessons separated training from inference and treated context as a limited budget. **Retrieval-augmented generation (RAG)** connects those ideas: retrieve relevant material, place selected passages in context, and ask the model to answer from that evidence. OpenAI documents this search-then-synthesize workflow.[1] Retrieval alone returns evidence; generation is a separate step.

RAG does not update model weights. **Fine-tuning** does: it trains a model further on examples. Use retrieval when answers need changing policies or inspectable source passages; consider fine-tuning for learned task behavior or formatting. They can be combined, but neither guarantees truth. Uploading a document to a searchable store is not itself fine-tuning.

## Embeddings and chunks

An **embedding** represents content as a numerical vector. Semantic retrieval compares query and document representations to find related meanings, including passages with few shared keywords.[1] Similarity is not proof of correctness, freshness, or permission to read.

A **chunk** is a searchable portion of a document. OpenAI vector stores automatically chunk, embed, and index uploaded files.[1] Choose boundaries that preserve useful units: a policy clause with its exception, a heading with its explanation, or a function with its signature. Tiny fragments lose context; huge passages crowd out other evidence. Overlap can preserve boundary context but adds duplication and storage.

Keep a stable chunk ID, source path or URL, section, version, and access metadata alongside each passage. Re-index changed documents and retire obsolete versions. Evaluate chunk choices using questions whose supporting passages you already know, not just examples that happen to look convincing.

## Vector, lexical, or hybrid?

Lexical retrieval matches words and is useful for exact identifiers such as error codes. Vector retrieval can help with paraphrases. **Hybrid retrieval** combines semantic and keyword signals; OpenAI exposes ranking controls for balancing them.[1] Test actual queries, including Korean and English paraphrases, rare product names, and questions with no answer. A high similarity score is not a calibrated probability that an answer is true.

Filter by the authenticated user's permissions **before** exposing passages to a model. OpenAI supports file-attribute filters before semantic search.[1] Your application must derive trusted filters and enforce authorization; a user-supplied tenant ID or an instruction saying “ignore private files” is not access control.

## Worked example: honest offline lexical retrieval

Save this as `retrieve.py` and run `python3 retrieve.py`. These are fictional, already-chunked English fixtures. This standard-library example uses word overlap, **not embeddings, fake vectors, an API, or generated answers**. Its word splitter is not a model tokenizer or a Korean search implementation.

```python
import re

CHUNKS = [
    {"id": "public-1", "scope": "public", "source": "manual.md#reset",
     "text": "Reset your password from account settings."},
    {"id": "staff-1", "scope": "staff", "source": "staff.md#reset",
     "text": "Password reset escalation requires staff approval."},
    {"id": "public-2", "scope": "public", "source": "manual.md#billing",
     "text": "Download invoices from billing settings."},
]

def words(text):
    return set(re.findall(r"[a-z]+", text.lower()))

def retrieve(query, allowed_scopes):
    ranked = []
    for chunk in CHUNKS:
        if chunk["scope"] not in allowed_scopes:
            continue
        score = len(words(query) & words(chunk["text"]))
        if score:
            ranked.append((score, chunk))
    ranked.sort(key=lambda item: (-item[0], item[1]["id"]))
    return [chunk for _, chunk in ranked[:2]]

hits = retrieve("password reset", {"public"})
print([(hit["id"], hit["source"]) for hit in hits])
assert [hit["id"] for hit in hits] == ["public-1"]
assert retrieve("volcano", {"public"}) == []
assert retrieve("password reset", set()) == []
```

The output is `[('public-1', 'manual.md#reset')]`. In production, allowed scopes must come from trusted authorization, not the question. Carry the source and passage into generation, require citations supporting specific claims, and verify those citations against the actual text. Treat retrieved instructions as untrusted data. When evidence is missing or contradictory, report that instead of filling gaps.

## Exercise: expose the limits

Try `retrieve("recover credentials", {"public"})`. Explain the result, propose an improvement, and name two checks that must survive the change.

<details>
<summary>Suggested answer</summary>

It returns an empty list because the words do not overlap. Test a synonym-aware or semantic retriever, possibly hybrid, against a labeled query set. Do not invent vector scores to make this example look semantic. Preserve the staff-access exclusion and source provenance; also test empty permissions, stale evidence, and unsupported questions. Better recall must not silently widen access or turn weak matches into confident answers.

</details>

## Sources

[1] https://developers.openai.com/api/docs/guides/retrieval — OpenAI — Retrieval
