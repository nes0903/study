sequenceDiagram
autonumber
actor U as 사용자
participant B as 브라우저
participant M as Next.js`<br/>`middleware
participant A as NestJS`<br/>`backend
participant D as sqlite`<br/>`(auth\_\*)
participant L as LINE WORKS

    rect rgb(245, 248, 252)
    Note over U,L: ① 최초 접근 (미인증)
    U->>B: GET /
    B->>M: 요청 (쿠키 없음)
    M-->>B: 302 → /login
    B->>M: GET /login
    M-->>B: 200 로그인 페이지
    end

    rect rgb(238, 252, 245)
    Note over U,L: ② 로그인 시작
    U->>B: "네이버웍스로 로그인" 클릭
    B->>A: GET /api/auth/line-works/login`<br/>`(_rsc·HEAD·Purpose=prefetch는 405로 차단)
    A->>D: INSERT auth_oauth_states`<br/>`(state, expires_at = +10분)
    A-->>B: 302 → LINE WORKS authorize URL`<br/>`(state + prompt=login)
    B->>L: GET /oauth2/v2.0/authorize
    L-->>U: 네이버웍스 로그인 화면
    U->>L: 계정/비밀번호 입력
    L-->>B: 302 → /callback?code=&state=
    end

    rect rgb(252, 248, 238)
    Note over U,L: ③ 콜백 & 세션 생성
    B->>A: GET /api/auth/line-works/callback
    A->>D: SELECT+DELETE auth_oauth_states`<br/>`(state 검증 & 1회용)
    A->>L: POST /oauth2/v2.0/token (JWT Bearer)
    L-->>A: access_token
    A->>L: GET /v1.0/users/me
    L-->>A: { userId, domainId, userName, email }
    A->>A: domainId == env.LINE_WORKS_DOMAIN_ID ?
    A->>D: INSERT auth_sessions`<br/>`(id=random 32B,`<br/>` user_id, expires_at = +14일)
    A-->>B: 302 → / + Set-Cookie`<br/>`wt_session=`<id>`; Max-Age=14일;`<br/>`HttpOnly; Secure; SameSite=Lax
    end

    rect rgb(248, 238, 252)
    Note over U,L: ④ 인증된 요청 (이후 14일)
    B->>A: GET /api/... + Cookie wt_session
    A->>D: SELECT auth_sessions`<br/>`WHERE id=? AND expires_at > now()
    D-->>A: row (유효) / null (만료)
    alt 유효
        A->>D: UPDATE last_seen_at = now()
        A-->>B: 200 + 데이터
    else 만료/없음
        A-->>B: 401 Unauthorized
        B-->>M: 다음 이동 시 /login으로 redirect
    end
    end

    rect rgb(252, 238, 238)
    Note over U,L: ⑤ 로그아웃
    U->>B: "로그아웃" 클릭
    B->>A: POST /api/auth/logout
    A->>D: DELETE auth_sessions WHERE id=?
    A-->>B: 200 + Set-Cookie`<br/>`wt_session=""; Max-Age=0
    B->>B: window.location = /login
    end
