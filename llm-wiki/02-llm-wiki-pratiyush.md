# llm-wiki (Pratiyush) — 멀티 에이전트 + 정적 사이트 생성기

> GitHub: https://github.com/Pratiyush/llm-wiki
> 라이선스: (GitHub 참조)

---

## 1. 프로젝트 개요

AI 코딩 에이전트(Claude Code, Codex CLI, Cursor, Gemini CLI, Copilot 등)의 **세션 기록을 수집**하여, 이를 구조화된 위키 + 정적 웹사이트 + AI 소비용 포맷으로 컴파일하는 시스템. Karpathy의 3레이어를 **3+8 레이어**로 대폭 확장했다.

**핵심 컨셉**: "AI 세션 대화는 휘발되지만, 그 안의 지식은 보존되어야 한다."

## 2. 구현 방향성

| 구분 | Karpathy 원본 | llm-wiki (Pratiyush) |
|------|--------------|---------------------|
| 소스 | 수동 수집 (아티클, 논문) | **AI 세션 로그 자동 수집** |
| 에이전트 | 단일 LLM | **멀티 에이전트 어댑터** (6종+) |
| 출력 | 마크다운 위키 | 마크다운 + **정적 HTML 사이트** + AI 포맷 |
| 검색 | index.md | **클라이언트 사이드 글로벌 검색** |
| 품질 관리 | 수동 lint | **자동 품질 점수 (0-100)** |

## 3. 3+8 레이어 아키텍처

### Karpathy 레이어 (Layer 1-3)

```
Layer 1: Raw Sources
  └── .jsonl 세션 로그 → 불변 마크다운 (raw/sessions/)

Layer 2: Wiki
  └── LLM이 생성한 구조화된 위키
      ├── sources/      # 세션 요약
      ├── entities/     # 인물, 도구, 라이브러리
      ├── concepts/     # 핵심 개념
      ├── syntheses/    # 종합 분석
      ├── comparisons/  # 비교 페이지
      └── questions/    # 미해결 질문

Layer 3: Schema
  └── CLAUDE.md / AGENTS.md (위키 규칙 정의)
```

### 확장 레이어 (Layer 4-8)

```
Layer 4: Static HTML Compilation
  └── 마크다운 → 정적 HTML 사이트 변환

Layer 5: Search Indexing
  └── 클라이언트 사이드 검색 인덱스 생성

Layer 6: Manifest Building
  └── 사이트맵, RSS, JSON-LD 등 메타데이터

Layer 7: Link Validation
  └── 내부 링크 검증 + 깨진 참조 탐지

Layer 8: AI Export Generation
  └── llms.txt, llms-full.txt, JSON-LD 그래프
```

## 4. 멀티 에이전트 어댑터 시스템

각 AI 에이전트의 세션 로그 포맷이 다르므로, 어댑터 패턴으로 통일:

| 에이전트 | 로그 포맷 | 어댑터 |
|----------|----------|--------|
| **Claude Code** | JSONL | claude_adapter.py |
| **Codex CLI** | JSONL | codex_adapter.py |
| **Cursor** | 자체 포맷 | cursor_adapter.py |
| **Gemini CLI** | JSONL | gemini_adapter.py |
| **Copilot Chat/CLI** | 자체 포맷 | copilot_adapter.py |
| **Obsidian Vault** | 마크다운 | obsidian_adapter.py |
| **PDF** | PDF | pdf_adapter.py |

**새 에이전트 추가**: 베이스 어댑터를 상속하는 작은 파일 하나만 작성하면 됨

## 5. CLI 명령어

```bash
# 핵심 워크플로우
llmwiki sync          # 세션 로그 → 마크다운 변환
llmwiki build         # 정적 HTML + AI 포맷 컴파일
llmwiki serve         # 로컬 서버 (127.0.0.1:8765)

# 내보내기 & 품질
llmwiki export <fmt>  # AI 소비용 포맷 내보내기
llmwiki eval          # 위키 품질 점수 (0-100)
llmwiki check-links   # 내부 참조 검증

# 유틸리티
llmwiki graph         # 지식 그래프 시각화
llmwiki watch         # 파일 변경 감시 + 자동 빌드
llmwiki synthesize    # 크로스 세션 종합 분석
llmwiki manifest      # 메타데이터 매니페스트 생성
```

## 6. 이중 출력: 사람용 + AI용

### 사람용 (Human-Readable)

정적 사이트로 생성되며 포함 기능:
- 글로벌 검색
- 구문 하이라이팅 (코드 블록)
- 다크 모드
- 키보드 단축키
- 접을 수 있는 도구 결과
- 활동 히트맵
- 읽기 시간 추정
- 관련 페이지 패널
- 모델 비교 페이지

### AI용 (AI-Consumable)

모든 위키 페이지의 기계 판독 가능 버전:

| 포맷 | 용도 |
|------|------|
| `.txt` / `.json` | 각 페이지의 기계 판독 버전 |
| `/llms.txt` | [llmstxt.org](https://llmstxt.org) 스펙 준수 |
| `/llms-full.txt` | LLM 컨텍스트에 바로 붙여넣기용 |
| JSON-LD 그래프 | 구조화된 지식 그래프 |
| 사이트맵 | 페이지 구조 |
| RSS 피드 | 업데이트 구독 |
| `robots.txt` | AI 네비게이션 힌트 |

## 7. 품질 평가 시스템 (llmwiki eval)

위키의 건강 상태를 0-100 점수로 측정:

- **커버리지**: 원본 소스 대비 위키 페이지 비율
- **연결성**: 크로스레퍼런스, 백링크 밀도
- **일관성**: 모순되는 주장 탐지
- **완결성**: 누락된 엔티티/개념 페이지
- **신선도**: 마지막 업데이트 이후 경과 시간

## 8. 관련 개념

- **llms.txt 스펙**: LLM이 웹사이트를 이해할 수 있도록 구조화된 텍스트를 제공하는 표준 (llmstxt.org)
- **JSON-LD**: 구조화된 데이터를 JSON으로 표현하는 Linked Data 포맷. 지식 그래프 표현에 사용
- **어댑터 패턴**: 서로 다른 인터페이스를 통일된 인터페이스로 변환하는 디자인 패턴
- **정적 사이트 생성 (SSG)**: 빌드 타임에 HTML을 생성하여 서버 없이 배포 가능
- **지식 컴파일**: 원본 데이터를 처리하여 최적화된 형태로 변환하는 과정 (RAG의 런타임 검색과 대비)

## 9. 이용 페르소나

### 페르소나 A: 멀티 에이전트 파워 유저
- **프로필**: Claude Code, Cursor, Copilot을 프로젝트마다 혼용하는 시니어 개발자
- **고민**: 에이전트마다 세션이 분산되어 이전 대화의 인사이트가 휘발됨
- **사용 흐름**: 각 에이전트 세션 → `llmwiki sync` → 통합 위키 자동 생성
- **가치**: 여러 AI 에이전트의 지식을 하나의 위키로 통합

### 페르소나 B: 기술 블로거 / 교육자
- **프로필**: AI 도구 사용 과정을 정리해 공유하고 싶은 사람
- **고민**: 세션 대화를 매번 수동으로 정리하기 번거로움
- **사용 흐름**: `llmwiki build` → 정적 사이트 생성 → GitHub Pages 배포
- **가치**: AI 세션 → 자동으로 공유 가능한 지식 사이트

### 페르소나 C: 팀의 지식 아키비스트
- **프로필**: 팀의 AI 활용 히스토리를 보존하려는 테크 리드
- **고민**: 팀원들의 AI 세션에서 나온 솔루션이 기록되지 않음
- **사용 흐름**: 팀원 세션 로그 수집 → 종합 위키 + 모델 비교 페이지 자동 생성
- **가치**: 팀 차원의 AI 활용 지식 자산화

## 10. 장단점

### 장점
- 가장 넓은 에이전트 지원 (6종+)
- 이중 출력으로 사람과 AI 모두 소비 가능
- 정적 사이트라 호스팅 비용 제로 (GitHub Pages, Netlify)
- 품질 점수로 위키 건강 상태 객관적 측정

### 단점
- AI 세션 로그에 특화되어, 일반 문서(논문, 아티클) 기반 위키에는 다소 부적합
- 빌드 과정이 필요 (실시간 반영이 아님)
- 세션 로그 접근 권한 설정이 에이전트마다 다름

<!-- study-links:start -->
## 관련 문서

- `디자인 패턴`: [[정보처리기사/1과목 소프트웨어 설계/049 디자인 패턴(Design Pattern)/049 디자인 패턴(Design Pattern)|049 디자인 패턴(Design Pattern)]]
- `상속`: [[정보처리기사/1과목 소프트웨어 설계/034 상속(Inheritance)/034 상속(Inheritance)|034 상속(Inheritance)]]
<!-- study-links:end -->
