# tmux 상세 정리

## 1. tmux란 무엇인가

`tmux`는 terminal multiplexer다. 한국어로 풀면 "하나의 터미널 안에서 여러 개의 터미널 작업 공간을 관리하게 해주는 도구" 정도로 이해하면 된다.

겉으로는 단순히 화면을 분할하는 도구처럼 보이지만, 실제로는 다음을 가능하게 해준다.

- 하나의 SSH 접속 안에서 여러 작업을 동시에 유지
- 네트워크가 끊겨도 작업 세션 유지
- 여러 개의 shell, 로그, 서버, 에디터를 하나의 작업 공간으로 묶어서 관리
- 장시간 실행 작업을 터미널 종료와 분리
- 나중에 같은 세션에 다시 붙어서 이어서 작업

즉, `tmux`의 핵심 가치는 "터미널 작업을 일회성 창이 아니라 지속 가능한 작업 공간으로 만든다"는 데 있다.

---

## 2. 왜 쓰는가

`tmux`를 쓰는 이유는 단순하다. 일반 터미널은 현재 창과 현재 프로세스에 강하게 묶여 있다. 창을 닫거나 SSH가 끊기면 작업 맥락이 쉽게 날아간다.

`tmux`를 쓰면 다음이 좋아진다.

### 2.1 SSH 환경에서 강력하다

원격 서버에 붙어서 작업할 때 가장 빛난다.

- 서버에 SSH 접속
- `tmux` 세션 시작
- 작업 실행
- 로컬 네트워크가 잠깐 끊김
- 다시 SSH 접속
- `tmux attach`로 기존 작업 복구

이 흐름이 가능하다.

### 2.2 여러 작업을 동시에 다루기 좋다

예를 들어 백엔드 작업 중 아래를 동시에 보고 싶을 수 있다.

- 왼쪽: `nvim`
- 오른쪽 위: `npm run dev`
- 오른쪽 아래: `tail -f app.log`

이런 식으로 작업을 나눠서 볼 수 있다.

### 2.3 장시간 프로세스 관리에 좋다

다음을 띄워둘 때 유용하다.

- 테스트
- 배치 작업
- 로그 모니터링
- 서버 프로세스
- 데이터 마이그레이션
- 학습/추론 스크립트

### 2.4 작업 단위를 세션으로 분리할 수 있다

예를 들어 다음처럼 관리할 수 있다.

- `project-api`
- `project-admin`
- `infra`
- `scratch`

각 세션은 서로 독립적이다.

---

## 3. tmux의 핵심 개념

`tmux`를 제대로 이해하려면 네 가지를 먼저 구분해야 한다.

### 3.1 Server

`tmux`는 내부적으로 서버-클라이언트 구조로 동작한다.

- tmux server: 실제 세션 상태를 보관
- tmux client: 네가 붙어서 보는 화면

중요한 점은 세션이 네 현재 터미널 창에만 붙어 있는 것이 아니라, `tmux server`에 보관된다는 점이다.

그래서 detach 후 attach가 가능하다.

### 3.2 Session

가장 큰 작업 단위다.

하나의 프로젝트 작업 공간이라고 생각하면 된다.

예:

- `tmux new -s api`
- `tmux new -s admin`

이렇게 세션 이름을 따로 둘 수 있다.

세션 안에는 여러 개의 window를 둘 수 있다.

### 3.3 Window

브라우저 탭 같은 개념이다.

한 세션 안에 여러 window가 있고, 각 window는 하나 이상의 pane을 가진다.

예:

- window 1: editor
- window 2: logs
- window 3: tests

### 3.4 Pane

실제 화면 분할 단위다.

세로 분할, 가로 분할해서 여러 shell을 동시에 볼 수 있다.

예:

- pane 1: `nvim`
- pane 2: `npm run dev`
- pane 3: `tail -f`

---

## 4. 가장 기본적인 사용 흐름

처음엔 아래 흐름만 익히면 된다.

1. 세션 생성
2. 작업 시작
3. detach
4. 나중에 attach
5. 필요하면 종료

### 4.1 새 세션 만들기

```bash
tmux new -s work
```

의미:

- `new`: 새 세션 생성
- `-s work`: 세션 이름을 `work`로 지정

### 4.2 세션 목록 보기

```bash
tmux ls
```

예시 출력:

```text
work: 1 windows (created Fri Apr 11 12:00:00 2026)
api: 3 windows (created Fri Apr 11 09:30:00 2026)
```

### 4.3 기존 세션에 다시 붙기

```bash
tmux attach -t work
```

### 4.4 세션에서 빠져나오기

detach는 종료가 아니다. 화면에서만 빠져나오는 것이다.

기본 키:

```text
Ctrl-b d
```

여기서 `Ctrl-b`는 tmux의 기본 prefix 키다.

### 4.5 세션 종료

세션 안의 모든 window/pane을 종료하면 자동으로 세션도 끝난다.

명시적으로 종료하려면:

```bash
tmux kill-session -t work
```

모든 세션 종료:

```bash
tmux kill-server
```

이 명령은 정말 모든 tmux 세션을 종료하므로 주의해야 한다.

---

## 5. Prefix 키 이해하기

tmux는 대부분의 명령을 prefix 키 다음에 받는다.

기본 prefix:

```text
Ctrl-b
```

즉 `Ctrl-b`를 누르고 손을 뗀 다음, 다음 키를 누르면 tmux 명령이 실행된다.

예:

- `Ctrl-b d`: detach
- `Ctrl-b c`: 새 window
- `Ctrl-b %`: 세로 분할
- `Ctrl-b "`: 가로 분할

이 구조에 익숙해지는 것이 중요하다.

---

## 6. Window 다루기

### 6.1 새 window 만들기

기본 키:

```text
Ctrl-b c
```

명령어:

```bash
tmux new-window
```

### 6.2 다음/이전 window 이동

기본 키:

```text
Ctrl-b n
Ctrl-b p
```

의미:

- `n`: next
- `p`: previous

### 6.3 번호로 이동

기본 키:

```text
Ctrl-b 0
Ctrl-b 1
Ctrl-b 2
```

### 6.4 이름 바꾸기

현재 window 이름 바꾸기:

```text
Ctrl-b ,
```

또는:

```bash
tmux rename-window editor
```

### 6.5 window 닫기

pane 안에서 shell을 종료하면 된다.

예:

```bash
exit
```

혹은 해당 pane/window의 프로세스를 종료하면 된다.

---

## 7. Pane 다루기

실전에서 가장 많이 쓰는 기능이다.

### 7.1 세로 분할

기본 키:

```text
Ctrl-b %
```

화면을 좌우로 나눈다.

### 7.2 가로 분할

기본 키:

```text
Ctrl-b "
```

화면을 위아래로 나눈다.

### 7.3 pane 이동

기본 키:

```text
Ctrl-b 방향키
```

예:

- `Ctrl-b` 다음 `←`
- `Ctrl-b` 다음 `→`

### 7.4 pane 크기 조절

기본 키:

```text
Ctrl-b Ctrl-방향키
```

환경에 따라 `Alt` 조합이나 설정 변경을 쓰는 경우도 많다.

명령 모드로는 다음처럼 가능하다.

```bash
tmux resize-pane -L 10
tmux resize-pane -R 10
tmux resize-pane -U 5
tmux resize-pane -D 5
```

### 7.5 pane 닫기

pane 안에서 `exit` 하면 해당 pane이 닫힌다.

강제로 죽이려면:

```bash
tmux kill-pane
```

### 7.6 pane 번호 보기

```text
Ctrl-b q
```

잠깐 각 pane에 번호가 표시된다.

---

## 8. Session 다루기

세션을 잘 쓰면 프로젝트 관리가 쉬워진다.

### 8.1 새 세션 생성

```bash
tmux new -s project
```

### 8.2 백그라운드로 세션 만들기

처음부터 현재 화면에 붙지 않고 만들고 싶다면:

```bash
tmux new -d -s project
```

`-d`는 detached 상태로 시작한다.

### 8.3 특정 세션 붙기

```bash
tmux attach -t project
```

### 8.4 마지막 세션 다시 붙기

```bash
tmux attach
```

세션이 하나뿐이라면 간단히 이걸 써도 된다.

### 8.5 세션 이름 바꾸기

```bash
tmux rename-session -t old new
```

### 8.6 세션 종료

```bash
tmux kill-session -t project
```

---

## 9. tmux를 실무에서 어떻게 쓰는가

아래는 자주 쓰는 패턴들이다.

### 9.1 백엔드 개발

window/pane 예시:

- pane 1: `nvim`
- pane 2: `pnpm dev`
- pane 3: `tail -f logs/app.log`
- pane 4: `psql` 또는 `mysql`

### 9.2 프론트엔드 개발

- window 1: 에디터
- window 2: Vite/Next dev server
- window 3: test watcher
- window 4: git 작업

### 9.3 인프라/운영

- window 1: SSH 메인 세션
- window 2: 로그 모니터링
- window 3: `htop`
- window 4: 배포 스크립트

### 9.4 데이터 작업

- pane 1: 쿼리 실행
- pane 2: 로그/진행 상황 확인
- pane 3: 스크립트 수정

---

## 10. 복사, 스크롤, Copy Mode

초보자가 가장 자주 막히는 부분 중 하나다.

일반 터미널처럼 그냥 마우스 스크롤이 기대대로 안 될 수 있다.

### 10.1 Copy Mode 진입

기본 키:

```text
Ctrl-b [
```

이 상태에서 화면 위로 올라가며 과거 출력 내용을 볼 수 있다.

### 10.2 이동

Copy Mode에서 다음 키를 쓴다.

- 방향키
- `PageUp`
- `PageDown`
- `g`: 맨 위
- `G`: 맨 아래
- `/`: 검색

### 10.3 복사

기본 key binding은 버전에 따라 다를 수 있지만 보통 아래 흐름으로 이해하면 된다.

1. Copy Mode 진입
2. 커서 이동
3. 선택 시작
4. 선택 완료 후 복사

vim 스타일 설정을 많이 쓰면 더 편해진다. 아래 설정 예시에서 다시 다룬다.

---

## 11. 마우스 지원

tmux는 마우스도 지원한다.

설정:

```tmux
set -g mouse on
```

이걸 켜면 보통 다음이 가능해진다.

- pane 선택
- pane 크기 조절
- 스크롤
- window 클릭 이동

다만 마우스가 켜지면 복사/스크롤 동작이 기대와 다를 수 있으니, 처음엔 켜보고 불편하면 조정하는 식이 좋다.

---

## 12. 설정 파일: `~/.tmux.conf`

tmux는 설정 파일로 매우 많이 바꿀 수 있다.

기본 위치:

```bash
~/.tmux.conf
```

설정 반영:

```bash
tmux source-file ~/.tmux.conf
```

또는 새 세션을 열어도 된다.

---

## 13. 추천 기본 설정 예시

아래는 입문자가 쓰기 무난한 예시다.

```tmux
# prefix를 Ctrl-a로 변경 (선택)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# 마우스 사용
set -g mouse on

# 창 번호 1부터 시작
set -g base-index 1
setw -g pane-base-index 1

# window 자동 번호 재정렬
set -g renumber-windows on

# 분할 후 현재 경로 유지
bind '"' split-window -v -c '#{pane_current_path}'
bind % split-window -h -c '#{pane_current_path}'

# vim 스타일 pane 이동
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# vim 스타일 copy mode
setw -g mode-keys vi

# 상태바 색상 예시
set -g status-style fg=white,bg=black
set -g status-left-length 40
set -g status-right-length 80
set -g status-left '#S '
set -g status-right '#(whoami) | %Y-%m-%d %H:%M'
```

### 이 설정이 하는 일

- prefix를 `Ctrl-b`에서 `Ctrl-a`로 변경
- split 시 현재 경로를 유지
- 마우스를 활성화
- vi 스타일 키 사용
- 상태바를 단순하게 정리

---

## 14. 설치 방법

### 14.1 macOS

Homebrew:

```bash
brew install tmux
```

### 14.2 Ubuntu / Debian

```bash
sudo apt update
sudo apt install tmux
```

### 14.3 CentOS / RHEL / Rocky

```bash
sudo dnf install tmux
```

또는:

```bash
sudo yum install tmux
```

### 14.4 버전 확인

```bash
tmux -V
```

---

## 15. 자주 쓰는 명령 모음

### 15.1 세션

```bash
tmux new -s work
tmux new -d -s work
tmux ls
tmux attach -t work
tmux kill-session -t work
tmux kill-server
```

### 15.2 window

```bash
tmux new-window
tmux rename-window editor
tmux select-window -t 1
```

### 15.3 pane

```bash
tmux split-window -h
tmux split-window -v
tmux resize-pane -L 10
tmux resize-pane -R 10
tmux kill-pane
```

---

## 16. 실전 예시

### 16.1 "하나의 프로젝트 세션" 만들기

예를 들어 API 프로젝트용 세션을 만든다고 하자.

```bash
cd ~/project/api
tmux new -s api
```

이제 다음처럼 구성할 수 있다.

- window 1: editor
- window 2: server
- window 3: logs
- window 4: git

window 1에서 pane을 나눠도 된다.

예:

- 왼쪽: `nvim`
- 오른쪽: shell

### 16.2 서버 로그와 앱을 함께 보기

pane 1:

```bash
pnpm dev
```

pane 2:

```bash
tail -f logs/app.log
```

이렇게 두면 코드를 수정하면서 로그를 바로 볼 수 있다.

### 16.3 SSH 서버 작업

원격 서버 접속 후:

```bash
ssh user@server
tmux new -s prod
```

이후 작업하다가 로컬 네트워크가 끊겨도:

```bash
ssh user@server
tmux attach -t prod
```

하면 이어서 가능하다.

---

## 17. tmux를 처음 배울 때 추천하는 학습 순서

처음부터 모든 키를 외우려 하면 오래 못 간다.

### 1단계

아래만 익힌다.

- `tmux new -s 이름`
- `tmux ls`
- `tmux attach -t 이름`
- `Ctrl-b d`

### 2단계

아래 추가:

- `Ctrl-b c`
- `Ctrl-b n`
- `Ctrl-b p`
- `Ctrl-b %`
- `Ctrl-b "`

### 3단계

아래 추가:

- `Ctrl-b 방향키`
- `Ctrl-b [`
- `~/.tmux.conf`

이 정도만 익혀도 이미 일반 터미널보다 훨씬 강력해진다.

---

## 18. 자주 생기는 문제

### 18.1 "prefix가 안 먹는다"

가능한 원인:

- `Ctrl-b`를 동시에 누르고 바로 다른 키를 쳤음
- 터미널/OS 단축키 충돌
- prefix를 설정 파일에서 바꿨음

확인:

```bash
tmux show-options -g prefix
```

### 18.2 "마우스 스크롤이 이상하다"

원인:

- tmux mouse 설정
- 터미널 자체 scrollback과 tmux copy mode가 섞임

해결 방향:

- `set -g mouse on` / off 비교
- `Ctrl-b [`로 copy mode 사용 습관 들이기

### 18.3 "SSH 끊겼는데 세션이 없어졌다"

가능한 원인:

- tmux 세션을 안 만들고 그냥 shell만 쓴 경우
- 세션을 만들었지만 종료해버린 경우
- 서버 재부팅

### 18.4 "중첩 tmux가 헷갈린다"

예:

- 로컬에서도 tmux 사용
- 원격 서버에서도 tmux 사용

이 경우 prefix가 겹쳐서 헷갈릴 수 있다.

보통 해결 방식:

- 로컬과 원격 prefix를 다르게 설정
- 중첩 시엔 prefix를 두 번 의식해서 누르기

### 18.5 "색상이 이상하다"

터미널과 `TERM` 설정 문제일 수 있다.

확인:

```bash
echo $TERM
tmux info | rg terminal
```

보통 최신 터미널이면 기본값으로도 충분하지만, 컬러 문제가 있으면 truecolor 관련 설정을 추가로 건드리기도 한다.

---

## 19. tmux를 잘 쓰는 사람들의 습관

### 19.1 세션 이름을 명확하게 짓는다

좋은 예:

- `api`
- `admin`
- `infra`
- `docs`

나쁜 예:

- `test1`
- `aaa`

### 19.2 split을 남발하지 않는다

pane이 너무 많으면 오히려 가독성이 떨어진다.

보통은:

- 한 window당 2~3 pane
- window를 여러 개

이쪽이 더 낫다.

### 19.3 작업 종류별로 window를 분리한다

예:

- `editor`
- `server`
- `logs`
- `git`

### 19.4 설정을 조금씩 다듬는다

처음부터 화려한 설정을 많이 넣지 말고:

1. prefix
2. split current path
3. mouse
4. vi mode

이 정도부터 시작하는 게 좋다.

---

## 20. tmux와 비슷한 도구

### 20.1 screen

tmux 이전부터 있던 유사 도구다.

장점:

- 오래됨
- 기본 서버에 종종 이미 설치됨

단점:

- tmux보다 UX가 덜 현대적

### 20.2 zellij

최근 인기 있는 대안이다.

장점:

- UI가 친절함
- 기본 경험이 꽤 좋음

단점:

- tmux만큼 자료/관성이 쌓여 있지는 않음
- 서버/운영 환경에서 tmux만큼 널리 깔려 있진 않음

실무/SSH 관점에서는 아직 tmux가 가장 범용적이라고 보는 경우가 많다.

---

## 21. 추천 입문 루틴

아래처럼 3일만 반복해도 감이 빨리 온다.

### Day 1

- `tmux new -s practice`
- window 2개 만들기
- pane 2개 만들기
- detach / attach 해보기

### Day 2

- `~/.tmux.conf` 만들기
- mouse 켜기
- split current path 유지 설정 넣기

### Day 3

- 실제 프로젝트 하나를 tmux 세션으로 운영
- `editor`, `server`, `logs` window 구성

---

## 22. 최소 치트시트

### 시작

```bash
tmux new -s work
tmux attach -t work
tmux ls
```

### 종료

```bash
tmux kill-session -t work
tmux kill-server
```

### 자주 쓰는 키

```text
Ctrl-b d   detach
Ctrl-b c   새 window
Ctrl-b n   다음 window
Ctrl-b p   이전 window
Ctrl-b %   세로 분할
Ctrl-b "   가로 분할
Ctrl-b q   pane 번호 보기
Ctrl-b [   copy mode
Ctrl-b 방향키  pane 이동
```

---

## 23. 한 문장으로 다시 요약

`tmux`는 "터미널을 일회성 창이 아니라, 복구 가능하고 분할 가능하며 장시간 유지되는 작업 공간으로 바꿔주는 도구"다.

SSH, 개발 서버, 로그, 장시간 작업을 많이 다룬다면 거의 필수에 가깝다.

---

## 24. 다음에 보면 좋은 주제

tmux를 더 깊게 쓰려면 다음을 이어서 보면 된다.

- `~/.tmux.conf` 실전 튜닝
- tmux + vim 조합
- tmux copy mode를 macOS clipboard와 연결
- tmuxinator / teamocil 같은 세션 자동화 도구
- tmux popup, hooks, statusline 커스터마이징

