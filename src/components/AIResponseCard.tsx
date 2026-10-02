import React, { useState } from 'react';
import type { AIResponseData, EmotionType } from '../firebase';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  CheckCircle2,
  Heart,
  Compass,
  MessageCircleHeart,
  Tag
} from 'lucide-react';
import { speakComfortText } from '../utils/audio';

interface AIResponseCardProps {
  response: AIResponseData;
  emotion: EmotionType;
  diaryTitle?: string;
  onDoneAction?: () => void;
  isActionDone?: boolean;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  response,
  emotion,
  diaryTitle,
  onDoneAction,
  isActionDone = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionChecked, setActionChecked] = useState(isActionDone);

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      if (stopAudioFn) stopAudioFn();
      setIsPlayingAudio(false);
      setStopAudioFn(null);
    } else {
      const fullTextToRead = `${response.comfortMessage}. 내일을 위한 작은 제안. ${response.actionSuggestion}. ${response.cheerSummary}`;
      const stop = speakComfortText(fullTextToRead, () => {
        setIsPlayingAudio(false);
        setStopAudioFn(null);
      });
      setStopAudioFn(() => stop);
      setIsPlayingAudio(true);
    }
  };

  const handleCopy = async () => {
    const textToCopy = `[따뜻한 하루 일기 - AI 비서 하루의 답장]
감정: ${emotion}
${diaryTitle ? `제목: ${diaryTitle}\n` : ''}
💌 다정한 위로:
${response.comfortMessage}

🌱 내일을 위한 작은 실천:
${response.actionSuggestion}

✨ 마음 응원:
${response.cheerSummary}
${response.suggestedTags?.join(' ') || ''}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleActionToggle = () => {
    const nextState = !actionChecked;
    setActionChecked(nextState);
    if (onDoneAction) {
      onDoneAction();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-white p-5 sm:p-7 border border-amber-200/90 shadow-lg shadow-amber-500/10">
      {/* Decorative Warm Aura */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-rose-200/30 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-800 text-base sm:text-lg">
                AI 마음 비서 '하루'의 편지
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100/90 text-amber-800 border border-amber-300/60">
                {emotion}의 하루를 품으며
              </span>
            </div>
            <p className="text-xs text-stone-500">
              당신의 일기를 깊이 헤아려 정성스레 적어 보낸 답장입니다
            </p>
          </div>
        </div>

        {/* Audio & Copy Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleAudioToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isPlayingAudio
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/90 text-stone-700 hover:bg-amber-100/80 border border-amber-200/70'
            }`}
            title="다정한 목소리로 답장 듣기"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span>낭독 멈추기</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                <span>음성으로 듣기</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-stone-700 hover:bg-stone-100 border border-stone-200/70 transition-colors"
            title="답장 내용 복사하기"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative mt-5 space-y-5">
        {/* Section 1: Comfort & Empathy Message */}
        <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
            <MessageCircleHeart className="w-4 h-4 text-amber-600" />
            <span>마음을 다독이는 위로 & 공감</span>
          </div>
          <p className="text-stone-800 leading-relaxed text-sm sm:text-base font-sans whitespace-pre-wrap">
            {response.comfortMessage}
          </p>
        </div>

        {/* Section 2: Tomorrow's 1 Positive Action Proposal */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 p-4 sm:p-5 border border-emerald-200/80 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>내일을 위한 다정한 제안 (긍정적 행동 1가지)</span>
              </div>
              <p className="text-stone-900 font-semibold text-sm sm:text-base leading-snug">
                "{response.actionSuggestion}"
              </p>
              <p className="text-xs text-stone-500">
                거창하지 않아도 괜찮아요. 내일 작은 여유를 선물해보세요.
              </p>
            </div>

            <button
              type="button"
              onClick={handleActionToggle}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                actionChecked
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100/60 shadow-xs'
              }`}
            >
              {actionChecked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>실천 완료!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>내일 해볼게요</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Cheer Summary Capsule */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200/70 text-amber-950">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-amber-600 shadow-xs">
            <Heart className="w-4 h-4 fill-amber-500 text-amber-600" />
          </div>
          <div className="text-xs sm:text-sm font-medium italic">
            "{response.cheerSummary}"
          </div>
        </div>

        {/* Section 4: Suggested Tags */}
        {response.suggestedTags && response.suggestedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            {response.suggestedTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800 transition-colors"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
