import React from 'react';
import { BookHeart, Sparkles, ShieldCheck, Database, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: 'write' | 'list' | 'guide';
  setActiveTab: (tab: 'write' | 'list' | 'guide') => void;
  diaryCount: number;
  isCloudSynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  diaryCount,
  isCloudSynced,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <header className="relative bg-white/80 backdrop-blur-md border-b border-amber-100/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-300 to-rose-300 p-0.5 shadow-md shadow-amber-500/10 flex items-center justify-center text-white">
              <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                <BookHeart className="w-6 h-6 text-amber-900 drop-shadow-xs" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-800 font-sans">
                  따뜻한 하루 일기
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Gemini AI 비서
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                오늘의 감정을 털어놓으면 따뜻한 위로와 내일의 작은 행동을 선물해요
              </p>
            </div>
          </div>

          {/* Date & Firebase Status Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100/90 text-stone-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{todayFormatted}</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-colors ${
                isCloudSynced
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
              title="Firebase memo-6bb29 연동 상태"
            >
              <Database className="w-3 h-3" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span>{isCloudSynced ? 'Firestore 연결됨' : '로컬 보관중'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-amber-100/60">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'write'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
            }`}
          >
            <BookHeart className="w-4 h-4" />
            <span>일기 쓰기</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'list'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
            }`}
          >
            <span>마음 일기장</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-xs ${
                activeTab === 'list'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {diaryCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ml-auto ${
              activeTab === 'guide'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">보안 및 배포 가이드</span>
            <span className="sm:hidden">가이드</span>
          </button>
        </div>
      </div>
    </header>
  );
};
