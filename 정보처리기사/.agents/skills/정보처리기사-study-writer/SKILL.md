---
name: 정보처리기사-study-writer
description: Use when creating chapter-based study material under /Users/nes0903/Documents/study/정보처리기사 from the authoritative PDF 핵심요약집_2026_정보처리기사필기핵심요약.pdf. Trigger this when the user says things like "OOO 챕터 공부자료 만들어". It must find the chapter in the PDF, create one folder per chapter, write a chapter-named markdown file, expand the topic with web research focused on what is needed for the 정보처리기사 exam, include Mermaid or HTML visualization near the top, and include Markdown source links.
---

# 정보처리기사 Study Writer

Use this skill when the user wants study material for a specific 정보처리기사 chapter inside `/Users/nes0903/Documents/study/정보처리기사`.

## Authority and Scope

- The primary authority for chapter boundaries and naming is the PDF:
  `/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf`
- Treat the PDF as the source of truth for:
  - chapter title
  - chapter scope
  - nearby related subtopics
- Use web research only to expand and clarify the chapter for study purposes.

## Output Rules

1. Create one folder per requested chapter under:
   `/Users/nes0903/Documents/study/정보처리기사/<챕터명>/`
2. Inside that folder, write a topic-named markdown file:
   `/Users/nes0903/Documents/study/정보처리기사/<챕터명>/<챕터명>.md`
3. Do not use `README.md`.
4. Include at least one `mermaid` diagram near the top.
   - Use `flowchart` by default for maximum compatibility.
   - If the concept is a process, prefer a process flow.
   - If the concept is a classification, prefer a tree or layered flow.
5. Include a `참고 링크` section with Markdown links to the sources actually used.

## Content Rules

- The note must be exam-oriented, not just a generic CS article.
- Expand the PDF summary into a detailed study note that helps with:
  - 개념 이해
  - 용어 구분
  - 시험 포인트
  - 헷갈리기 쉬운 비교
  - 자주 나오는 함정
  - 필요 시 암기 포인트
- Keep the language in Korean unless the user asks otherwise.

## Required Workflow

1. Find the requested chapter in the PDF first.
2. Read enough surrounding PDF text to understand adjacent concepts.
3. Create the chapter folder if missing.
4. Write the chapter note with:
   - 한 줄 요약
   - 상단 Mermaid 시각화
   - 개념 설명
   - 시험 포인트
   - 비교표 or 구분 포인트
   - 필요한 예시
   - 참고 링크
5. Use web search to enrich the note with exam-relevant detail.
6. Prefer official or primary sources first, then high-quality educational sources.

## Strong Defaults for Note Shape

Use this structure unless the user asks for something else:

1. `한 줄 요약`
2. `한눈에 보는 흐름` or `한눈에 보는 구조`
3. `개념 설명`
4. `핵심 포인트`
5. `시험에서 헷갈리는 비교`
6. `예시 또는 암기 포인트`
7. `빠른 복습`
8. `참고 링크`

## PDF Handling

- Prefer using the helper script in `scripts/find_chapter.py` to locate chapter text in the PDF.
- If the exact chapter title is slightly different from the user's wording, map it to the nearest PDF heading before writing.
- If multiple nearby headings match, use the PDF context to choose the most likely target and state that choice briefly in the note if needed.

## File Naming

- Folder name: use the exact chapter title when practical.
- File name: use the same visible chapter title with `.md`.

Examples:

- `/Users/nes0903/Documents/study/정보처리기사/폭포수 모형/폭포수 모형.md`
- `/Users/nes0903/Documents/study/정보처리기사/나선형 모형/나선형 모형.md`
- `/Users/nes0903/Documents/study/정보처리기사/소프트웨어 공학의 기본 원칙/소프트웨어 공학의 기본 원칙.md`

## References Quality Bar

- Prefer official sources for standards, frameworks, and definitions.
- For 정보처리기사-specific framing, prefer sources that explain concepts in a way aligned with Korean exam terminology.
- Do not cite low-signal aggregation pages when a primary source exists.

## Helper Files

- `scripts/find_chapter.py`: locate candidate pages and matching lines for a chapter keyword inside the PDF.

