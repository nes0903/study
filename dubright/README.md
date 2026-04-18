# Dubright 인프라 & 배포 구조 정리

조사일: 2026-04-17
AWS 계정: 471112500555 (ap-northeast-2)

---

## 1. 서버 현황

두 대의 EC2가 사실상 동일한 방식으로 운영됨. IAM Role 없음, 내부는 SSH 수동/CI 푸시 기반.

| 항목 | pickme-dubright (prod) | dubright-prod |
|---|---|---|
| Public IP | 13.124.59.214 | 3.36.215.20 |
| Instance ID | i-0ef84d63997613089 | i-08178e4528ba0710b |
| Name 태그 | `pickme-dubright` | `dubright-prod` |
| Tag | `dubright=pickme-prod` | `dubright=prod` |
| IAM Role | **없음** | **없음** |
| restart policy (`dubright-server`) | `no` (수동 기동) | `no` (수동 기동) |
| WhaTap 에이전트 | 없음 | 실행 중 (port 10120) |

### 공통 컨테이너 구성
- `dubright-server` (Node 계열 앱, port 22080, 재시작 정책 `no`)
- `selenium-chrome-ffmpeg` (화면 녹화용, port 54444/57900/54713/50022, `unless-stopped`)
- 호스트 `/home/www` → 컨테이너 `/www` 바인드 마운트

### `selenium-chrome-ffmpeg` 이미지 출처
- **로컬 빌드 이미지** (레지스트리 pull 아님)
- 베이스: `selenium/standalone-chrome:4.19.0-20240328`
- Dockerfile: `/home/ubuntu/install_files/screen_recorder/Dockerfile`
- 커스터마이징: `ffmpeg`, `pulseaudio`, `openssh-server` 추가

---

## 2. CI/CD — GitHub Actions SSH 배포

### 핵심 리포지토리: `https-dobedub-com/dubright_backend`
- 로컬 경로: `/Users/nes0903/Documents/dubright_backend`
- 워크플로: `.github/workflows/ci.yml`

### 플로우
```
developer push → GitHub Actions (ubuntu-latest)
  → rsync (--exclude=.git --exclude=.github --exclude=node_modules)
  → tar + scp (SSH 키: GitHub Secrets)
  → ssh → 서버에서 tar 해제
  → sudo docker cp deploy_temp/. dubright-server:/www/dubright/
```

### 브랜치별 배포 타겟
| 브랜치 | 환경 | Secrets 키 | 실제 서버 |
|---|---|---|---|
| `main` | PROD | `PROD_EC2_HOST/USER/SSH_KEY` | **3.36.215.20** (dubright-prod) |
| `pickme-main` | PROD | `PICKME_PROD_HOST/USER/SSH_KEY` | **13.124.59.214** (pickme-dubright) |
| `test` | TEST | `TEST_EC2_*` | (미확인) |
| `dev` | DEV | `DEV_EC2_*` | (미확인) |

### ⚠️ 주의사항 / 함정
1. **`.github/` 폴더는 배포 시 의도적으로 제외** → 서버에서는 워크플로 존재를 알 수 없음. 반드시 `dubright_backend` 리포에서 확인.
2. **컨테이너 재시작/재빌드 없음**. CI는 단순히 `docker cp`로 파일만 덮어씀. 핫리로드(nodemon 등)에 의존하는 구조로 추정.
3. **서버 내부의 `.git`은 CI와 무관한 레거시**
   - `/home/www/dubright/api_dubright/.git` → `dobedub/api_dubright` (옛날 clone)
   - `/home/www/dubright/.git` (3.36.215.20) → `dubright_front` (프론트)
   - 실제 운영 소스는 `/home/www/dubright/` 바로 아래, CI가 덮어쓴 파일들
4. **AWS 콘솔에서 배포 버튼 없음** — 배포 트리거는 GitHub push로만 가능. CodeDeploy/CodePipeline 계정 전체에 0개.

---

## 3. 네트워크 / 도메인 구성

AWS 네트워크 인프라(ALB/Route53/ACM)는 완전히 세팅돼 있음. 수동 운영인 "스노우플레이크 서버"지만 외부 진입은 프로덕션 수준.

### 13.124.59.214 (pickme-dubright) 앞단
```
pick.dubright.net      ┐
pickdown.dubright.net  ├─► ALB: pickme-dubright ──► :22080 (healthy)
                       ┘      HTTPS 443, ACM: *.dubright.net
```
- ALB DNS: `pickme-dubright-1699776454.ap-northeast-2.elb.amazonaws.com`
- Target Group: `pickme-dubright` (port 22080 HTTP)
- ACM cert: `arn:...:certificate/753273df-cc9d-4ec2-a0a2-eef8d773d2d4` (`*.dubright.net`)

### 3.36.215.20 (dubright-prod) 앞단
```
www.dubright.net       ┐
down.dubright.net      ├─► ALB: dubright ──► :22080 (healthy)
video.dubright.net     ┘
```
- ALB DNS: `dubright-1188445979.ap-northeast-2.elb.amazonaws.com`
- Target Group: `dubright` (port 22080 HTTP)

### 유사 이름 구분 (헷갈리기 쉬움)
| ALB | EC2 | 용도 |
|---|---|---|
| `pickme-dubright` | i-0ef84d63997613089 | pickme 프로덕션 |
| `dubright` | i-08178e4528ba0710b | 일반 프로덕션 |
| `dubright-test` | i-0ce6fbc034a6f3cbf | 테스트 (`app/appback/down/test.dubright.org`) |

### Security Group 특이사항 (pickme-dubright-test)
- 22 포트 `0.0.0.0/0` 개방 (SSH 전세계 허용)
- 22080 포트 일부 임시 IP 허용 (`temp_yousang`, `temp_leehyojeong`)
- 그 외 `7thfloor(dobedub)`, `otherfloor(dobedub)` 사무실 IP
- RDS 접근용 SG `ec2-rds-2` 별도 부착

---

## 4. Git 리포지토리 맵 (중요)

프로젝트에 동명/유사명 리포가 여러 개 있어서 혼란스럽다.

| 리포 | 역할 | 상태 |
|---|---|---|
| `https-dobedub-com/dubright_backend` | **현재 운영 중인 백엔드** | ✅ CI/CD 활성, 두 서버에 배포 |
| `https-dobedub-com/dubright_front` | 프론트엔드 | 서버에 clone 존재 (3.36.215.20) |
| `dobedub/api_dubright` | **레거시 백엔드** | 서버에 clone은 있으나 CI 배포 경로와 무관 |

---

## 5. 접속 / 운영 명령어 메모

### SSH 접속
```bash
ssh ubuntu@13.124.59.214   # pickme-dubright (pickme-main 브랜치 대응)
ssh ubuntu@3.36.215.20     # dubright-prod (main 브랜치 대응)
```

### 컨테이너 진입
```bash
sudo docker exec -it dubright-server bash
# 나갈 때: exit (컨테이너는 계속 실행됨)
```

### Git 확인
```bash
sudo git -C /home/www/dubright/api_dubright remote -v
sudo git -C /home/www/dubright/api_dubright config --list
# 단, 실제 운영 소스는 여기가 아니라 /home/www/dubright/ 바로 아래
```

### 컨테이너 리스트
```bash
sudo docker ps
sudo docker inspect <container> --format '{{range .Mounts}}{{.Source}}->{{.Destination}}{{println}}{{end}}'
```

---

## 6. 개선 포인트 (추후 고려)

1. **컨테이너 재시작 단계 누락**: `docker cp`만으로 반영 안 되는 변경(의존성 추가 등) 있으면 수동 재시작 필요
2. **레거시 `.git` 디렉토리 혼란**: `/home/www/dubright/api_dubright/.git`은 정리하거나 명확히 주석 달 것
3. **IAM Role 미부착**: SSM으로 원격 제어 불가. 필요 시 인스턴스 프로파일 부여
4. **단일 컨테이너 이름 `dubright-server`로 모든 환경 공유**: 배포 스크립트가 환경별 컨테이너 구분 없이 동일 이름 가정
5. **SG `0.0.0.0/0` SSH 개방**: 보안상 사무실 IP/VPN으로 제한 권장
6. **비밀번호/PAT 기반 git push(api_dubright 쪽)**: credential helper나 SSH로 통일 권장
