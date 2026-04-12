# llmwiki (lucasastorian) — 웹앱 기반 LLM Wiki

> GitHub: https://github.com/lucasastorian/llmwiki
> 라이브 데모: https://llmwiki.app
> 라이선스: Apache 2.0

---

## 1. 프로젝트 개요

Karpathy의 LLM Wiki 개념을 **풀스택 웹 애플리케이션**으로 구현한 오픈소스 프로젝트. 마크다운 파일과 CLI 중심이었던 원본 패턴을 웹 UI + MCP 서버로 끌어올려, 비개발자도 접근할 수 있도록 만든 것이 핵심 차별점이다.

## 2. 구현 방향성

| 구분 | Karpathy 원본 | llmwiki |
|------|--------------|---------|
| 인터페이스 | CLI + Obsidian | **웹 대시보드** (Next.js) |
| LLM 연결 | 에이전트에 직접 붙여넣기 | **MCP 서버** (OAuth 인증) |
| 검색 | index.md 수동 탐색 | **PGroonga 풀텍스트 검색** |
| 문서 처리 | 마크다운만 | PDF, Office, 이미지 + **OCR (Mistral)** |
| 배포 | 로컬 전용 | 호스팅 서비스 or 셀프 호스팅 |

**핵심 철학**: "원본의 패턴은 훌륭하지만, 설치와 운영 장벽이 너무 높다. 브라우저만 열면 바로 쓸 수 있어야 한다."

## 3. 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Web (UI)   │────▶│  API Server │────▶│  Supabase (DB)   │
│  Next.js 16 │     │  FastAPI    │     │  PostgreSQL      │
│  React 19   │     │             │     │  + PGroonga      │
│  Tailwind   │     │  OCR/처리   │     │  + RLS           │
└─────────────┘     └──────┬──────┘     └──────────────────┘
                           │
                    ┌──────▼──────┐     ┌──────────────────┐
                    │  Converter  │     │    S3 Storage     │
                    │  LibreOffice│     │  원본 파일/이미지  │
                    └─────────────┘     └──────────────────┘
                    
                    ┌─────────────┐
                    │  MCP Server │◀──── Claude (AI)
                    │  Port 8080  │
                    └─────────────┘
```

### 컴포넌트별 역할

| 컴포넌트 | 기술 스택 | 역할 |
|----------|----------|------|
| **Web** | Next.js 16, React 19, Tailwind, Radix UI | 대시보드, 문서 뷰어, 위키 렌더러, 온보딩 |
| **API** | FastAPI, asyncpg, aioboto3 | 인증, TUS 업로드, 문서 처리, OCR (Mistral) |
| **Converter** | FastAPI, LibreOffice | Office 문서 → PDF 변환 (격리 서비스) |
| **MCP** | MCP SDK, Supabase OAuth | Claude ↔ 위키 연결 |
| **Database** | Supabase (PostgreSQL + PGroonga + RLS) | 문서, 청크, 지식베이스, 사용자 관리 |
| **Storage** | S3 호환 | 원본 파일, 태그된 HTML, 추출 이미지 |

### 언어 비율
- TypeScript: 61.9%
- Python: 32.3%
- PLpgSQL: 3.2%
- CSS: 2.3%

## 4. 3레이어 데이터 모델

Karpathy의 원본 3레이어를 충실히 따르되, 각 레이어를 웹 서비스로 구현:

1. **Raw Sources** — 불변의 원본 문서 (PDF, Office, 이미지). LLM은 읽기만 함
2. **The Wiki** — LLM이 생성한 마크다운 페이지. 요약, 크로스레퍼런스, 다이어그램, 테이블 포함
3. **The Tools** — MCP를 통한 검색, 읽기, 쓰기, 삭제 오퍼레이션

## 5. MCP 도구 상세

Claude가 위키를 조작할 때 사용하는 5가지 도구:

| 도구 | 기능 | 상세 |
|------|------|------|
| `guide` | 위키 안내 | 위키 메커니즘 설명, 지식베이스 목록 조회 |
| `search` | 검색 | 파일 브라우징, PGroonga 키워드 랭킹 검색 |
| `read` | 읽기 | 페이지 범위 지정, 인라인 이미지, glob 배치 읽기 |
| `write` | 쓰기 | 페이지 생성/편집, str_replace, append, SVG/CSV 지원 |
| `delete` | 삭제 | 경로 또는 glob 패턴으로 문서 아카이브 |

## 6. 지원 문서 포맷

- PDF (OCR 포함)
- Microsoft Office (Word, Excel, PowerPoint → LibreOffice 변환)
- 마크다운
- 일반 텍스트
- 이미지 (인라인 뷰잉)

## 7. 셋업 방법

### 호스팅 서비스 (간편)
1. llmwiki.app 가입
2. 소스 업로드 (PDF, 노트, 아티클)
3. Settings → MCP 설정 복사 → Claude.ai에 커넥터 추가
4. Claude에게 소스 읽고 위키 컴파일 지시

### 셀프 호스팅

**사전 요구사항**: Python 3.11+, Node.js 20+, Supabase, S3 호환 버킷

```bash
# 1. 데이터베이스
psql $DATABASE_URL -f supabase/migrations/001_initial.sql

# 2. API 서버 (포트 8000)
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload --port 8000

# 3. MCP 서버 (포트 8080)
cd mcp
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8080

# 4. 프론트엔드
cd web
npm install && cp .env.example .env.local
npm run dev
```

### 환경 변수

**API (.env)**:
`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `MISTRAL_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

**Web (.env.local)**:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`

## 8. 디렉토리 구조

```
llmwiki/
├── .github/workflows/       # CI/CD
├── api/                     # FastAPI 백엔드
├── converter/               # LibreOffice 변환 서비스
├── mcp/                     # MCP 서버
├── supabase/migrations/     # DB 스키마
├── tests/                   # 테스트
├── web/                     # Next.js 프론트엔드
├── docker-compose.yml       # 컨테이너 오케스트레이션
├── .env.example             # 설정 템플릿
└── LICENSE                  # Apache 2.0
```

## 9. 관련 개념

- **MCP (Model Context Protocol)**: Anthropic이 만든 표준 프로토콜. LLM이 외부 도구/데이터에 접근하는 통일된 인터페이스
- **PGroonga**: PostgreSQL용 풀텍스트 검색 확장. 한국어/일본어/중국어 등 CJK 언어도 지원
- **TUS 프로토콜**: 대용량 파일의 재개 가능한 업로드 프로토콜
- **RLS (Row Level Security)**: Supabase/PostgreSQL의 행 수준 보안. 사용자별 데이터 격리

## 10. 이용 페르소나

### 페르소나 A: 비개발자 리서처
- **프로필**: 논문과 리포트를 많이 읽는 애널리스트
- **니즈**: CLI 없이 브라우저에서 바로 지식 관리
- **사용 흐름**: llmwiki.app 가입 → PDF 업로드 → Claude가 자동 위키 생성
- **가치**: 기술 장벽 제로, 즉시 사용 가능

### 페르소나 B: 팀 지식 관리자
- **프로필**: 사내 위키를 관리하는 PM이나 테크 리드
- **니즈**: 팀원들이 문서를 올리면 자동으로 정리되는 시스템
- **사용 흐름**: 셀프 호스팅 → 팀원들 초대 → Supabase RLS로 권한 관리
- **가치**: 문서 정리 자동화, 크로스레퍼런스 유지비용 제거

### 페르소나 C: 기술 탐구자
- **프로필**: 새로운 기술을 깊게 파고드는 개발자
- **니즈**: 읽은 아티클/논문의 지식이 누적되는 시스템
- **사용 흐름**: Web Clipper로 아티클 수집 → 업로드 → 위키가 점점 풍성해짐
- **가치**: RAG 대비 지식의 복리 효과

## 11. 장단점

### 장점
- 가장 낮은 진입 장벽 (호스팅 서비스 제공)
- 풀스택 구현으로 바로 사용 가능
- MCP 기반으로 Claude.ai와 네이티브 연동
- 다양한 문서 포맷 지원

### 단점
- 인프라 비용 (셀프 호스팅 시 Supabase, S3 등)
- Obsidian/Logseq 같은 로컬 도구와의 통합 없음
- Claude 전용 (다른 LLM 미지원)
