# 따뜻한 하루 일기 & AI 응원 (Warm Daily Diary)

Google Gemini API와 Firebase Cloud Firestore(`memo-6bb29`)를 연동한 마음 일기 & AI 응원 웹 애플리케이션입니다.

---

## 🌟 주요 기능
1. **감정 선택 & 일기 쓰기**: 기쁨, 지침, 설렘, 불안 4가지 감정 선택 및 맞춤형 질문 가이드 제공
2. **AI 비서 '하루'의 실시간 답장**:
   - 일기 내용과 감정을 깊이 공감하는 따뜻한 위로 편지
   - 내일을 가볍게 시작할 수 있는 긍정적인 작은 실천 1가지 제안
   - 한 줄 응원 문구 & 맞춤 마음 태그
   - 한국어 음성 낭독 (TTS) 지원
3. **Firebase Cloud Firestore 연동**: 작성된 일기와 AI 피드백이 클라우드에 안전하게 보관되며, 오프라인 시에도 로컬에 즉시 동기화
4. **마음 날씨 통계**: 감정별 분포 및 일기 검색/필터링 기능

---

## 🚀 GitHub & Vercel 배포 방법 (3단계)

### 1단계: GitHub에 코드 올리기
로컬 터미널에서 다음 명령어를 실행하여 깃허브 저장소에 코드를 푸시합니다:

```bash
git init
git add .
git commit -m "feat: 따뜻한 하루 일기 웹앱 완성"
git branch -M main
git remote add origin https://github.com/사용자아이디/레포지토리이름.git
git push -u origin main
```

*(주의: `.gitignore`에 의해 `.env`는 깃허브에 올라가지 않고, 템플릿인 `.env.example`만 안전하게 올라갑니다.)*

---

### 2단계: Vercel에서 프로젝트 가져오기
1. [Vercel](https://vercel.com)에 로그인합니다.
2. **Add New...** → **Project**를 클릭합니다.
3. 방금 올린 GitHub 저장소를 선택하고 **Import**를 누릅니다.

---

### 3단계: 환경 변수(Environment Variables) 설정 후 배포
Vercel 배포 설정 화면의 **Environment Variables** 항목을 열고 아래 값을 추가합니다:

| Key | Value | 설명 |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` (내 Gemini API 키) | **(필수)** Google AI Studio에서 발급받은 API 키 |

> **선택 사항 (Firebase 기본값이 내장되어 있어 별도 입력하지 않아도 바로 동작합니다)**:
> - `VITE_FIREBASE_API_KEY`: Firebase API Key
> - `VITE_FIREBASE_PROJECT_ID`: `memo-6bb29`

설정을 마친 후 **[Deploy]** 버튼을 누르면 1분 이내에 배포가 완료됩니다! 🎉

---

## 📁 로컬 개발 및 테스트 실행

```bash
# 의존성 패키지 설치
npm install

# .env 파일 생성 (.env.example 복사)
cp .env.example .env
# .env 파일에 자신의 GEMINI_API_KEY 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인하실 수 있습니다.
