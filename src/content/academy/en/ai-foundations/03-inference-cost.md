---
title: "Inference speed, sampling, and cost"
description: "Measure responsiveness, avoid sampling myths, and calculate a fictional token bill offline."
order: 3
course: ai-foundations
lang: en
duration: '15 min'
---

## Measure waiting time and completed work

**Inference** is running a trained model on new input. **Latency** is elapsed time for an individual request; **throughput** is completed work per unit of time. Time to first token measures when output starts, while total latency measures when it finishes. Streaming can make an interface feel responsive without reducing total computation. A system can process many requests concurrently yet still make each person wait.

Measure the whole path: queueing, network travel, prompt processing, generation, tool calls, and validation. Output length is often a major contributor to generation latency, so a concise response format can help more than shaving a few words from a short prompt.[7] Report a typical response time and a slow-tail measure, not just the fastest demonstration. Compare equivalent tasks and output lengths; a one-line answer and a lengthy explanation are not the same workload.

## Sampling is not a truth setting

A language model predicts possible next tokens. **Sampling** selects among those possibilities. Temperature, when supported, changes how concentrated that selection distribution is: lower values generally favor likely tokens, while higher values permit more variation. It does not verify facts or look up missing evidence. A model can repeatedly select the same incorrect answer.

**Temperature zero** guarantees neither correctness nor perfect reproducibility. Even a low-variation configuration can produce different results across hosted systems, model revisions, or numerical implementations. Pin supported model versions, record prompts and settings, and test repeated runs. For exact arithmetic, use a calculator rather than asking a model to sound certain. Some models do not expose temperature at all; check the actual API instead of copying settings blindly.

## Worked bill with deliberately fictional prices

Assume a fictional service charges USD 2 per million uncached input tokens, USD 0.50 per million cached input tokens, and USD 8 per million output tokens. These are teaching numbers, not a provider quote. For this simplified service, each input token belongs to exactly one of the two input categories.

A request with 2,000 input tokens, including 1,200 cached tokens, and 500 output tokens costs USD 0.0062. At 1,000 identical requests, it costs USD 6.20. The calculation adds 800 uncached input tokens, 1,200 cached tokens, and 500 output tokens at their respective rates; it does not bill all 2,000 input tokens again at the uncached rate.

Save the following as `cost.py` and run `python3 cost.py`. It uses only Python's standard library. Decimal arithmetic makes the accounting deterministic; it does not make model generation deterministic.

```python
from decimal import Decimal as D

RATES = {"input": D("2"), "cached": D("0.50"), "output": D("8")}

def cost(input_tokens, cached_tokens, output_tokens, requests=1):
    counts = (input_tokens, cached_tokens, output_tokens, requests)
    if any(type(n) is not int or n < 0 for n in counts):
        raise ValueError("Counts must be nonnegative integers")
    if cached_tokens > input_tokens:
        raise ValueError("Cached tokens exceed input tokens")
    total = ((input_tokens - cached_tokens) * RATES["input"]
             + cached_tokens * RATES["cached"]
             + output_tokens * RATES["output"])
    return total * requests / D("1000000")

print(f"One request: ${cost(2000, 1200, 500):.4f}")
print(f"1000 requests: ${cost(2000, 1200, 500, 1000):.2f}")
assert cost(2000, 1200, 500) == D("0.0062")
```

Real invoices may include cache writes, reasoning tokens, images, storage, tools, retries, and other billing categories. Consult current terms and reconcile against actual usage. Use the fictional bill to check the calculation method, then budget from the service’s actual rates and usage categories.

## Improve the workflow before increasing concurrency

Prompt caching can reduce repeated input work when an eligible prefix matches; do not assume every similar prompt hits the cache. Batch processing suits noninteractive work such as nightly classification, trading immediate responses for deferred processing under service-specific terms.[9] Keep request identifiers so results can be matched even when returned out of order.

Rate limits can constrain requests and tokens independently. Adding workers may simply produce more throttling. Bound concurrency, inspect rate-limit headers, and use capped exponential backoff with jitter for retryable failures. Billing or quota problems require intervention rather than endless retries.[8]

## Exercise: change one assumption

Using the fictional rates, calculate 1,000 requests with the same inputs but 250 output tokens each. Then try an invalid cached count of 2,001. Why should a production budget still include headroom?

<details>
<summary>Answer</summary>

`cost(2000, 1200, 250, 1000)` returns USD 4.20. Passing 2,001 cached tokens with 2,000 total input tokens raises `ValueError`. Production needs headroom for output variation, retries, cache misses, and separately billed features. Measure real usage before promising savings; shorter output must still satisfy the task.

</details>

## Sources

[7] https://developers.openai.com/api/docs/guides/latency-optimization
[8] https://developers.openai.com/api/docs/guides/rate-limits
[9] https://developers.openai.com/api/docs/guides/batch
