# Study Wiki

- `/Users/nes0903/Documents/study` Markdown vault를 검색하고 Obsidian 링크 섹션을 생성하기 위한 로컬 도구다.
- 웹 UI는 QMD가 준비되어 있으면 QMD 검색을 먼저 쓰고, 실패하면 내장 로컬 키워드 인덱스로 대체한다.
- Obsidian 링크 생성은 기본값이 dry-run이라 문서를 바로 수정하지 않는다.

## Web UI

```bash
cd /Users/nes0903/Documents/study/.study-wiki
npm run dev
```

- 기본 URL: `http://127.0.0.1:4317`
- `Hybrid`: QMD 검색 시도 후 로컬 검색으로 fallback
- `Local`: Node 서버의 로컬 Markdown 인덱스만 사용

## QMD Index

```bash
cd /Users/nes0903/Documents/study/.study-wiki
npm run qmd:setup
```

- 위 명령은 QMD collection과 BM25 인덱스를 준비한다.
- vector semantic search까지 쓰려면 모델 다운로드와 embedding 생성이 필요하다.

```bash
cd /Users/nes0903/Documents/study/.study-wiki
npm run qmd:embed
```

## Obsidian Links

```bash
cd /Users/nes0903/Documents/study/.study-wiki
npm run link:check
```

- dry-run으로 어떤 파일에 어떤 링크가 생길지 출력한다.
- 실제 Markdown 파일을 수정하려면 아래 명령을 쓴다.

```bash
cd /Users/nes0903/Documents/study/.study-wiki
npm run link:write
```

- 각 문서 끝에 다음 관리 블록을 만든다.

```md
<!-- study-links:start -->
## 관련 문서

- `keyword`: [[target/path|Target Title]]
<!-- study-links:end -->
```

- 같은 블록은 다음 실행 때 다시 계산되어 교체된다.
