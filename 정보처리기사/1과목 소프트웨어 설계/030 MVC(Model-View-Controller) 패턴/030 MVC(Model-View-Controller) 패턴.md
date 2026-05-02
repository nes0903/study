# 030 MVC(Model-View-Controller) 패턴

작성 기준일: 2026-05-02  
과목: `1과목 소프트웨어 설계`  
기준 PDF: `/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf`  
PDF 확인 위치: `4페이지`  
검색 보강: 공식/표준/고품질 참고 자료를 함께 확인하여 시험 중심으로 확장 정리

---

## 1. 한 줄 요약

```mermaid
flowchart TD
    A["MVC(Model-View-Controller) 패턴"]
    A --> N1["모델은 서브시스템의 핵심 기능과 데이터를 보관한다."]
    A --> N2["뷰는 사용자에게 정보를 표시한다."]
    A --> N3["컨트롤러는 사용자 입력 변경 요청을 처리하기 위해 모델에게 명령을 보낸다."]
```

- MVC 패턴은 모델, 뷰, 컨트롤러로 책임을 나누어 데이터/비즈니스 로직, 화면 표시, 사용자 입력 처리를 분리하는 아키텍처 패턴이다.
- 이 챕터는 `아키텍처` 영역에 속한다.
- 시험에서는 정의, 핵심 키워드, 비슷한 개념과의 구분을 함께 묻는 경우가 많다.

---

## 2. PDF 기준 핵심

- 모델은 서브시스템의 핵심 기능과 데이터를 보관한다.
- 뷰는 사용자에게 정보를 표시한다.
- 컨트롤러는 사용자 입력 변경 요청을 처리하기 위해 모델에게 명령을 보낸다.

- 위 항목은 PDF에서 직접 확인한 최소 암기 골격이다.
- 세부 설명은 이 골격을 기준으로 확장해서 이해하면 된다.

---

## 3. 개념 설명

- Model은 데이터와 핵심 도메인 상태를 담당한다.
- View는 사용자에게 보여지는 표현을 담당한다.
- Controller는 사용자 입력을 받아 적절한 모델 작업과 뷰 선택을 조정한다.
- 관심사의 분리를 통해 유지보수, 테스트, 협업을 쉽게 한다.
- 아키텍처는 시스템 전체 구조와 품질 속성을 좌우하는 큰 설계 결정이다.
- 아키텍처 패턴은 디자인 패턴보다 더 큰 구조 수준의 해결책이다.

---

## 4. 핵심 포인트

- 문제를 풀 때는 먼저 지문 속 단서어를 찾고, 그 단서어가 어떤 개념을 가리키는지 연결한다.
- 정의형 문제는 표현이 조금 바뀌어도 핵심 의미가 같으면 같은 개념으로 판단한다.
- 옳고 그름 문제에서는 `항상`, `반드시`, `전혀`, `모두` 같은 극단 표현을 특히 조심한다.
- 이 챕터는 단독 암기보다 인접 챕터와 비교해 기억하면 정답률이 올라간다.

---

## 5. 시험에서 헷갈리는 비교

| 구분 | 핵심 |
|---|---|
| `Model` | 데이터, 핵심 기능, 상태 |
| `View` | 화면 표시 |
| `Controller` | 입력 처리, 모델 명령, 흐름 제어 |

- 비교 문제는 이름보다 `역할`, `목적`, `사용 시점`, `장점/단점`을 기준으로 구분하면 안정적이다.

---

## 6. 예시 또는 암기 포인트

- MVC = `모델은 데이터, 뷰는 화면, 컨트롤러는 조정`.

- 암기는 단어만 외우기보다 `정의 -> 특징 -> 예시 -> 반대 개념` 순서로 묶는 것이 좋다.

---

## 7. 빠른 복습

- 챕터명: `030 MVC(Model-View-Controller) 패턴`
- 소속 영역: `아키텍처`
- 자주 나오는 문제 유형:
  - 정의를 주고 개념명을 고르는 문제
  - 특징을 섞어 놓고 옳은/틀린 설명을 고르는 문제
  - 유사 개념과 비교하여 다른 하나를 찾는 문제

---

## 8. 참고 링크

- 기준 PDF: `/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf`
- [Q-Net 정보처리기사 종목 페이지](https://www.q-net.or.kr/crf005.do?id=crf00503s02&jmCd=1320&jmInfoDivCcd=B0)
- [SEI - Quality Attribute Design Primitives](https://www.sei.cmu.edu/library/quality-attribute-design-primitives-and-the-attribute-driven-design-method/)
- [Microsoft - Pipes and Filters pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters)
- [Microsoft - ASP.NET Core MVC overview](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
- [Martin Fowler - GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)
