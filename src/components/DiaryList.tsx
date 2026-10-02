import React, { useState } from 'react';
import type { DiaryEntry, EmotionType } from '../firebase';
import { EMOTIONS } from './EmotionSelector';
import { AIResponseCard } from './AIResponseCard';
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  X,
  Smile,
  CloudCheck,
  HeartHandshake
} from 'lucide-react';

interface DiaryListProps {
  diaries: DiaryEntry[];
  onDelete: (id: string) => Promise<void>;
  onWriteNew: () => void;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  diaries,
  onDelete,
  onWriteNew,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<EmotionType | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailEntry, setDetailEntry] = useState<DiaryEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered diaries
  const filtered = diaries.filter((d) => {
    const matchesFilter = selectedFilter === '전체' || d.emotion === selectedFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.aiResponse?.comfortMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Emotion Statistics
  const totalCount = diaries.length;
  const stats = EMOTIONS.map((emo) => {
    const count = diaries.filter((d) => d.emotion === emo.type).length;
    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...emo, count, percent };
  });

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('이 일기를 정말 삭제하시겠어요? 삭제 후에는 복구할 수 없습니다.')) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
      if (detailEntry?.id === id) {
        setDetailEntry(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Emotion Weather Overview Card */}
      {totalCount > 0 && (
        <div className="bg-white/90 rounded-3xl p-5 sm:p-6 border border-amber-100 shadow-md shadow-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">
                나의 마음 날씨 통계
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              총 {totalCount}편의 이야기
            </span>
          </div>

          {/* Progress Bar of Emotions */}
          <div className="h-3 w-full rounded-full bg-stone-100 flex overflow-hidden p-0.5">
            {stats.map((s) =>
              s.percent > 0 ? (
                <div
                  key={s.type}
                  style={{ width: `${s.percent}%` }}
                  className={`h-full transition-all duration-500 ${
                    s.type === '기쁨'
                      ? 'bg-amber-400'
                      : s.type === '지침'
                      ? 'bg-indigo-400'
                      : s.type === '설렘'
                      ? 'bg-rose-400'
                      : 'bg-teal-400'
                  }`}
                  title={`${s.label}: ${s.count}편 (${s.percent}%)`}
                />
              ) : null
            )}
          </div>

          {/* Emotion Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {stats.map((s) => (
              <div
                key={s.type}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      s.type === '기쁨'
                        ? 'bg-amber-400'
                        : s.type === '지침'
                        ? 'bg-indigo-400'
                        : s.type === '설렘'
                        ? 'bg-rose-400'
                        : 'bg-teal-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    {s.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-600">
                  {s.count}편 ({s.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white/90 rounded-2xl p-3 sm:p-4 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Emotion Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('전체')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedFilter === '전체'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 ({diaries.length})
          </button>
          {EMOTIONS.map((emo) => {
            const isSelected = selectedFilter === emo.type;
            const count = diaries.filter((d) => d.emotion === emo.type).length;
            return (
              <button
                key={emo.type}
                onClick={() => setSelectedFilter(emo.type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? `${emo.theme.bgSelected} shadow-xs`
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{emo.label}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 일기 내용 검색..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Diary Card List */}
      {filtered.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-stone-800 text-base">
              {diaries.length === 0
                ? '아직 기록된 일기가 없어요'
                : '조건에 맞는 일기를 찾지 못했어요'}
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {diaries.length === 0
                ? '오늘 하루를 스쳐 지나간 감정과 소중한 이야기를 첫 일기로 남겨보세요. AI 비서가 따뜻하게 기다리고 있어요.'
                : '다른 검색어나 감정 필터를 선택해보세요.'}
            </p>
          </div>

          {diaries.length === 0 && (
            <button
              onClick={onWriteNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>첫 일기 적으러 가기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => {
            const emoMeta = EMOTIONS.find((e) => e.type === entry.emotion) || EMOTIONS[0];
            const EmoIcon = emoMeta.icon;

            return (
              <div
                key={entry.id}
                onClick={() => setDetailEntry(entry)}
                className="group relative bg-white/95 rounded-2xl p-5 border border-stone-200/90 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Top: Emotion & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${emoMeta.theme.badge}`}
                      >
                        <EmoIcon className="w-3.5 h-3.5" />
                        <span>{entry.emotion}</span>
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{entry.date}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, entry.id)}
                      disabled={deletingId === entry.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100"
                      title="일기 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Content Preview */}
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors line-clamp-1">
                      {entry.title || '(제목 없는 일기)'}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>

                  {/* AI Response Teaser */}
                  {entry.aiResponse && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>비서 하루의 한마디:</span>
                      </div>
                      <p className="text-stone-700 italic line-clamp-1">
                        "{entry.aiResponse.cheerSummary}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Read Detail Hint */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
                  <span>자세히 보기 & 답장 확인</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            {/* Modal Close Button */}
            <button
              onClick={() => setDetailEntry(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Diary Info */}
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800">
                  {detailEntry.emotion}
                </span>
                <span className="text-xs text-stone-500">{detailEntry.date}</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                {detailEntry.title || '(제목 없는 일기)'}
              </h3>
            </div>

            {/* Diary Content */}
            <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/70">
              <h5 className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">
                내가 쓴 일기
              </h5>
              <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                {detailEntry.content}
              </p>
            </div>

            {/* AI Feedback Card */}
            {detailEntry.aiResponse && (
              <AIResponseCard
                response={detailEntry.aiResponse}
                emotion={detailEntry.emotion}
                diaryTitle={detailEntry.title}
              />
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDetailEntry(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
