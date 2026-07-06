# 323 VPN(Virtual Private Network, 가상 사설 통신망)

작성 기준일: 2026-06-01
검색/보강일: 2026-06-04
기준 PDF: `/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf`
PDF 확인 위치: 45페이지 `323 VPN(Virtual Private Network, 가상 사설 통신망)`

## 한 줄 요약

- VPN은 공중 네트워크와 암호화 기술을 이용해 전용 회선을 쓰는 것처럼 안전한 사설 통신 환경을 제공하는 보안 솔루션이다.

## 한눈에 보는 구조

```mermaid
flowchart LR
    A["사용자"] --> B["암호화 터널"]
    B --> C["공중 네트워크"]
    C --> D["VPN 게이트웨이"]
    D --> E["사내/사설 네트워크"]
```

## PDF 기준 핵심

- 공중 네트워크와 암호화 기술을 이용한다.
- 사용자가 마치 자신의 전용 회선을 사용하는 것처럼 해주는 보안 솔루션이다.
- `공중 네트워크`, `암호화`, `전용 회선처럼`이 핵심 단서이다.

## 개념 설명

- VPN은 인터넷 같은 공중망 위에 논리적 사설 네트워크를 만든다.
- 암호화와 터널링을 통해 외부 사용자가 사내망에 안전하게 접속하거나, 지점 간 통신을 보호할 수 있다.
- NIST는 VPN을 상대적으로 공개된 물리 네트워크 자원 위에 구축된 제한 사용 논리 네트워크로 설명한다.
- SSL VPN, IPsec VPN 등 구현 방식이 다양하다.

## 시험 포인트

- VPN은 `Virtual Private Network`이다.
- VLAN은 LAN 내부 논리 분리이고, VPN은 공중망 위 사설 통신망이다.
- 암호화와 터널링이 핵심 기술 단서이다.
- 원격 근무, 지점 연결, 안전한 공중망 사용과 연결된다.

## 헷갈리는 비교

| 구분 | VPN | VLAN |
|---|---|---|
| 대상 | 공중망 위 사설 통신 | LAN 내부 논리 분리 |
| 핵심 기술 | 암호화, 터널링 | VLAN 태그, 스위칭 |
| 목적 | 안전한 원격/지점 연결 | 성능/보안성 향상 |
| 시험 단서 | 전용 회선처럼 | Virtual LAN |

## 예시 또는 암기 포인트

- 집에서 회사 VPN에 접속해 회사 내부 시스템을 쓰는 것이 VPN 사용 예이다.
- 암기식: `VPN = Public망 위 Private 터널`.

## 빠른 복습

- VPN의 기반 망은? 공중 네트워크.
- 안전성을 위해 쓰는 기술은? 암호화.
- VLAN과 차이는? VLAN은 LAN 내부 분리이다.

## 상세 보강

```mermaid
flowchart LR
    A["원격 사용자/지점"] --> B["공중 네트워크"]
    B --> C["암호화 터널"]
    C --> D["사내 네트워크"]
```

- VPN은 공중 네트워크 위에 암호화된 터널을 만들어 전용 회선처럼 안전하게 통신하게 하는 보안 솔루션이다.
- 원격 근무자, 지점 간 연결, 클라우드와 사내망 연결에서 자주 사용된다.
- 핵심은 실제 전용 회선을 임대하지 않아도 암호화와 터널링으로 사설망처럼 동작하게 하는 것이다.
- IPsec VPN은 네트워크 계층 보호와 연결되고, SSL/TLS VPN은 웹 기반 원격 접속과 자주 연결된다.
- 시험에서는 VPN을 SSH와 구분한다. VPN은 네트워크 터널, SSH는 보안 원격 셸/명령 실행 프로토콜이다.

| 구분 | VPN | SSH |
|---|---|---|
| 목적 | 사설망 터널 | 원격 로그인/명령/파일 복사 |
| 범위 | 네트워크 연결 전체 | 특정 세션/서비스 |
| 단서 | Virtual Private Network | Secure Shell, 22번 |

## 참고 링크

- [NIST CSRC Glossary - Virtual Private Network](https://csrc.nist.gov/glossary/term/virtual_private_network)
- [NIST SP 800-77 Rev. 1 - Guide to IPsec VPNs](https://csrc.nist.gov/pubs/sp/800/77/r1/final)

<!-- study-links:start -->
## 관련 문서

- `네트워크 계층`: [[정보처리기사/4과목 프로그래밍 언어 활용/210 OSI 7계층 - 네트워크 계층(Network Layer)/210 OSI 7계층 - 네트워크 계층(Network Layer)|210 OSI 7계층 - 네트워크 계층(Network Layer)]]
- `vlan`: [[정보처리기사/5과목 정보시스템 구축 관리/261 VLAN(Virtual Local Area Network)/261 VLAN(Virtual Local Area Network)|261 VLAN(Virtual Local Area Network)]]
- `lan`: [[정보처리기사/5과목 정보시스템 구축 관리/264 LAN의 표준 규격 - 802.11e/264 LAN의 표준 규격 - 802.11e|264 LAN의 표준 규격 - 802.11e]]
- `ssh`: [[정보처리기사/5과목 정보시스템 구축 관리/324 SSH(Secure SHell, 시큐어 셸)/324 SSH(Secure SHell, 시큐어 셸)|324 SSH(Secure SHell, 시큐어 셸)]]
<!-- study-links:end -->
