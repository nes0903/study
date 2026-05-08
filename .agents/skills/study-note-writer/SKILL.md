---
name: "study-note-writer"
description: "Use when creating or updating concept/reference notes under /Users/nes0903/Documents/study. Applies the study-note conventions: create a topic folder, write a topic-named markdown file instead of README.md, include Mermaid diagrams throughout the note so each major section is scannable at a glance, and include Markdown links to the sources used."
---

# Study Note Writer

Use this skill for requests that ask to research a concept and write a detailed note under `/Users/nes0903/Documents/study`.

## Required Rules

1. Create or use a topic folder under `/Users/nes0903/Documents/study/<topic>/`.
2. Write to a topic-named markdown file such as `webhook.md`, `oauth.md`, `ietf.md`. Do not use `README.md` for these study notes.
3. Include `mermaid` diagrams throughout the note, not just once at the top.
4. Each major section must include at least one `mermaid` diagram so that section's structure, flow, comparison, or decision logic is understandable at a glance.
5. If a section is too small to justify its own diagram, merge it into a neighboring section instead of leaving it diagram-less.
6. Include a `참고 링크` section with Markdown links to the sources actually used.

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

For this default shape, every major numbered section from 1 through 7 should contain at least one Mermaid diagram. The final `참고 링크` section is the only section that does not require a diagram.

## Writing Rules

- Write in Korean unless the user requests another language.
- Keep the note deeply informative, but organized for scanning.
- Put the first Mermaid diagram near the top.
- Do not stop at a single overview diagram. Add a Mermaid diagram to every major section.
- Prefer section-specific diagrams over repeating the same overall diagram. Each diagram should explain the local section it appears in.
- If a section becomes too fine-grained to support a meaningful diagram, restructure the note into fewer, larger sections so the "one diagram per major section" rule still holds.
- Use descriptive section titles.
- Prefer exact file names that match the topic.

## Naming Guidance

- Folder name: short kebab-case or the exact topic string if the user already provided a name.
- File name: topic-revealing and singular when possible.

Examples:

- `/Users/nes0903/Documents/study/webhook/webhook.md`
- `/Users/nes0903/Documents/study/oauth/oauth.md`
- `/Users/nes0903/Documents/study/ietf/ietf.md`
