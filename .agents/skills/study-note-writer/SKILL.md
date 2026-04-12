---
name: study-note-writer
description: Use when creating or updating concept/reference notes under /Users/nes0903/Documents/study. Applies the study-note conventions: create a topic folder, write a topic-named markdown file instead of README.md, include at least one Mermaid flow that makes the concept scannable at a glance, and include Markdown links to the sources used.
---

# Study Note Writer

Use this skill for requests that ask to research a concept and write a detailed note under `/Users/nes0903/Documents/study`.

## Required Rules

1. Create or use a topic folder under `/Users/nes0903/Documents/study/<topic>/`.
2. Write to a topic-named markdown file such as `webhook.md`, `oauth.md`, `ietf.md`. Do not use `README.md` for these study notes.
3. Include at least one `mermaid` diagram so the overall structure or flow is understandable at a glance.
4. Include a `참고 링크` section with Markdown links to the sources actually used.

## Source Rules

- Prefer primary or official sources first.
- If the topic is time-sensitive, browse before writing.
- When multiple sources are used, synthesize them into one coherent note instead of source-by-source dumping.

## Default Note Shape

Use this structure unless the user asks for something else:

1. One-line summary
2. Why it matters
3. Core concepts
4. Architecture or flow
5. Important details, edge cases, or tradeoffs
6. Practical examples
7. Glossary or quick recap
8. `참고 링크`

## Writing Rules

- Write in Korean unless the user requests another language.
- Keep the note deeply informative, but organized for scanning.
- Put the first Mermaid diagram near the top.
- Use descriptive section titles.
- Prefer exact file names that match the topic.

## Naming Guidance

- Folder name: short kebab-case or the exact topic string if the user already provided a name.
- File name: topic-revealing and singular when possible.

Examples:

- `/Users/nes0903/Documents/study/webhook/webhook.md`
- `/Users/nes0903/Documents/study/oauth/oauth.md`
- `/Users/nes0903/Documents/study/ietf/ietf.md`

