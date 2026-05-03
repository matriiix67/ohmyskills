---
name: prompt-optimizer
description: Use when the user provides a prompt, system prompt, agent instruction, developer instruction, workflow prompt, or messy prompt draft and asks to optimize, improve, rewrite, upgrade, review, migrate, adapt, execute, run, send, automatically send, or wait for confirmation before sending it after optimization for GPT-5.5.
---

# Prompt Optimizer

Optimize the user's prompt according to OpenAI GPT-5.5 prompt guidance. The default action is to rewrite the prompt into a better production-ready prompt, show it to the user, and wait for explicit confirmation before executing it. Only skip confirmation when the user explicitly asks for optimize-only output.

Source: https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5

## Mode Selection

Use optimize-only mode only when the user says `只给优化后提示词`, `只优化`, `仅优化`, `不执行`, `优化这个提示词但不要执行`, `rewrite only`, `review only`, or equivalent.

Use confirm-before-execute mode by default when the user provides a task prompt. Also use it when the user says `优化并执行`, `优化后执行`, `优化后发送`, `自动发送`, `确认后发送`, `执行优化后的提示词`, `run after optimizing`, or equivalent.

In confirm-before-execute mode:

- First rewrite the prompt using this skill.
- Show the optimized prompt and a confirmation section.
- If the client UI supports confirmation buttons, present a confirm action labeled `确认执行`.
- If no confirmation button is available, ask the user to reply `确认执行` or `发送`.
- Do not execute the optimized prompt until the user explicitly confirms.
- After confirmation, perform the optimized prompt as the current task.
- If the task changes files, publishes content, sends messages, spends money, deletes data, or causes irreversible external side effects, require clear confirmation for that side effect.
- In the final answer after execution, report the task outcome and validation result.

## Default Output

Return exactly these sections unless the user asks for another format:

```markdown
## 优化后提示词
[完整可复制的优化版提示词]

## 主要调整
- [最多 5 条，说明关键变化]

## 仍需确认
- [只列会实质影响结果的问题；没有就写“无”]
```

If the user asks for "只给优化后提示词" or similar, output only the rewritten prompt.

For confirm-before-execute mode, always append this section:

```markdown
## 确认
点击 `确认执行`，或回复 `确认执行` / `发送` 后，我会按上面的优化版提示词继续执行。
```

When the user later confirms, use the most recent optimized prompt from this conversation. Do not optimize it again unless the user asks.

## Rewrite Rules

- Preserve the user's original intent, domain, audience, tone, constraints, and required output.
- Convert process-heavy wording into outcome-first instructions: goal, success criteria, constraints, output, and stop rules.
- Remove redundant step-by-step chains unless a sequence is required for correctness, safety, permissions, or external side effects.
- Keep strict terms such as `always`, `never`, `must`, and `only` only for true invariants.
- Add missing success criteria when the goal implies a clear completion condition.
- Add stop rules for retry, fallback, asking clarification, abstaining, or finalizing when useful.
- Keep personality and collaboration style short. Separate "how it sounds" from "how it works" when both matter.
- Use `text.verbosity` or explicit length/format guidance when output size matters.
- For API or agent prompts, include validation rules when the model can check its work.
- Do not invent business facts, tools, policies, metrics, URLs, credentials, private data, or capabilities that the original prompt does not imply.

## Add Controls By Task Type

For coding or agentic prompts:
- Add concrete validation checks: targeted tests, type/lint checks, affected build, or smoke test.
- Add dependency checks before downstream actions.
- Add tool persistence when correctness depends on tool results.
- Add batch coverage rules for lists, pages, files, or multi-item workflows.

For retrieval or research prompts:
- Add a retrieval budget: start broad, search again only when key evidence is missing.
- Define citation expectations and missing-evidence behavior.
- Avoid treating lack of evidence as proof of absence.

For creative drafting:
- Separate sourced facts from creative wording.
- Use placeholders or labeled assumptions for unsupported specifics.
- Preserve requested length, structure, genre, and claims before polishing.

For long-running Responses API workflows:
- Add a short preamble rule for tool-heavy tasks.
- Preserve assistant-item `phase` values when manually replaying assistant output.
- Use `phase: "commentary"` for intermediate updates and `phase: "final_answer"` for the final answer.

## Clarification Policy

Proceed without asking when a reasonable optimized version can be produced. Ask only when:

- no prompt text was provided;
- the target model or surface materially changes the rewrite;
- the prompt could cause irreversible or external side effects and permission rules are missing;
- missing context would cause the optimized prompt to encode the wrong task.

When asking, ask the smallest necessary question. Otherwise make assumptions explicit in `仍需确认`.

## Quality Checklist

Before finalizing, check that the optimized prompt:

- is shorter or clearer than the original unless required detail was missing;
- has a clear goal and completion criteria;
- preserves important constraints from the original;
- has output instructions that match the user's likely usage;
- avoids unnecessary procedural micromanagement;
- includes validation, citation, retrieval, or phase rules only when relevant.
