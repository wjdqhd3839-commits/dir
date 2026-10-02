import React from 'react';
import type { EmotionType } from '../firebase';
import { Sun, Coffee, Sparkles, Wind, Check } from 'lucide-react';

interface EmotionOption {
  type: EmotionType;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: {
    bgLight: string;
    bgSelected: string;
    border: string;
    borderSelected: string;
    text: string;
    textSelected: string;
    badge: string;
    glow: string;
  };
}

export const EMOTIONS: EmotionOption[] = [
  {
    type: '기쁨',
    label: '기쁨',
    tagline: '미소와 행복이 가득했던 순간',
    icon: Sun,
    theme: {
      bgLight: 'bg-amber-50 hover:bg-amber-100/70',
      bgSelected: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white',
      border: 'border-amber-200/80',
      borderSelected: 'border-amber-500 ring-2 ring-amber-300 ring-offset-2',
      text: 'text-amber-900',
      textSelected: 'text-white',
      badge: 'bg-amber-100 text-amber-800',
      glow: 'shadow-amber-500/20',
    },
  },
  {
    type: '지침',
    label: '지침',
    tagline: '하루를 버텨내느라 고단했던 마음',
    icon: Coffee,
    theme: {
      bgLight: 'bg-indigo-50/70 hover:bg-indigo-100/70',
      bgSelected: 'bg-gradient-to-br from-indigo-500 to-slate-600 text-white',
      border: 'border-indigo-200/80',
      borderSelected: 'border-indigo-500 ring-2 ring-indigo-300 ring-offset-2',
      text: 'text-indigo-950',
      textSelected: 'text-white',
      badge: 'bg-indigo-100 text-indigo-800',
      glow: 'shadow-indigo-500/20',
    },
  },
  {
    type: '설렘',
    label: '설렘',
    tagline: '새로운 기대와 가슴 뛰는 두근거림',
    icon: Sparkles,
    theme: {
      bgLight: 'bg-rose-50/75 hover:bg-rose-100/70',
      bgSelected: 'bg-gradient-to-br from-rose-400 to-pink-500 text-white',
      border: 'border-rose-200/80',
      borderSelected: 'border-rose-500 ring-2 ring-rose-300 ring-offset-2',
      text: 'text-rose-950',
      textSelected: 'text-white',
      badge: 'bg-rose-100 text-rose-800',
      glow: 'shadow-rose-500/20',
    },
  },
  {
    type: '불안',
    label: '불안',
    tagline: '마음이 서성이고 걱정스러운 생각',
    icon: Wind,
    theme: {
      bgLight: 'bg-teal-50/70 hover:bg-teal-100/70',
      bgSelected: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white',
      border: 'border-teal-200/80',
      borderSelected: 'border-teal-500 ring-2 ring-teal-300 ring-offset-2',
      text: 'text-teal-950',
      textSelected: 'text-white',
      badge: 'bg-teal-100 text-teal-800',
      glow: 'shadow-teal-500/20',
    },
  },
];

interface EmotionSelectorProps {
  selected: EmotionType;
  onSelect: (emotion: EmotionType) => void;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-stone-700">
          오늘 나의 마음 날씨 <span className="text-amber-600">*</span>
        </label>
        <span className="text-xs text-stone-500">
          가장 크게 와닿았던 감정 하나를 골라주세요
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {EMOTIONS.map((item) => {
          const isSelected = selected === item.type;
          const Icon = item.icon;

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelect(item.type)}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer shadow-xs ${
                isSelected
                  ? `${item.theme.bgSelected} ${item.theme.borderSelected} shadow-md ${item.theme.glow} scale-[1.02]`
                  : `${item.theme.bgLight} ${item.theme.border} text-stone-700`
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-200 ${
                  isSelected
                    ? 'bg-white/20 text-white scale-110'
                    : 'bg-white/80 text-stone-700 shadow-xs'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-base font-bold tracking-tight ${
                  isSelected ? 'text-white' : item.theme.text
                }`}
              >
                {item.label}
              </span>

              <span
                className={`text-[11px] mt-0.5 line-clamp-1 ${
                  isSelected ? 'text-white/85' : 'text-stone-500'
                }`}
              >
                {item.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
