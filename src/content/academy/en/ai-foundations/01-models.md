---
title: "Models, apps, and choosing the right tool"
description: "Separate model capabilities from product features and choose using realistic tasks."
order: 1
course: ai-foundations
lang: en
duration: '15 min'
---

## What is actually answering you?

A **model** is a computational system with learned numerical parameters, often called weights. It transforms an input into predictions or generated output. An **app** is the product around it: the chat interface, document uploads, search, saved conversations, permissions, and tools. A **provider** operates or distributes access to models. One provider can offer multiple models; one app can route different requests to different providers.

This distinction explains why two products using the same named model can behave differently. One may retrieve an updated manual, while the other only receives your question. One may execute code in a sandbox; the other merely writes code-shaped text. Ask which model ran, which evidence it received, and which tools actually executed. A fluent answer alone cannot establish any of these facts.

**Training** updates parameters using data and a learning objective. Pretraining establishes broad capabilities; fine-tuning performs additional training on a more specific dataset. **Inference** uses an already-trained model to process new input. Hugging Face distinguishes model architecture from a checkpoint, the particular learned weights loaded into it.[1] Giving an assistant your style guide during a conversation is normally inference with additional context, not a training job. Whether a service later uses submitted data for training is a separate policy question.

## Capabilities are trade-offs, not a ladder

A reasoning model can spend additional computation working through difficult tasks before answering. That may help with debugging a multi-step failure, but adds cost or waiting time; supported controls differ between models.[2] More reasoning is not a guarantee of correctness. Test the final patch or verify the calculation instead of treating a long explanation as proof.

A multimodal model handles more than one modality, such as text and images. Input and output capabilities are separate: accepting a screenshot does not imply generating images or transcribing audio. For an interface bug, a screenshot can reveal overlapping buttons; accessible text and source code can supply exact labels and logic that pixels alone obscure.

Local deployment runs inference on hardware you control. It can support offline work and tighter control over where prompts travel, but you must manage memory, installation, updates, security, and performance. Cloud deployment delegates much of that operation and may provide capabilities your laptop cannot run comfortably, but introduces network dependence and provider data-handling requirements. “Local” does not automatically mean private: plugins, telemetry, and external tools still need review. Open weights also do not imply unrestricted licensing.

## Worked choice: a fictional support assistant

Suppose your team needs to label incoming tickets, explain screenshot errors, and propose fixes to complicated account workflows. Do not select one expensive setting for everything.

| Task | First candidate | Acceptance check |
| --- | --- | --- |
| Label a short ticket | Lower-cost text model | Correct label and valid schema |
| Interpret a screenshot | Image-capable model | Correct visible error; no invented text |
| Diagnose workflow failure | Reasoning-capable model | Explanation agrees with logs and a reproducible test |

Create a small evaluation set from sanitized examples: straightforward cases, ambiguous wording, Korean messages, missing information, and deliberately misleading screenshots. Keep expected answers separate from prompts. Compare candidates using identical inputs and available tools. Record correctness, unsupported claims, response time, and cost, then repeat runs rather than trusting one lucky response. Official optimization guidance similarly starts with representative evaluations and a baseline before tuning prompts or models.[3]

The misconception is **“the strongest model is always the best product choice.”** A candidate that produces elegant explanations but misses a required field can be worse for ticket routing than a simpler model with reliable validation. Sometimes a lookup table is better than either.

## Exercise: make a decision record

Choose an assistant for an offline workshop that classifies fictional tickets. Write four lines: deployment choice, necessary modality, one acceptance test, and fallback behavior. Then explain what changes if the workshop adds screenshot troubleshooting and permits an approved cloud service.

<details>
<summary>Suggested answer</summary>

Start with a locally runnable text model, check its license and hardware requirements, and test known ticket labels plus malformed inputs. Reject invalid labels and send uncertain tickets to a human rather than silently guessing. For screenshots, evaluate an image-capable local model or approved cloud alternative; do not assume the original text model can see images. Recheck privacy rules and compare actual task results before switching. No specific model is justified without those measurements.

</details>

## Sources

[1] https://huggingface.co/learn/llm-course/chapter1/4
[2] https://developers.openai.com/api/docs/guides/reasoning
[3] https://developers.openai.com/api/docs/guides/model-optimization
