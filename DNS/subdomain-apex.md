# 서브도메인과 Apex 상세 정리

작성 기준일: 2026-04-16  
조사 방식: 웹검색 기반 최신 조사  
주요 참고: `rfc-editor.org` RFC, `docs.aws.amazon.com` Route 53 공식 문서

## 1. 문서 목적

이 문서는 DNS에서 자주 같이 나오지만 미묘하게 헷갈리는 `subdomain(서브도메인)`과 `apex(에이펙스, zone apex)`를 자세히 정리한 학습 문서다.

특히 아래를 함께 설명한다.

- 서브도메인의 정확한 뜻
- apex가 정확히 무엇을 가리키는지
- `root domain`, `apex domain`, `zone apex`, `naked domain`이 어떻게 겹치고 어떻게 다른지
- `www.example.com`은 왜 서브도메인인가
- `acme.example.com`은 서브도메인이면서 동시에 자기 zone의 apex가 될 수 있는가
- apex에 CNAME을 왜 둘 수 없는가
- Route 53에서 서브도메인을 기존 zone에 추가하는 방식과 별도 hosted zone으로 위임하는 방식 차이

즉 이 문서는 단순히 "서브도메인은 앞에 붙는 것" 같은 설명을 넘어서, DNS 계층과 zone 운영 관점에서 subdomain과 apex를 읽는 감각을 만드는 데 목적이 있다.

---

## 2. 먼저 한 줄 요약

`subdomain`은 어떤 도메인 이름이 다른 도메인 이름 안에 포함될 때 성립하는 계층 관계이고, `apex`는 특정 `zone`의 꼭대기(top node) 또는 origin을 가리키는 운영 용어다.

즉 둘은 같은 층의 개념이 아니다.

- `subdomain` = 이름 사이의 포함 관계
- `apex` = 하나의 zone에서 최상단 이름

예:

```text
www.example.com
```

에서:

- `www.example.com`은 `example.com`의 서브도메인이다
- `example.com` hosted zone을 기준으로 보면 apex는 `example.com`이다

그리고:

```text
acme.example.com
```

은 `example.com`의 서브도메인이면서, 만약 `acme.example.com`을 별도 zone으로 위임했다면 그 zone의 apex가 될 수 있다.

즉 "subdomain인지 아닌지"와 "apex인지 아닌지"는 동시에 성립할 수 있다.

---

## 3. 서브도메인이란 무엇인가

### 3.1 RFC 기준 정의

RFC 8499는 `Subdomain`을 다음처럼 정의한다.

- 어떤 domain이 다른 domain 안에 포함되어 있으면 subdomain이다
- 판별은 그 이름이 포함하는 domain 이름으로 끝나는지를 보면 된다

즉:

```text
nnn.mmm.example.com
```

은:

- `mmm.example.com`의 서브도메인
- `example.com`의 서브도메인

이다.

### 3.2 핵심 감각

서브도메인은 "앞에 점 하나 더 붙은 이름"이라고 단순화해도 대체로 맞지만, 더 정확하게는:

- 오른쪽 suffix를 공유하는 더 긴 이름

이다.

즉:

- `api.example.com`은 `example.com`의 서브도메인
- `beta.api.example.com`은 `api.example.com`의 서브도메인
- 동시에 `example.com`의 서브도메인

이다.

### 3.3 중요한 주의점

RFC 8499는 비교가 `whole labels` 기준이라고 설명한다.

즉:

- `ooo.example.com`은 `oo.example.com`의 서브도메인이 아니다

왜냐하면 레이블이 정확히 일치해야 하기 때문이다.

즉 문자열 부분 일치가 아니라 DNS label 경계가 중요하다.

---

## 4. Apex란 무엇인가

### 4.1 RFC 기준 정의

RFC 8499는 `Apex`를:

- `SOA`와 대응하는 authoritative `NS RRset`의 owner가 있는 tree 상의 지점
- 즉 `zone apex`

라고 정의한다.

또한 문서는:

- `origin`
- `apex`

가 요즘에는 자주 거의 같은 뜻으로 쓰인다고 설명한다.

### 4.2 아주 단순하게 말하면

apex는:

- 특정 DNS zone의 맨 꼭대기 이름

이다.

예:

- `example.com` zone의 apex는 `example.com`
- `acme.example.com` zone을 따로 만들었다면 그 zone의 apex는 `acme.example.com`

### 4.3 왜 zone이 중요하나

apex는 단순히 "문자열의 맨 오른쪽"을 뜻하지 않는다.

apex는 늘:

- 특정 zone을 기준으로

정해진다.

즉 apex는 domain name 자체의 속성이라기보다, `zone 운영 문맥`의 개념이다.

### 4.4 root와는 다른가

다르다.

`root (.)`는 DNS 전체 tree의 최상단이다.

반면 `zone apex`는:

- 각 zone마다 따로 있다

즉:

- root zone apex는 `.`
- `com` zone apex는 `com`
- `example.com` zone apex는 `example.com`

일 수 있다.

---

## 5. `root domain`, `apex domain`, `naked domain`

이 용어들은 현업에서 종종 섞여서 쓰인다.

### 5.1 `zone apex`

가장 기술적으로 정확한 말이다.

특정 zone의 최상단 이름을 가리킨다.

예:

- `example.com` hosted zone의 zone apex = `example.com`

### 5.2 `apex domain`

실무에서는 zone apex를 가리키는 표현으로 많이 쓴다.

즉:

- `example.com`

을 `example.com` zone의 apex domain이라고 말할 수 있다.

### 5.3 `root domain`

현업에서 흔히 쓰지만 조금 모호한 표현이다.

보통은:

- `www.example.com`에 대비되는
- `example.com`

을 가리킨다.

즉 실제 RFC 용어라기보다 운영/마케팅 문맥 표현에 가깝다.

### 5.4 `naked domain`

이것도 RFC 용어라기보다 현업 표현이다.

보통:

- 앞에 `www` 같은 서브도메인 없이
- zone apex 이름 자체를 쓰는 도메인

이라는 뜻으로 쓴다.

예:

- `example.com` = naked domain
- `www.example.com` = 서브도메인 버전

### 5.5 실무 감각

대부분의 웹 운영 문맥에서는:

- `root domain`
- `apex domain`
- `naked domain`

이 비슷하게 쓰이지만, DNS 기술 문서로 정확히 말하려면 `zone apex`가 더 정확하다.

---

## 6. 예시로 보는 subdomain과 apex

### 6.1 `example.com`

`example.com` zone이 있다고 하자.

이 경우:

- apex = `example.com`

### 6.2 `www.example.com`

이 이름은:

- `example.com`의 서브도메인
- `example.com` zone 안의 한 레코드 이름

이다.

즉 `www`는 아주 흔하지만, 특별 대우받는 예약 이름은 아니다.

그냥 일반적인 서브도메인 레이블일 뿐이다.

### 6.3 `api.example.com`

이 이름도:

- `example.com`의 서브도메인

이다.

### 6.4 `beta.api.example.com`

이 이름은:

- `api.example.com`의 서브도메인
- `example.com`의 서브도메인

둘 다 성립한다.

즉 subdomain 관계는 계층적으로 누적된다.

### 6.5 `acme.example.com`을 별도 zone으로 위임한 경우

Route 53 문서가 설명하듯 `acme.example.com`을 별도 hosted zone으로 만들 수 있다.

그 경우:

- `acme.example.com`은 여전히 `example.com`의 서브도메인
- 동시에 `acme.example.com` zone의 apex

가 된다.

즉 subdomain과 apex는 배타적 개념이 아니다.

---

## 7. "서브도메인은 무조건 별도 DNS zone이 있어야 하나"

아니다.

이것도 매우 흔한 오해다.

### 7.1 같은 hosted zone 안에 레코드만 추가하는 경우

AWS Route 53 문서는:

- 보통은 parent domain의 hosted zone 안에
- `acme.example.com` 같은 레코드를 추가해
- 서브도메인을 라우팅할 수 있다고 설명한다

즉:

- `example.com` hosted zone 안에
- `www.example.com`
- `api.example.com`
- `acme.example.com`

를 모두 둘 수 있다.

### 7.2 별도 hosted zone으로 위임하는 경우

Route 53 `Routing traffic for subdomains` 문서는 또 다른 방식도 설명한다.

즉:

1. `acme.example.com`용 별도 hosted zone 생성
2. 그 zone에 필요한 레코드 생성
3. parent zone(`example.com`)에 `acme.example.com`의 `NS` 레코드 추가

즉 delegation을 통해 별도 zone으로 넘길 수 있다.

### 7.3 언제 별도 zone이 유리한가

Route 53 문서는 다음 이유를 들 수 있다.

- 팀별 권한 분리
- 하위 서비스 자율 운영
- 별도 lifecycle 관리

즉 모든 서브도메인을 parent zone 한 군데에 몰아둘 필요는 없다.

---

## 8. Apex는 왜 특별한가

zone apex는 일반 레코드 이름과 달리 특별한 제약이 생기기 쉽다.

### 8.1 SOA와 NS가 존재해야 한다

RFC 8499 정의에서도 apex는:

- `SOA`
- authoritative `NS`

와 연결된 지점이라고 설명한다.

즉 zone apex에는 그 zone 자체를 설명하는 메타데이터가 반드시 존재한다.

### 8.2 그래서 운영상 제약이 생긴다

가장 유명한 것이 CNAME 제약이다.

즉 apex는 다른 이름보다 자유도가 조금 덜하다.

### 8.3 실무 감각

서브도메인은 비교적 자유롭게:

- A
- AAAA
- CNAME

등을 줄 수 있는 반면, apex는 zone 운영 메타데이터와 충돌하지 않는지 봐야 한다.

즉 "www에 되는 설정이 apex에도 그대로 된다"라고 생각하면 안 된다.

---

## 9. apex에 CNAME을 둘 수 없는 이유

이건 서브도메인/apex를 배울 때 꼭 같이 알아야 한다.

### 9.1 Route 53 공식 설명

AWS Route 53 문서는:

- hosted zone과 같은 이름(zone apex)에는 CNAME을 만들 수 없다고 설명한다

그리고 alias 문서에서도:

- zone apex에는 CNAME record를 만들 수 없다고 다시 명시한다

### 9.2 왜 그런가

기술적으로는 zone apex에:

- `SOA`
- `NS`

가 있어야 하는데, CNAME owner name에는 다른 데이터가 공존하면 안 되기 때문이다.

즉:

- apex는 zone 메타데이터가 필요한 위치
- CNAME은 "그 이름은 다른 정식 이름의 별칭"이라고 선언하는 레코드

라서 충돌한다.

### 9.3 그래서 왜 `www`는 되는데 apex는 안 되나

예:

- `www.example.com`은 일반 서브도메인이므로 CNAME 가능
- `example.com`은 zone apex이므로 CNAME 불가

즉 `www`와 apex는 같은 "도메인 이름"처럼 보여도 zone 역할이 다르다.

### 9.4 실무 우회

그래서 DNS provider들은 보통:

- `ALIAS`
- `ANAME`
- flattening

같은 provider-specific 기능을 제공한다.

AWS Route 53에서는 `alias record`가 대표적이다.

즉 "CNAME처럼 보이지만 apex에서도 동작하는 provider 확장"이라고 이해하면 된다.

---

## 10. Route 53 alias와 apex

AWS Route 53 문서는 alias records가:

- zone apex에서도 사용할 수 있다고 설명한다

즉:

- `example.com` apex에
- CloudFront, ALB, S3 website endpoint, 같은 hosted zone 다른 record 등으로
- alias를 만들 수 있다

### 10.1 왜 중요한가

운영에서 흔한 요구:

- 사용자가 `www.example.com`이 아니라 `example.com`으로 접속하길 원함

그런데 apex에는 CNAME을 둘 수 없다.

이 문제를 Route 53 alias가 해결한다.

### 10.2 alias는 표준 DNS 레코드 타입인가

아니다.

Route 53 문서도 alias를 Route 53 specific extension으로 설명한다.

즉 provider 기능이지 RFC 표준 RR type은 아니다.

### 10.3 실무 감각

즉:

- 표준 DNS 문맥 -> apex CNAME 불가
- Route 53 운영 문맥 -> alias로 비슷한 효과 가능

이라고 분리해서 이해해야 한다.

---

## 11. `www`를 둘지 apex를 둘지

이것도 실무에서 자주 고민한다.

### 11.1 `www.example.com`

장점:

- 일반 서브도메인이라 CNAME 운용이 자유롭다
- CDN/호스팅 이전이 상대적으로 단순할 수 있다

### 11.2 `example.com` apex

장점:

- 사용자가 짧고 깔끔하게 기억한다
- 브랜딩상 선호된다

단점:

- CNAME 제약
- provider 확장(alias/flattening)에 의존하기 쉬움

### 11.3 실제 운영 패턴

흔한 패턴:

- `example.com`도 열어 두고
- `www.example.com`도 운영하거나
- 한쪽으로 canonical redirect

즉 둘 중 하나만 절대적으로 정답인 것은 아니다.

### 11.4 추천 감각

DNS/호스팅 유연성을 중시하면 `www`가 운영상 편한 경우가 많고, 사용자 경험과 브랜딩을 중시하면 apex 접근도 같이 제공하는 경우가 많다.

즉 기술과 UX를 같이 봐야 한다.

---

## 12. 서브도메인 위임(delegation)

### 12.1 기본 개념

서브도메인을 별도 zone으로 운영하려면 parent zone에서 delegation을 해야 한다.

즉:

- `example.com` zone에
- `acme.example.com`의 `NS` 레코드 추가

가 필요하다.

### 12.2 Route 53 공식 흐름

Route 53 문서는 아래 흐름을 설명한다.

1. 서브도메인용 hosted zone 생성
2. 그 zone에 필요한 레코드 추가
3. parent zone에 서브도메인 NS 추가

즉 delegation은 단순 "이름을 만든다"가 아니라 권한을 child zone으로 넘기는 작업이다.

### 12.3 왜 하는가

- 팀 분리
- 운영 권한 분리
- 다른 네임서버 사업자 사용
- 큰 조직의 하위 서비스 독립성

### 12.4 안 해도 되는 경우

그냥 parent zone 안에 레코드만 추가해도 되면 굳이 delegation할 필요는 없다.

즉 서브도메인이 있다고 해서 항상 child zone이 필요한 것은 아니다.

---

## 13. Private hosted zone에서도 같은가

AWS Route 53 private hosted zone 문서도:

- 특정 domain과 그 subdomains에 대한 응답을
- VPC 내부에서 정의한다고 설명한다

즉 private DNS에서도:

- subdomain
- apex
- delegation

같은 개념은 그대로 존재한다.

단지 범위가:

- public internet이 아니라
- 특정 VPC 내부

일 뿐이다.

### 13.1 실무 감각

예:

- `example.internal`
- `db.example.internal`
- `api.dev.example.internal`

같은 이름도 private zone 안에서 같은 규칙으로 읽는다.

즉 subdomain/apex 개념은 public DNS 전용이 아니다.

---

## 14. 흔한 예시로 다시 정리

### 14.1 `example.com` hosted zone 하나만 있을 때

레코드:

- `example.com` -> apex
- `www.example.com` -> subdomain
- `api.example.com` -> subdomain
- `beta.api.example.com` -> subdomain

이 경우 apex는 오직 `example.com`이다.

### 14.2 `acme.example.com`을 별도 zone으로 위임했을 때

구조:

- parent zone: `example.com`
- child zone: `acme.example.com`

이때:

- `acme.example.com`은 parent 입장에선 서브도메인
- child 입장에선 자기 zone apex

이다.

즉 관점에 따라 둘 다 맞다.

### 14.3 `www.example.com`은 apex가 될 수 있나

가능하다.

만약 `www.example.com` 자체를 별도 zone으로 위임하면 그 zone의 apex가 된다.

즉 `www`가 본질적으로 "항상 일반 레코드일 뿐"인 게 아니라, 운영자가 어떻게 zone을 자르느냐에 따라 apex가 될 수도 있다.

---

## 15. 실무에서 자주 하는 오해

### 15.1 "서브도메인은 도메인 앞에 붙는 별명이다"

반은 맞고 반은 틀리다.

서브도메인은 단순 접두어가 아니라 DNS 계층 관계다.

### 15.2 "apex는 그냥 루트 도메인이다"

운영 현장에서는 그렇게 말해도 통하지만, 기술적으로는 `특정 zone의 top node`라는 뜻이 더 정확하다.

### 15.3 "`www`는 특별한 예약 이름이다"

아니다.

`www`는 관습적으로 많이 쓰는 이름일 뿐, DNS 프로토콜 차원의 특별 예약 레이블은 아니다.

### 15.4 "서브도메인을 만들려면 항상 별도 hosted zone이 필요하다"

아니다.

보통은 parent zone에 레코드만 추가하면 된다.

### 15.5 "apex에는 CNAME도 당연히 둘 수 있다"

아니다.

zone apex는 NS/SOA와 공존해야 해서 일반 CNAME 제약을 받는다.

---

## 16. 실무 체크리스트

서브도메인/apex 설계를 볼 때는 아래를 먼저 보면 된다.

### 16.1 이 이름이 단순 레코드인가, 별도 zone인가

- parent zone 안 레코드만 추가하는가
- 별도 hosted zone으로 위임하는가

### 16.2 지금 말하는 "apex"가 어느 zone 기준인가

- `example.com` zone apex인가
- `acme.example.com` child zone apex인가

### 16.3 CNAME이 필요한가

- 일반 서브도메인이면 가능
- zone apex이면 제약을 확인해야 함

### 16.4 provider-specific 기능이 필요한가

- Route 53 alias
- flattening
- ALIAS/ANAME

같은 기능이 필요한지 봐야 한다.

### 16.5 운영 권한 분리가 필요한가

- 필요하면 subdomain delegation 고려
- 필요 없으면 parent zone 안 관리가 더 단순

---

## 17. 한 문장 결론

서브도메인은 어떤 이름이 다른 도메인 이름 안에 포함되는 `계층 관계`이고, apex는 특정 zone의 가장 위쪽 이름을 뜻하는 `운영 기준점`이기 때문에, `acme.example.com` 같은 이름은 parent 관점에선 서브도메인이면서 child zone 관점에선 apex가 될 수 있다.

즉 이 주제의 핵심은:

- 이름 관계(subdomain)
- zone 경계(apex)
- delegation 여부
- apex의 CNAME 제약

를 분리해서 이해하는 것이다.

---

## 18. 공식 출처

- RFC 1034, Domain Names - Concepts and Facilities: <https://www.rfc-editor.org/info/rfc1034>
- RFC 2181, Clarifications to the DNS Specification: <https://www.rfc-editor.org/info/rfc2181>
- RFC 4033, DNS Security Introduction and Requirements: <https://www.rfc-editor.org/info/rfc4033>
- RFC 8499, DNS Terminology: <https://www.rfc-editor.org/rfc/rfc8499.html>
- Route 53: Creating a public hosted zone: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html>
- Route 53: Working with hosted zones: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html>
- Route 53: Routing traffic for subdomains: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-routing-traffic-for-subdomains.html>
- Route 53: Choosing between alias and non-alias records: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html>
- Route 53: Values specific for simple alias records: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-alias.html>
