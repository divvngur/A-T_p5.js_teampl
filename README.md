# Pigeon Attack p5.js Game

웹캠, ml5 FaceMesh, MediaPipe Selfie Segmentation을 사용하는 p5.js 기반 미니게임입니다.

## 실행

로컬 서버에서 열어야 카메라 권한이 정상 동작합니다.

```bash
python3 -m http.server 5173
```

브라우저에서 `http://127.0.0.1:5173`으로 접속하세요.

## 구조

- `index.html`: 앱 진입점 및 CDN 스크립트 로드
- `src/main.js`: 전역 상태, 화면 전환, 로컬 로그인/순위표 저장
- `src/screens/`: 화면별 UI
- `src/game/StageConfig.js`: 스테이지 설정
- `src/game/HDFaceGame.js`: HD 웹캠 누끼 + FaceMesh 기반 메인 게임 로직
- `src/styles/global.css`: 전체 UI 스타일

## 참고

Firebase 연동은 현재 제외되어 있으며, 로그인과 순위표는 `localStorage` 기반으로 동작합니다.

## Cloud Run 배포 준비

이 프로젝트는 `Dockerfile`을 사용해 Cloud Run에 배포할 수 있습니다. 서버는 `server.js`에서 `process.env.PORT || 3000` 포트를 사용하며, 멀티플레이어는 `/multiplayer` 경로로 접근합니다.

배포 예시:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

또는 직접 빌드/배포:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/pigeon-game .

gcloud run deploy pigeon-game \
  --image gcr.io/$PROJECT_ID/pigeon-game \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 3000
```

배포 후 기본 앱은 `/`에서, 멀티플레이는 `/multiplayer`에서 열립니다.
