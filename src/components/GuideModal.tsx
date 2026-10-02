import React from 'react';
import { ShieldCheck, Key, Database, Globe, CheckCircle2, Copy } from 'lucide-react';

export const GuideModal: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const envSample = `# [Google Gemini API Key]
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# (선택) 클라이언트 테스트용
VITE_GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# [애플리케이션 호스팅 URL]
APP_URL="http://localhost:3000"

# [Firebase 데이터베이스 (memo-6bb29)]
VITE_FIREBASE_API_KEY="AIzaSyBVQKgQEHFHsQPQALl5vfatX5EzAXTNbwQ"
VITE_FIREBASE_AUTH_DOMAIN="memo-6bb29.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="memo-6bb29"
VITE_FIREBASE_STORAGE_BUCKET="memo-6bb29.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="394176395617"
VITE_FIREBASE_APP_ID="1:394176395617:web:2eaf54304005511e446d20"`;

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envSample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl shadow-stone-900/5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            보안 설계 및 Vercel 배포 가이드
          </h2>
          <p className="text-xs text-stone-500">
            API 키 보안 수칙과 로컬 환경 변수 설정 안내
          </p>
        </div>
      </div>

      {/* Grid of Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Point 1: Secure API Key */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <Key className="w-4 h-4 text-amber-700" />
            <span>1. API 키 보안 격리 (Vercel & AI Studio)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            API 키를 소스 코드 내에 하드코딩하지 않고, 서버 사이드 및 Vercel 환경 변수(<code>process.env.GEMINI_API_KEY</code>)에서만 안전하게 읽어오도록 아키텍처를 설계했습니다.
          </p>
          <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
            <li>AI Studio: Secrets 패널에서 자동 주입</li>
            <li>Vercel: Settings → Environment Variables에 등록</li>
            <li>브라우저 네트워크 탭에 API 키가 노출되지 않습니다.</li>
          </ul>
        </div>

        {/* Point 2: Firebase Connection */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
            <Database className="w-4 h-4 text-blue-700" />
            <span>2. Firebase memo-6bb29 연동</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            요청하신 Firebase Cloud Firestore (<code>memo-6bb29</code>) 프로젝트가 연동되어 있어 작성한 일기가 클라우드에 안전하게 영구 보관됩니다.
          </p>
          <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
            <li>오프라인/네트워크 불안정 시에도 로컬에 즉시 안전 보관</li>
            <li>다시 연결 시 브라우저와 자동 동기화</li>
          </ul>
        </div>
      </div>

      {/* Env File Example Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Globe className="w-4 h-4 text-stone-500" />
            <span>로컬 테스트용 <code>.env.example</code> 예시 파일</span>
          </div>
          <button
            onClick={copyEnv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>복사하기</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-stone-900 text-amber-200 text-xs font-mono overflow-x-auto leading-relaxed">
          {envSample}
        </pre>
      </div>

      {/* Step by step for Vercel */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2">
        <h4 className="font-bold text-stone-800 text-xs">
          🚀 Vercel 1분 배포 가이드
        </h4>
        <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside">
          <li>GitHub 저장소에 본 코드를 푸시합니다.</li>
          <li>Vercel 대시보드에서 <b>New Project</b>를 클릭하고 해당 레포지토리를 Import합니다.</li>
          <li><b>Environment Variables</b> 설정에 <code>GEMINI_API_KEY</code>를 입력하고 Deploy를 누릅니다.</li>
          <li><code>/api/diary-feedback</code> 서버리스 함수가 자동 활성화되어 안전하게 동작합니다!</li>
        </ol>
      </div>
    </div>
  );
};
