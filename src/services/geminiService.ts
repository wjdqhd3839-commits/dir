import type { AIResponseData, EmotionType } from '../firebase';

export interface GenerateFeedbackParams {
  emotion: EmotionType;
  title: string;
  content: string;
  date?: string;
}

export async function requestDiaryCompanionFeedback(
  params: GenerateFeedbackParams
): Promise<AIResponseData> {
  const { emotion, title, content, date } = params;

  // 1단계: Express 서버 또는 Vercel Serverless Function (/api/diary-feedback) 호출
  try {
    const res = await fetch('/api/diary-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotion,
        title,
        content,
        date: date || new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.comfortMessage && data.actionSuggestion) {
        return {
          comfortMessage: data.comfortMessage,
          actionSuggestion: data.actionSuggestion,
          cheerSummary: data.cheerSummary || '당신의 소중한 하루를 늘 따뜻하게 응원합니다.',
          suggestedTags: data.suggestedTags || ['#마음챙김', '#오늘도수고했어', '#토닥토닥'],
          isMock: data.isMock || false,
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/diary-feedback 호출 실패, 클라이언트 대체 방식을 확인합니다:', err);
  }

  // 2단계: 클라이언트 환경변수(VITE_GEMINI_API_KEY)가 있을 때 Gemini REST API 직접 호출 (Vercel 정적 배포 fallback)
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientKey}`;
      const prompt = `
[사용자의 오늘 하루 일기]
- 감정: ${emotion}
- 제목: ${title || '(제목 없음)'}
- 내용:
${content}

다정하고 부드러운 한국어 어투(~해요, ~답니다, ~를 응원해요)로 다음 JSON 객체 형식만 정확히 출력해주세요:
{
  "comfortMessage": "사용자의 일기와 감정에 깊이 공감하고 다독여주는 따뜻한 위로/축하 (3~4문장)",
  "actionSuggestion": "내일을 위한 구체적이고 작은 실천 긍정 행동 1가지",
  "cheerSummary": "가슴에 닿는 한 줄 따뜻한 응원 문구",
  "suggestedTags": ["#태그1", "#태그2", "#태그3"]
}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            comfortMessage: parsed.comfortMessage,
            actionSuggestion: parsed.actionSuggestion,
            cheerSummary: parsed.cheerSummary,
            suggestedTags: parsed.suggestedTags || ['#마음정리', '#내일도화이팅', '#다정한하루'],
          };
        }
      }
    } catch (clientErr) {
      console.error('Client Gemini REST API 호출 실패:', clientErr);
    }
  }

  // 3단계: 기본 감정별 따뜻한 프리셋 응답 (오프라인/키 미설정 대비)
  return getEmotionDefaultFeedback(emotion, title, content);
}

function getEmotionDefaultFeedback(emotion: EmotionType, title: string, content: string): AIResponseData {
  switch (emotion) {
    case '기쁨':
      return {
        comfortMessage: `오늘 일기 속에 담긴 기쁜 순간들이 마음을 환하게 밝혀주네요! '${title || '오늘의 기쁨'}'을 기록해둔 덕분에 이 행복한 온기는 오래도록 당신 곁에 머물 거예요. 오늘의 미소와 벅찬 마음을 진심으로 축하해요.`,
        actionSuggestion: '오늘 나를 웃게 만들었던 순간을 떠올리며 나 자신에게 "참 행복했어"라고 말해주기',
        cheerSummary: '당신이 밝힌 미소가 내일의 하루까지 따스하게 비춰줄 거예요.',
        suggestedTags: ['#햇살같은하루', '#소소한행복', '#기쁨충전'],
        isMock: true,
      };
    case '지침':
      return {
        comfortMessage: `오늘 하루 정말, 정말 고생 많으셨어요. 묵묵히 버텨내고 일기를 적어 내려간 것만으로도 당신은 이미 너무나 대단해요. 무거운 짐은 이제 잠시 내려놓고, 온전히 쉼을 누리셔도 괜찮습니다.`,
        actionSuggestion: '잠들기 전 미온수 한 잔을 천천히 마시며 어깨와 목의 긴장을 부드럽게 풀어주기',
        cheerSummary: '수고한 당신의 밤이 포근한 솜이불처럼 평온하기를.',
        suggestedTags: ['#토닥토닥', '#수고했어오늘도', '#꿀잠예약'],
        isMock: true,
      };
    case '설렘':
      return {
        comfortMessage: `두근거리는 마음과 설렘의 에너지가 글자 너머로 퐁퐁 솟아나요! 새로운 기분과 기대로 가득 찬 오늘의 반짝임을 함께 응원해요. 이 설렘이 멋진 내일로 이어질 거예요.`,
        actionSuggestion: '내일 기대되는 작은 일정을 다이어리 첫 줄에 적어두고 기분 좋게 잠자리에 들기',
        cheerSummary: '설레는 마음은 새로운 행복의 문을 여는 가장 예쁜 열쇠예요.',
        suggestedTags: ['#두근두근', '#설레는시작', '#반짝이는내일'],
        isMock: true,
      };
    case '불안':
      return {
        comfortMessage: `마음 한구석에 피어난 불안 때문에 마음이 많이 조마조마하셨지요. 불안은 당신이 그만큼 삶과 하루를 진지하게 아끼고 있다는 증거랍니다. 지금 이 순간, 당신은 안전하고 충분히 잘 해내고 있어요.`,
        actionSuggestion: '눈을 감고 4초 들이마시고 6초 천천히 내쉬는 깊은 복식호흡 5번 하기',
        cheerSummary: '천천히 걸어도 괜찮아요. 당신의 걸음걸음마다 봄바람이 함께할 테니까요.',
        suggestedTags: ['#깊은호흡', '#괜찮아잘하고있어', '#마음평온'],
        isMock: true,
      };
  }
}
