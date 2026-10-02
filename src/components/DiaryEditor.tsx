import React, { useState } from 'react';
import { EmotionSelector } from './EmotionSelector';
import type { EmotionType, AIResponseData } from '../firebase';
import {
  Sparkles,
  Calendar,
  PenTool,
  RotateCcw,
  Sparkle,
  HelpCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { playWarmChime } from '../utils/audio';

interface DiaryEditorProps {
  onSubmit: (diary: {
    emotion: EmotionType;
    title: string;
    content: string;
    date: string;
  }) => Promise<AIResponseData | null>;
  isLoading: boolean;
}

const SAMPLE_DIARIES: Record<
  EmotionType,
  { title: string; content: string }
> = {
  기쁨: {
    title: '오랜만에 마주한 완벽한 가을 하늘과 반가운 소식',
    content:
      '오늘 퇴근길에 올려다본 하늘이 물감을 풀어놓은 것처럼 정말 맑고 예뻤다. 게다가 몇 달간 열심히 준비했던 프로젝트에 대해 팀장님과 동료들이 진심 어린 칭찬을 건네주었다. 사소한 노력들이 헛되지 않았다는 생각이 들어 뭉클하고 기분 좋은 하루였다!',
  },
  지침: {
    title: '온종일 쫓기듯 일하고 녹초가 되어버린 저녁',
    content:
      '아침부터 예상치 못한 돌발 상황들이 줄줄이 터져서 점심도 대충 삼키듯 먹었다. 쉼 없이 뛰어다니다 집에 돌아오니 손가락 하나 까딱할 힘도 남아있지 않다. 왜 이렇게 모든 걸 혼자 짊어지려 했을까 하는 생각에 마음까지 가라앉는다.',
  },
  설렘: {
    title: '새로운 취미 클래스 첫 등록과 다가올 주말',
    content:
      '늘 마음속으로만 꿈꿔왔던 도예 원데이 클래스를 드디어 예약했다! 흙을 만지고 나만의 찻잔을 만든다는 생각을 하니 벌써부터 가슴이 콩닥콩닥 뛴다. 일주일이 어서 지나서 주말이 찾아왔으면 좋겠다.',
  },
  불안: {
    title: '앞으로 다가올 중요한 시험과 불확실한 미래',
    content:
      '다음 주에 있을 자격증 시험을 앞두고 책을 펴놓고 있는데도 글자가 눈에 잘 들어오지 않는다. 혹시 실수하면 어쩌지, 남들보다 뒤처지는 것은 아닐까 하는 불안감이 파도처럼 밀려와서 숨이 턱 막힌다. 마음을 다잡고 싶은데 쉽지 않다.',
  },
};

const PROMPT_HINTS: Record<EmotionType, string> = {
  기쁨: '오늘 나를 미소 짓게 만든 작은 순간, 감사했던 일은 무엇이었나요?',
  지침: '오늘 하루 어떤 일들이 어깨를 무겁게 했나요? 편하게 털어놓으셔도 괜찮아요.',
  설렘: '내 마음을 두근거리게 만들고 있는 그 반짝이는 이야기는 무엇인가요?',
  불안: '마음속을 맴도는 걱정들을 솔직하게 글자로 쏟아내 보세요. 비워내면 편안해집니다.',
};

export const DiaryEditor: React.FC<DiaryEditorProps> = ({
  onSubmit,
  isLoading,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [emotion, setEmotion] = useState<EmotionType>('기쁨');
  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFillSample = () => {
    const sample = SAMPLE_DIARIES[emotion];
    setTitle(sample.title);
    setContent(sample.content);
    setValidationError(null);
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setValidationError('일기 본문 내용을 한 줄 이상 적어주세요.');
      return;
    }

    setValidationError(null);
    const result = await onSubmit({
      emotion,
      title: title.trim(),
      content: content.trim(),
      date,
    });

    if (result) {
      playWarmChime();
    }
  };

  return (
    <div className="bg-white/90 rounded-3xl p-5 sm:p-8 border border-amber-100 shadow-xl shadow-amber-500/5 space-y-6">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-800">
              오늘의 일기 적기
            </h2>
            <p className="text-xs text-stone-500">
              솔직한 마음을 적어주시면 AI 비서가 다정하게 읽고 답장을 드려요
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none outline-hidden cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleFillSample}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 text-xs font-medium transition-colors"
            title="현재 감정에 맞는 예시 일기 채우기"
          >
            <Sparkle className="w-3 h-3 text-amber-600" />
            <span>예시 채우기</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emotion Selector */}
        <EmotionSelector
          selected={emotion}
          onSelect={(selectedEmotion) => {
            setEmotion(selectedEmotion);
            setValidationError(null);
          }}
        />

        {/* Emotion-Driven Writing Prompt Hint */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-stone-700 text-xs">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-900">
              '{emotion}' 감정 길잡이:
            </span>
            <p className="text-stone-600">{PROMPT_HINTS[emotion]}</p>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-700">
            일기 제목 <span className="text-stone-400 font-normal">(선택)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘 하루를 한 마디로 요약한다면? (예: 바람이 시원했던 퇴근길)"
            className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden text-sm bg-stone-50/50 hover:bg-white focus:bg-white transition-all text-stone-800 placeholder:text-stone-400"
          />
        </div>

        {/* Content Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-stone-700">
              오늘 있었던 일과 내 마음 <span className="text-amber-600">*</span>
            </label>
            <span className="text-[11px] text-stone-400">
              {content.length}자
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationError) setValidationError(null);
            }}
            rows={6}
            placeholder="오늘 하루 동안 어떤 일들이 있었나요? 기뻤던 일, 속상하거나 불안했던 일, 혹은 마음을 스쳐 간 생각들을 자유롭게 적어보세요..."
            className="w-full p-4 rounded-2xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden text-sm leading-relaxed bg-stone-50/50 hover:bg-white focus:bg-white transition-all text-stone-800 placeholder:text-stone-400 resize-y"
          />
          {validationError && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              ⚠️ {validationError}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {content.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>작성 내용 초기화</span>
            </button>
          )}

          <div className="w-full sm:w-auto ml-auto">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-white shadow-lg transition-all duration-300 cursor-pointer ${
                isLoading
                  ? 'bg-amber-400 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI 비서 '하루'가 따뜻하게 읽는 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                  <span>AI 비서에게 일기 보여주기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
