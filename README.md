# 입벌려! 비둘기 똥 들어간다~ 🕊️💩

웹캠 + AI 얼굴인식 기반 p5.js 미니게임입니다.  
얼굴을 움직여 비둘기 똥을 피하고 알을 입으로 받아먹는 싱글플레이와,  
두 명이 비둘기/사람 역할을 나눠 실시간으로 대결하는 멀티플레이를 지원합니다.

---

## 🌐 배포 URL

| 모드 | URL |
|------|-----|
| 메인 (싱글플레이) | https://pigeon-attack-game.web.app |
| 멀티플레이 | https://pigeon-attack-game.web.app/multiplayer |

> Firebase Hosting이 내부적으로 Cloud Run에 프록시합니다. 외부에 공유할 URL은 위 두 개만 사용하세요.

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| 렌더링 | p5.js 1.9.x |
| 얼굴 인식 | ml5.js FaceMesh |
| 누끼 | MediaPipe Selfie Segmentation |
| 멀티플레이 | Socket.IO |
| 서버 | Node.js + Express |
| 배포 | Google Cloud Run (asia-northeast3) |
| 호스팅 | Firebase Hosting → Cloud Run 프록시 |
| 인증/DB | Firebase Auth + Firestore |

---

## 📁 프로젝트 구조

```
├── index.html                  # 싱글플레이 SPA 진입점
├── server.js                   # Express + Socket.IO 서버
├── Dockerfile                  # Cloud Run 컨테이너 설정
├── cloudbuild.yaml             # Cloud Build 자동 배포 설정
├── firebase.json               # Firebase Hosting → Cloud Run 연결
├── public/
│   ├── multiplayer.html        # 멀티플레이 진입점
│   └── sketch.js               # 멀티플레이 p5.js 게임 로직
└── src/
    ├── main.js                 # 전역 상태, 화면 라우터
    ├── game/
    │   ├── HDFaceGame.js       # 싱글플레이 메인 게임 (HD 누끼 + FaceMesh)
    │   ├── StageConfig.js      # 스테이지 설정
    │   └── BossConfig.js       # 보스 패턴 설정
    ├── screens/                # 각 화면 UI (Intro, Main, Stage, Result 등)
    └── styles/
        └── global.css          # 전체 UI 스타일
```

---

## 🚀 로컬 실행

```bash
npm install
node server.js
```

브라우저에서 `http://localhost:3000` 접속.  
멀티플레이는 두 브라우저 탭(또는 다른 기기)에서 `http://localhost:3000/multiplayer` 접속.

> 카메라 권한은 `localhost` 또는 `https` 환경에서만 정상 동작합니다.

---

## ☁️ Cloud Run 배포

### 자동 배포 (Cloud Build)

```bash
gcloud builds submit --config cloudbuild.yaml . --substitutions=SHORT_SHA=latest
```

### 수동 배포

```bash
# 이미지 빌드 & 푸시
gcloud builds submit --tag gcr.io/pigeon-attack-game/pigeon-game .

# Cloud Run 배포
gcloud run deploy pigeon-game \
  --image gcr.io/pigeon-attack-game/pigeon-game \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 3000
```

### Firebase Hosting 배포 (도메인 연결)

```bash
firebase deploy --only hosting
```

`firebase.json`의 rewrite 설정으로 `pigeon-attack-game.web.app` → Cloud Run 자동 프록시.

---

## 🎮 게임 모드

### 싱글플레이
- 스테이지 선택 후 얼굴 캘리브레이션
- 비둘기가 떨어뜨리는 **알(🥚)은 입으로 받아** 점수 획득
- **똥(💩)이 얼굴에 맞으면** 목숨 감소
- 스테이지마다 보스 비둘기 등장 (빔, 교차 사선, 돌진 패턴)

### 멀티플레이
- 방 생성 후 URL 공유로 2인 접속
- **비둘기 역할**: 입을 벌려 아이템 투척
- **사람 역할**: 얼굴을 움직여 알을 받고 똥을 피함
- 알 5개 먹기 or 똥 5번 맞기로 승패 결정

---

## 🔧 환경 변수 / 설정

| 항목 | 값 |
|------|----|
| GCP 프로젝트 ID | `pigeon-attack-game` |
| Cloud Run 서비스명 | `pigeon-game` |
| 리전 | `asia-northeast3` (서울) |
| 서버 포트 | `process.env.PORT \|\| 3000` |
| Firebase 프로젝트 | `pigeon-attack-game` |
