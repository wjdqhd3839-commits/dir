/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DiaryEditor } from './components/DiaryEditor';
import { AIResponseCard } from './components/AIResponseCard';
import { DiaryList } from './components/DiaryList';
import { GuideModal } from './components/GuideModal';
import {
  fetchDiariesFromFirestore,
  saveDiaryToFirestore,
  deleteDiaryFromFirestore,
  saveLocalDiaries,
  type DiaryEntry,
  type EmotionType,
  type AIResponseData,
} from './firebase';
import { requestDiaryCompanionFeedback } from './services/geminiService';
import { Sparkles, HeartHandshake, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'list' | 'guide'>('write');
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [latestEntry, setLatestEntry] = useState<DiaryEntry | null>(null);

  const responseCardRef = useRef<HTMLDivElement>(null);

  // Load diaries on startup
  useEffect(() => {
    async function loadData() {
      const res = await fetchDiariesFromFirestore();
      setDiaries(res.diaries);
      setIsCloudSynced(res.isFromCloud);
    }
    loadData();
  }, []);

  // Handle diary submission & AI feedback request
  const handleSubmitDiary = async (entry: {
    emotion: EmotionType;
    title: string;
    content: string;
    date: string;
  }): Promise<AIResponseData | null> => {
    setIsLoading(true);

    try {
      // 1. Request Gemini AI Companion Feedback
      const aiFeedback = await requestDiaryCompanionFeedback({
        emotion: entry.emotion,
        title: entry.title,
        content: entry.content,
        date: entry.date,
      });

      // 2. Prepare Diary Object
      const newEntryData: Omit<DiaryEntry, 'id'> = {
        date: entry.date,
        time: new Intl.DateTimeFormat('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
        emotion: entry.emotion,
        title: entry.title,
        content: entry.content,
        aiResponse: aiFeedback,
        createdAt: Date.now(),
      };

      // 3. Save to Firestore
      const saveResult = await saveDiaryToFirestore(newEntryData);
      const createdEntry: DiaryEntry = {
        ...newEntryData,
        id: saveResult.id,
        syncedToCloud: saveResult.cloudSuccess,
      };

      if (saveResult.cloudSuccess) {
        setIsCloudSynced(true);
      }

      // 4. Update Local State
      const updatedList = [createdEntry, ...diaries];
      setDiaries(updatedList);
      saveLocalDiaries(updatedList);
      setLatestEntry(createdEntry);

      // 5. Scroll smoothly to response card
      setTimeout(() => {
        responseCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);

      return aiFeedback;
    } catch (err) {
      console.error('일기 작성 및 AI 피드백 수신 실패:', err);
      alert('AI 피드백을 생성하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle diary deletion
  const handleDeleteDiary = async (id: string) => {
    await deleteDiaryFromFirestore(id);
    const updated = diaries.filter((d) => d.id !== id);
    setDiaries(updated);
    saveLocalDiaries(updated);
    if (latestEntry?.id === id) {
      setLatestEntry(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/60 via-stone-50/50 to-orange-50/30">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        diaryCount={diaries.length}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {activeTab === 'write' && (
          <div className="space-y-6">
            {/* Diary Input Form */}
            <DiaryEditor onSubmit={handleSubmitDiary} isLoading={isLoading} />

            {/* Immediate AI Feedback Result Card */}
            {latestEntry && latestEntry.aiResponse && (
              <div ref={responseCardRef} className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>방금 도착한 AI 비서 '하루'의 편지</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('list')}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors"
                  >
                    <span>마음 일기장 목록에서 보기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AIResponseCard
                  response={latestEntry.aiResponse}
                  emotion={latestEntry.emotion}
                  diaryTitle={latestEntry.title}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <DiaryList
            diaries={diaries}
            onDelete={handleDeleteDiary}
            onWriteNew={() => setActiveTab('write')}
          />
        )}

        {activeTab === 'guide' && <GuideModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100/80 bg-white/60 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-stone-600">
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>따뜻한 하루 일기 & AI 응원</span>
          </div>
          <p className="text-stone-400">
            Powered by Google Gemini 3.8 Flash • Firebase Firestore
          </p>
        </div>
      </footer>
    </div>
  );
}
