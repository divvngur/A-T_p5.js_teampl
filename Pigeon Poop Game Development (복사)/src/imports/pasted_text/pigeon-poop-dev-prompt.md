# 🐦 "입벌려! 비둘기 똥 들어간다~" — 전체 개발 프롬프트

**기술 스택 요약**
- 렌더링/게임 루프: p5.js
- 얼굴 인식: ml5.js (FaceMesh)
- 백엔드/인증/DB: Firebase (Authentication + Firestore)
- 기타: HTML/CSS (UI 레이어), Vanilla JS (화면 전환 라우터)

---

## 0. 공통 아키텍처 지침

프로젝트 구조를 아래와 같이 구성하라.

```
index.html              ← 단일 진입점, 모든 화면을 div로 관리
src/
  main.js               ← 화면 라우터 (showScreen(id) 함수)
  firebase.js           ← Firebase 초기화 및 Auth/Firestore 헬퍼
  screens/
    MainScreen.js
    LoginScreen.js
    LoadingScreen.js
    CameraSetupScreen.js
    StageSelectScreen.js
    GameScreen.js         ← p5.js 인스턴스 모드로 실행
    LeaderboardScreen.js
  game/
    Pigeon.js             ← 비둘기 클래스 (일반/미니보스/보스)
    Projectile.js         ← 알/똥/특수 투사체 클래스
    FaceController.js     ← ml5 FaceMesh 래퍼
    StageConfig.js        ← 스테이지별 파라미터 정의
    BossConfig.js         ← 보스별 스킬 정의
  assets/
    sprites/              ← 비둘기, 알, 똥, 보스 스프라이트
    sounds/               ← 효과음
```

모든 p5.js 코드는 인스턴스 모드(new p5(sketch, container))로 작성하여
전역 변수 오염을 방지하라. 화면 전환 시 p5 인스턴스를 remove()하고 새 인스턴스를 생성하라.

---

## 1. 메인 화면 (MainScreen)

**담당: 디자인**

p5.js를 사용하지 않고 HTML/CSS로 구현하라.

레이아웃:
- 배경: 하늘+도시 실루엣 일러스트 (또는 CSS 그라디언트로 대체 가능)
- 상단 우측: "로그인" 버튼 (로그인 상태면 유저 아바타+이름으로 교체)
- 상단 좌측: 게임 로고 ("입벌려! 비둘기 똥 들어간다~") — 손글씨 느낌 폰트
- 화면 중앙 하단: "스테이지 모드" 버튼, "경쟁 모드" 버튼 (나란히 배치)
- 하단 중앙: "순위표" 버튼

비로그인 경고 모달:
- 로그인 없이 모드 버튼 클릭 시 모달 표시
- 문구: "로그인하지 않으면 게임 기록이 저장되지 않으며 순위표에 표시되지 않습니다."
- [메인으로 돌아가기] 버튼, [그냥 진행하기] 버튼 두 개 제공

구현 요구사항:
- Firebase Auth의 onAuthStateChanged로 로그인 상태를 실시간 감지하라.
- 버튼에 hover 애니메이션(scale, shadow)을 CSS transition으로 적용하라.
- 모달은 backdrop-filter: blur()로 배경을 흐리게 처리하라.

---

## 2. 로그인 화면 (LoginScreen)

**담당: 디자인**

HTML/CSS + Firebase Authentication으로 구현하라.

UI 구성:
- 카드 형태의 로그인 패널 (중앙 정렬)
- 입력 필드 1: 성(Last Name) 입력
- 입력 필드 2: 이름(First Name) 입력 → 합쳐서 Firestore에 displayName으로 저장
- [Google로 로그인] 버튼 (공식 Google 브랜드 가이드라인 준수)
- 하단: [뒤로가기] 버튼

Firebase 로직:
- signInWithPopup(provider) 사용
- 로그인 성공 시:
  firestore.collection('users').doc(uid).set({ displayName, createdAt }, { merge: true })
- 로그인 완료 후 메인 화면으로 자동 이동

유효성 검사:
- 이름 필드가 비어있으면 [Google로 로그인] 버튼 비활성화
- 이름에 특수문자 포함 시 경고 메시지 표시

---

## 3. 로딩 화면 (LoadingScreen)

**담당: 디자인 + 개발 보조**

p5.js 인스턴스로 구현하라.

애니메이션 구성:
- 배경: 하늘색 그라디언트
- 비둘기 스프라이트가 왼쪽에서 오른쪽으로 뚜벅뚜벅 걷는다.
  - 걷기 애니메이션: 스프라이트 시트에서 프레임 순환 (frameCount 기반)
  - 비둘기 X 위치 = (loadProgress / 100) * width
- 하단 로딩 바: 배경 바(회색) 위에 채워지는 바(주황색), "Loading... XX%" 텍스트
- 랜덤 팁 문구:
    "비둘기는 하루에 최대 50번 배변합니다 🐦"
    "알을 받으면 점수가 올라가요! 입을 크게 벌리세요! 👄"
    "똥을 맞으면 하트가 줄어요! 잘 피하세요 💩"

로딩 로직:
- 로딩 대상: ml5 FaceMesh 모델, 게임 에셋(이미지/사운드)
- 각 에셋 로드 완료마다 loadProgress 갱신 (0→100)
- 100% 도달 시 카메라 설정 화면으로 이동. 최소 표시 시간: 2초

---

## 4. 초기 화면 — 카메라 설정 (CameraSetupScreen)

**담당: 개발(ml5.js)**

p5.js + ml5.js FaceMesh로 구현하라.

화면 구성:
- 웹캠 피드를 p5.js canvas에 미러(좌우반전) 출력
- 상반신 가이드 박스를 canvas 중앙에 오버레이:
  - 가로: canvas width * 0.4 / 세로: canvas height * 0.65
  - 기본: 흰색 점선 / 얼굴 감지 성공: 초록색 실선으로 전환
- 안내 문구: "카메라 안에 상반신을 맞춰주세요"
- 감지 성공 시: "완벽해요! 게임을 시작합니다 👍" + 카운트다운 (3→2→1→시작)

감지 로직:
  ml5.faceMesh(video, { maxFaces: 1 }, modelReady) 초기화
  매 프레임 faceMesh.detect() → bounding box 중심이 가이드 박스 내에 있는지 확인
  박스 내 → 카운트다운 시작. 박스 이탈 → 카운트다운 리셋

주의사항:
- createCapture(VIDEO)로 비디오 생성 후 hide() 처리
- FaceMesh 객체를 GameScreen에 전달하여 재로딩 방지 (전역 또는 싱글톤 패턴)
- 카메라 권한 거부 시 경고 + 재시도 버튼 표시

---

## 5. 스테이지 선택 화면 (StageSelectScreen)

**담당: 디자인**

HTML/CSS로 구현하라.

UI 구성:
- 제목: "스테이지 선택"
- 스테이지 카드 그리드 (3열 x 2~3행, 총 6~8개):
  - 각 카드: 스테이지 번호, 난이도 별점(★), 목표 알 개수, 잠금 여부
  - 잠긴 스테이지: 자물쇠 아이콘 + 반투명 처리
  - 클리어한 스테이지: 체크 뱃지 (Firebase 클리어 기록 조회)
- 하단: [뒤로가기] 버튼

스테이지 데이터 (StageConfig.js 정의):

| 스테이지 | 목표 알 | 비둘기 수 | 낙하 속도 | 똥 비율 | 특이사항 |
|---------|--------|---------|---------|--------|---------|
| 1 | 5개 | 2마리 | 2 | 20% | 없음 |
| 2 | 8개 | 3마리 | 2.5 | 25% | 없음 |
| 3 | 10개 | 3마리 | 3 | 30% | 없음 |
| 4 | 12개 | 4마리 | 3.5 | 35% | 없음 |
| 5 | 15개 | 5마리 | 4 | 40% | 없음 |
| 6 | 20개 | 6마리 | 5 | 45% | 미니보스 등장 |
| 7 | 25개 | 7마리 | 5.5 | 50% | 보스 등장 |
| 8 | 30개 | 8마리 | 6 | 55% | 보스 2마리 |

스테이지 선택 시:
- 모달: "스테이지 모드는 순위표에 기록되지 않습니다. 계속하시겠습니까?"
- [취소] / [시작하기] → 로딩 → 카메라 설정 → 게임(스테이지 모드)

---

## 6. 게임 화면 공통 (GameScreen — p5.js 핵심)

**담당: 개발(게임 로직) + 개발(ml5.js)**

모든 게임 로직은 p5.js 인스턴스 모드로 구현하라.
HTML UI(버튼 등)는 canvas 위에 position: absolute로 오버레이하라.

### 캔버스 설정
- createCanvas(windowWidth, windowHeight)
- 웹캠 피드를 배경으로 매 프레임 렌더링 (미러 반전 유지)
- 게임 오브젝트는 웹캠 피드 위에 오버레이

### HUD (항상 표시)
- 상단 좌측: 하트 아이콘 × 3 (남은 생명)
- 상단 중앙: 현재 점수 / 목표 (스테이지) 또는 경과 시간 (경쟁)
- 상단 우측: [일시정지 ⏸] 버튼, [종료 ✕] 버튼 (HTML 버튼 오버레이)

### 비둘기 클래스 (Pigeon.js)
속성: x, y, vx, vy, type('normal'|'miniboss'|'boss'), sprite, health, dropTimer
행동:
  - 화면 좌우 경계에서 반사하며 수평 비행
  - 수직 위치: 화면 상단 20~50% 범위 내 랜덤 배정
  - dropTimer: 일정 간격마다 Projectile 생성
  - 스프라이트 애니메이션: 날개짓 프레임 순환 (frameCount 기반)

낙하 오브젝트 생성 규칙:
  - 확률에 따라 알(egg) 또는 똥(poop) 생성
  - 똥 비율은 StageConfig 또는 경쟁 모드 경과 시간에 따라 동적 증가
  - 생성 위치: 비둘기 현재 (x, y)

### 투사체 클래스 (Projectile.js)
공통 속성: x, y, vx, vy, type, radius, active

type별 동작:
  'egg'        : 직선 낙하. 흰색 타원 스프라이트. 입에 충돌 시 점수+1, 소멸
  'poop'       : 약간 좌우 흔들림 낙하. 갈색 방울 스프라이트. 얼굴에 닿으면 생명-1
  'laser'      : 수평/대각선 고속 직선 이동. 보스 전용
  'curve'      : sin 곡선으로 이동: vx = sin(frameCount * 0.1) * amplitude. 미니보스 전용
  'giant_poop' : 반지름 3배, 낙하 속도 1.5배. 보스 전용

### FaceController.js (ml5 FaceMesh 래퍼)
초기화: 로딩 화면에서 생성한 faceMesh 객체를 재사용 (싱글톤)

매 프레임 update():
  1. faceMesh.detect() 결과에서 468개 랜드마크 추출
  2. 입 벌림 감지:
     - 상순 중심점(index 13)과 하순 중심점(index 14) 사이 거리 계산
     - 거리 > threshold (15~20px, 카메라 해상도 정규화 필요) → mouthOpen = true
  3. 입 위치 계산 (mouthCenter):
     x = (landmark[13].x + landmark[14].x) / 2 * scaleX
     y = (landmark[13].y + landmark[14].y) / 2 * scaleY
     (scaleX, scaleY: 비디오 해상도 → canvas 해상도 변환 비율)
  4. 디버그 모드: 랜드마크를 canvas에 점으로 시각화 (개발 중 활성화)

### 충돌 감지 (기술적 어려움 #1 해결)

알 충돌 (득점):
  checkEggCollision(egg, faceController):
    if (!faceController.mouthOpen) return false
    dx = egg.x - faceController.mouthCenter.x
    dy = egg.y - faceController.mouthCenter.y
    distance = sqrt(dx*dx + dy*dy)
    // 입 반지름: 40~60px로 넉넉하게 설정
    return distance < (egg.radius + faceController.mouthRadius)

똥 충돌 (피격):
  - mouthCenter 근방 반지름 80px 이내 도달 → 생명 -1
  - 얼굴 전체 bounding box 사용 가능 (더 자연스러운 피격 판정)
  - 피격 시 0.5초간 무적 + 화면 빨간 플래시 효과

### 환경 독립성 (기술적 어려움 #2 해결)
- 모든 속도/크기 값에 deltaTime 적용:
    vx = baseVx * (deltaTime / 16.67)  // 60fps 기준 정규화
- 오브젝트 위치는 절대 픽셀 대신 width/height 비율로 계산
- FaceMesh 랜드마크 좌표를 canvas 크기에 맞게 scaleX/scaleY로 정규화
- 카메라 해상도 640x480으로 고정 후 canvas에 맞게 stretch 처리
- 모바일/데스크탑 모두 windowResized() 핸들러로 canvas 리사이즈 대응

### 일시정지
- isPaused 변수로 draw() 내 모든 업데이트 로직 스킵
- 일시정지 중: 반투명 오버레이 + "PAUSED" 텍스트 + [재개] [종료] 버튼

---

## 7. 게임 화면 — 스테이지 모드

**담당: 개발(게임 로직)**

GameScreen.js에 mode = 'stage' 분기로 구현하라.

진행 로직:
  selectedStage의 StageConfig 파라미터 로드
  → 비둘기 n마리 생성
  → 플레이어가 목표 알 개수를 채우면 스테이지 클리어
  → 생명이 0이 되면 스테이지 실패

클리어 연출:
  - "STAGE CLEAR! 🎉" 텍스트 + 별 파티클 효과
  - 다음 스테이지 버튼 또는 메인 화면 버튼 표시
  - Firebase에 클리어 기록 저장 (로그인 시):
    firestore.collection('stageClear').doc(uid).set({ stage_N: true }, { merge: true })

난이도 점진적 증가 요소:
  - 비둘기 이동 속도: 스테이지마다 +0.3
  - 낙하 간격: 스테이지마다 -100ms
  - 똥 비율: 스테이지마다 +5%
  - 스테이지 6~8: 미니보스/보스 비둘기 추가 등장

---

## 8. 게임 화면 — 경쟁 모드

**담당: 개발(Firebase + 경쟁 모드)**

GameScreen.js에 mode = 'competitive' 분기로 구현하라.

진행 로직:
  - 생명 3개로 시작, 모두 소진 시 게임 오버
  - 경과 시간(survivalTime)을 ms 단위로 기록
  - 점수(score): 알 획득마다 +1, 보스 처치마다 +10

시간별 이벤트 스케줄 (BossConfig.js에 정의):
  0~60초   : 일반 비둘기 3~4마리. 똥 비율 25%
  60~120초 : 비둘기 5마리. 똥 비율 35%. 속도 증가
  120초    : 미니보스 등장 (아래 스킬 참조)
  180~240초: 비둘기 6마리 + 미니보스 주기적 재등장
  300초    : 보스 등장 (아래 스킬 참조)
  300초 이후: 보스 + 일반 비둘기 동시 진행. 매 60초마다 난이도 상승

보스별 특수 스킬 (BossConfig.js):

[미니보스 — "뚱보 비둘기"]
  HP: 5
  스킬 1. 커브 똥: sin 곡선 궤적으로 날아오는 투사체 3발 동시 발사
  스킬 2. 산탄 똥: 부채꼴 5방향으로 일반 똥 동시 발사
  스킬 발동: HP 감소마다 1회 (단, 미니보스는 현재 버전에서 무적 — 스테이지 6 이후 HP 개념 도입 예정)

[보스 — "보스 비둘기 킹"]
  HP: 15. 체력 바 HUD에 표시
  스킬 1. 레이저: 수평 방향으로 레이저 투사체 발사. 1초간 지속. 회피 불가 판정 구역 표시
  스킬 2. 거대 똥: radius * 3 크기의 거대 투사체 낙하. 낙하 전 경고 원 표시 (1.5초)
  스킬 3. 똥 소나기: 화면 전체에 무작위로 똥 10발 일제히 낙하
  스킬 순환: 스킬 1 → 2 → 3 → 1 → ... (각 스킬 후 3초 대기)
  처치 보상: 점수 +10, 폭발 파티클, 일시적 무적(2초)

게임 오버 처리:
  - "GAME OVER" 화면 표시: 생존 시간, 최종 점수, 획득 알 개수
  - 로그인 상태 시 Firestore에 기록:
    firestore.collection('leaderboard').add({
      uid, displayName, survivalTime, score, timestamp
    })
  - [다시 하기] [메인으로] [순위표 보기] 버튼 제공

---

## 9. 순위표 화면 (LeaderboardScreen)

**담당: 디자인 + 개발(Firebase)**

HTML/CSS + Firestore로 구현하라.

데이터 조회:
  firestore.collection('leaderboard')
    .orderBy('survivalTime', 'desc')
    .get()

UI 구성:

[상위 1~3위 — 포디엄 섹션]
  - 1위: 가장 큰 카드 (중앙, 금색 테두리, 왕관 아이콘)
  - 2위: 중간 크기 카드 (좌측, 은색 테두리)
  - 3위: 작은 카드 (우측, 동색 테두리)
  - 각 카드: 순위 뱃지, 이름, 생존 시간(분:초), 점수

[4위 이하 — 리스트 섹션]
  - 같은 크기의 행(row)으로 표시
  - 각 행: 순위번호, 이름, 생존 시간, 점수
  - 내 기록 행은 하이라이트 처리 (배경색 강조)
  - 스크롤 가능한 컨테이너 (max-height: 60vh, overflow-y: scroll)

하단: [새로고침] 버튼, [메인으로] 버튼

---

## 10. 기술적 어려움 해결 가이드

### 어려움 1: 얼굴과 알 사이의 충돌 인식

문제: FaceMesh 좌표계와 p5.js canvas 좌표계가 다름.
      비디오 해상도(예: 640x480)와 canvas 크기(예: 1920x1080)가 다름.

해결:
  1. scaleX = canvasWidth / videoWidth
     scaleY = canvasHeight / videoHeight
  2. 랜드마크 좌표 변환: mappedX = landmark.x * scaleX
  3. 미러 반전 적용: mappedX = canvasWidth - mappedX
  4. 충돌 판정은 변환된 좌표 기준으로 수행
  5. 입 반지름(mouthRadius)을 50~80px로 넉넉하게 설정하여 사용성 확보
  6. 개발 중 디버그 모드로 랜드마크 시각화하여 오프셋 확인

보조 방법: 알이 화면 하단(플레이어 얼굴 위치)에 도달할 때만 충돌 판정하여
           성능 최적화 및 오검출 방지.

### 어려움 2: 환경 독립적 실행

문제: 기기별 프레임레이트, 해상도, 카메라 해상도가 달라 게임 속도가 달라짐.

해결:
  1. deltaTime 기반 물리 업데이트:
       p5.js의 deltaTime 변수(ms 단위)를 모든 이동 계산에 곱하라.
       예: obj.y += obj.speed * (deltaTime / 16.67)
  2. 캔버스 비율 기반 좌표:
       절대 픽셀 대신 width/height 비율로 초기 위치/크기 설정
  3. 카메라 해상도 고정:
       constraints = { video: { width: 640, height: 480 } }
  4. 반응형 처리:
       windowResized() 함수에서 resizeCanvas() 호출 후 오브젝트 위치 재계산
  5. 프레임레이트 보정:
       frameRate(60) 명시적 설정. 60fps 미만 환경에서도 deltaTime으로 보정

---

## 11. 외부 라이브러리 CDN 로드 순서 (index.html)

```html
<!-- 1. p5.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>

<!-- 2. ml5.js (p5.js 이후 로드) -->
<script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>

<!-- 3. Firebase -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
</script>

<!-- 4. 게임 소스 -->
<script src="src/firebase.js"></script>
<script src="src/game/StageConfig.js"></script>
<script src="src/game/BossConfig.js"></script>
<script src="src/game/Projectile.js"></script>
<script src="src/game/Pigeon.js"></script>
<script src="src/game/FaceController.js"></script>
<script src="src/screens/GameScreen.js"></script>
<!-- ... 나머지 screens ... -->
<script src="src/main.js"></script>
```

---

## 12. 업무 분장 체크리스트

| 구분 | 담당자 | 산출물 |
|------|--------|--------|
| 기획 | 카메라 인터랙션 구상 | FaceController 설계 문서 |
| 기획 | 스토리보드 작성 | 화면 흐름도 |
| 기획 | 컨셉 작성 | 게임 세계관/톤 가이드 |
| 개발 | 게임 로직/스테이지 모드 | GameScreen.js, StageConfig.js, Pigeon.js, Projectile.js |
| 개발 | Firebase/경쟁 모드 | firebase.js, LeaderboardScreen.js, BossConfig.js |
| 개발 | ml5.js | FaceController.js, CameraSetupScreen.js |
| 디자인 | 메인/스테이지 선택 화면 | MainScreen.js, StageSelectScreen.js |
| 디자인 | 로그인/순위 화면 | LoginScreen.js, LeaderboardScreen.js (UI) |
| 디자인 | 카메라 화면/게임 오브젝트/배경 | CameraSetupScreen.js (UI), 스프라이트 에셋 |

---

> **개발 우선순위 권장 순서**
> 1. FaceController.js 완성 (가장 난이도 높음, 병렬 작업 불가)
> 2. 게임 화면 공통 로직 (p5.js 루프, 비둘기, 투사체)
> 3. 스테이지 모드 (로직 완성 후 디자인 붙이기)
> 4. Firebase 연동 (인증 → Firestore 읽기/쓰기)
> 5. 경쟁 모드 + 보스 스킬
> 6. UI 화면들 (메인, 로그인, 순위표, 스테이지 선택)
> 7. 로딩/카메라 설정 화면 폴리싱
---

## 13. 필수 완수 사항 (채점 기준 직결)

아래 항목은 시연 시 반드시 작동해야 한다. 구현 여부를 코드 레벨에서 명시적으로 확인한다.

---

### 13-1. 전체 화면(Fullscreen) 모드 필수 구현

```javascript
// 첫 화면(IntroScreen)의 "시작하기" 버튼 클릭 시 fullscreen 진입
// 브라우저 정책상 사용자 제스처 이벤트 내에서만 fullscreen 허용
function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
}

document.getElementById('btn-start').addEventListener('click', () => {
  enterFullscreen();
  showScreen('main-screen');
});

// p5.js canvas도 fullscreen에 맞게 리사이즈
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
```

CSS에 아래를 추가하여 모든 화면이 전체화면을 꽉 채우도록 강제하라.

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
.screen { width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; }
canvas { display: block; }
```

---

### 13-2. 화면 전환 체계 — 단계별 연결 필수

main.js의 showScreen(id) 라우터가 아래 순서로 모든 화면을 순차 연결해야 한다.
각 화면은 id를 가진 div로 관리하며, 활성 화면만 display:flex, 나머지는 display:none.

전체 화면 흐름 (반드시 이 순서로 연결):

```
① IntroScreen          ← 첫 화면 (소개/사용법)
        ↓ "시작하기"
② MainScreen           ← 모드 선택
        ↓                        ↓
③ LoginScreen     ③' 비로그인 경고 모달
        ↓ 완료           ↓ "그냥 진행하기"
④ MainScreen 복귀 후 모드 선택
        ↓
⑤ LoadingScreen        ← 비둘기 걷기 로딩
        ↓
⑥ CameraSetupScreen    ← 상반신 가이드 + 감지
        ↓
⑦-A StageSelectScreen  (스테이지 모드 선택)
⑦-B GameScreen(stage)  (스테이지 게임)
⑦-C GameScreen(competitive) (경쟁 게임)
        ↓
⑧ ResultScreen         ← 결과 화면
        ↓
⑨ LeaderboardScreen    ← 순위표
        ↓ "종료"
⑩ EndingCreditScreen   ← 마지막 화면 (엔딩 크레딧)
```

showScreen() 구현 예시:

```javascript
// main.js
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'flex';
}
// 초기 진입
showScreen('intro-screen');
```

---

### 13-3. 첫 화면 (IntroScreen) — 필수 포함 항목

id="intro-screen" div에 아래 내용을 반드시 포함하라.

포함 내용:
- 게임 제목: "🐦 입벌려! 비둘기 똥 들어간다~ 🐦" (대형 타이포그래피)
- 제작자 이름 전체 목록
- 소속 / 과목명 / 제작 연도
- 간단한 사용법 4줄:
    1. 웹캠을 허용하고 카메라 앞에 앉으세요.
    2. 상반신이 화면 안에 들어오면 게임이 시작됩니다.
    3. 입을 벌려 비둘기 알을 받으세요! 🥚
    4. 비둘기 똥을 피하세요! 💩
- [🎮 시작하기] 버튼 → enterFullscreen() + showScreen('main-screen')

구현 요구사항:
- 배경에 비둘기가 날아다니는 CSS keyframe 애니메이션 적용
- 폰트: Google Fonts 한국어 손글씨 계열 (Jua / Gaegu / Do Hyeon 중 선택)

---

### 13-4. 마지막 화면 (EndingCreditScreen) — 필수 포함 항목

id="ending-screen" div에 아래 내용을 반드시 포함하라.
게임 종료 버튼 또는 순위표 "종료" 버튼 클릭 시 이 화면으로 이동.

포함 내용:
- 상단: "🏆 감사합니다! 🏆" 또는 "GAME OVER" 대형 텍스트
- 크레딧 섹션 (역할별 이름 나열):
    기획: 이름1 (카메라 인터랙션), 이름2 (스토리보드), 이름3 (컨셉)
    개발: 이름4 (게임 로직), 이름5 (Firebase), 이름6 (ml5.js)
    디자인: 이름7 (메인화면), 이름8 (로그인/순위), 이름9 (오브젝트/배경)
    Special Thanks: 비둘기 🐦 (영감의 원천)
- [다시 시작] → showScreen('main-screen')
- [처음으로] → showScreen('intro-screen')

구현 요구사항:
- 크레딧 텍스트가 아래→위로 천천히 스크롤되는 CSS animation 적용
- 배경: 밤하늘 + 별 파티클 효과

---

### 13-5. 필수 기능 구현 체크리스트 (시연 전 자가 점검)

| 번호 | 필수 기능 | 구현여부 | 담당 |
|-----|---------|--------|------|
| F-01 | IntroScreen 존재 — 제목/제작자/사용법 포함 | ☐ | 디자인 |
| F-02 | EndingCreditScreen 존재 — 크레딧 포함 | ☐ | 디자인 |
| F-03 | 첫→끝 모든 화면이 버튼으로 단계별 연결 | ☐ | 개발 |
| F-04 | Fullscreen 모드 진입 (시작하기 버튼 클릭 시) | ☐ | 개발 |
| F-05 | ml5 FaceMesh 입 벌림 감지 작동 | ☐ | 개발(ml5) |
| F-06 | 알 충돌 판정 (입 벌림 + 거리 계산) | ☐ | 개발(ml5) |
| F-07 | 똥 피격 판정 + 생명 감소 | ☐ | 개발(게임) |
| F-08 | 스테이지 모드 — 목표 알 달성 시 클리어 | ☐ | 개발(게임) |
| F-09 | 경쟁 모드 — 생존 시간 기록 + 보스 등장 | ☐ | 개발(경쟁) |
| F-10 | Firebase Google 로그인 | ☐ | 개발(Firebase) |
| F-11 | Firestore 순위표 저장 및 조회 | ☐ | 개발(Firebase) |
| F-12 | 순위표 1~3위 포디엄 + 4위 이하 스크롤 | ☐ | 디자인 |
| F-13 | 게임 중 일시정지/재개/종료 버튼 노출 | ☐ | 개발(게임) |
| F-14 | GitHub 코드 업로드 + README 작성 | ☐ | 전체 |

---

### 13-6. GitHub 제출 준비

README.md에 아래 항목을 반드시 포함하라.

```markdown
# 🐦 입벌려! 비둘기 똥 들어간다~

## 팀 구성
| 이름 | 역할 |
|------|------|
| 홍길동 | 기획 — 카메라 인터랙션 구상 |

## 실행 방법
1. 저장소 클론: git clone https://github.com/[팀]/pigeon-game.git
2. index.html을 Live Server(VSCode 확장) 또는 로컬 HTTP 서버로 열기
   주의: file:// 프로토콜로는 카메라 및 Firebase 작동 안 함
3. 브라우저에서 카메라 권한 허용
4. src/firebase.js에 Firebase 프로젝트 config 입력

## 기술 스택
- p5.js 1.9.4 / ml5.js 1.x (FaceMesh) / Firebase 10.x

## 시연 링크
https://[팀계정].github.io/pigeon-game/
```

GitHub Pages 배포:
- Repository → Settings → Pages → Source: main branch / root
- Firebase Console → Authentication → Authorized Domains에 [팀계정].github.io 추가 필수
- 배포 URL을 수업 시간 제출 링크로 사용

---

> **개발 우선순위 권장 순서**
> 1. IntroScreen + EndingScreen + showScreen() 라우터 (화면 연결 골격 먼저)
> 2. FaceController.js 완성 (가장 난이도 높음, 병렬 작업 불가)
> 3. 게임 화면 공통 로직 (p5.js 루프, 비둘기, 투사체)
> 4. 스테이지 모드 (로직 완성 후 디자인 붙이기)
> 5. Firebase 연동 (인증 → Firestore 읽기/쓰기)
> 6. 경쟁 모드 + 보스 스킬
> 7. UI 화면들 (메인, 로그인, 순위표, 스테이지 선택)
> 8. 로딩/카메라 설정 화면 폴리싱 + GitHub Pages 배포
