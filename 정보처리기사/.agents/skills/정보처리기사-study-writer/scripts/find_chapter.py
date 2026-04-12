#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PdfReader


PDF_PATH = Path(
    "/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf"
)


def normalize(text: str) -> str:
    return " ".join(text.replace("\u200b", " ").split()).strip().lower()


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: find_chapter.py <keyword>")
        return 2

    keyword = normalize(" ".join(sys.argv[1:]))
    if not PDF_PATH.exists():
        print(f"missing pdf: {PDF_PATH}")
        return 1

    reader = PdfReader(str(PDF_PATH))
    found = 0
    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        matched = [line for line in lines if keyword in normalize(line)]
        if not matched:
            continue
        found += 1
        print(f"=== PAGE {idx} ===")
        for line in matched[:10]:
            print(line)
        print()

    if found == 0:
        print("no matches")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
