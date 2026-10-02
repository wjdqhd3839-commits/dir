import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Diary AI Companion Feedback Endpoint
  app.post('/api/diary-feedback', async (req: Request, res: Response) => {
    try {
      const { emotion, title, content, date } = req.body;

      if (!emotion || !content) {
        return res.status(400).json({
          error: '감정과 일기 본문 내용은 필수입니다.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback message when API key is not yet configured in environment
        return res.status(200).json({
          comfortMessage: `오늘 '${emotion}'이라는 감정을 솔직하게 마주하고 일기에 담아주셔서 고마워요. 어떤 마음이든 그 자체로 소중하고 가치 있는 하루의 발자국입니다. 편안한 숨을 고르며 오늘 하루도 수고 많았던 스스로를 꼭 안아주세요.`,
          actionSuggestion: '잠자리에 들기 전 따뜻한 물 한 잔을 마시며 "오늘 하루도 애썼어"라고 속삭여주기',
          cheerSummary: '마음의 모든 파도는 결국 평온한 바다로 이어집니다.',
          suggestedTags: ['#토닥토닥', '#소중한오늘', '#따뜻한밤'],
          isMock: true,
          note: 'GEMINI_API_KEY 환경변수를 설정하면 실시간 맞춤 Gemini 응답이 활성화됩니다.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `
[사용자의 오늘 하루 일기]
- 작성 일자: ${date || '오늘'}
- 선택한 감정: ${emotion}
- 일기 제목: ${title ? `"${title}"` : '(제목 없음)'}
- 일기 본문:
${content}

위 일기를 다정하고 따뜻하게 읽고 다음 JSON 구조로 응답해주세요:
1. comfortMessage: 일기 속 사용자의 마음과 상황을 구체적으로 언급하며, 마치 따뜻한 차 한 잔을 건네듯 진심 어린 공감과 다정한 위로/축하를 건네는 글 (한국어 존댓말, 3~5문장).
2. actionSuggestion: 내일을 조금 더 가볍고 행복하게 시작할 수 있도록 돕는, 누구나 부담 없이 즉시 실천할 수 있는 긍정적인 행동 딱 1가지 (예: 아침 햇살 3분 바라보기, 내일 출근길 좋아하는 노래 듣기 등).
3. cheerSummary: 마음속에 오래 간직할 수 있는 시적이고 따뜻한 한 줄 응원 메시지.
4. suggestedTags: 오늘의 마음에 어울리는 3개의 해시태그 (예: ["#포근한밤", "#마음챙김", "#내일은더밝을거야"]).
`;

      let aiResponseText: string | null = null;
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

      for (const modelName of modelsToTry) {
        try {
          const resp = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: `당신은 사용자의 하루를 진심으로 품어주고 위로해주는 다정한 AI 마음 비서 '하루'입니다.
사용자가 오늘 적은 일기와 선택한 감정(기쁨, 지침, 설렘, 불안)을 깊이 공감하며 읽고,
- 기쁨: 함께 벅차게 축하해주고 그 기쁨의 온기를 오래 간직할 수 있도록 응원
- 지침: 지친 마음을 탓하지 않고, 오늘 버텨낸 것만으로도 충분히 위대함을 진심으로 안아주기
- 설렘: 두근거리는 마음을 설레는 눈빛으로 함께 기대해주고 용기를 북돋워주기
- 불안: 불안한 마음을 차분히 가라앉히고, 천천히 가도 괜찮다는 안도감을 전하기
어조는 항상 다정하고 따뜻하며, 부드러운 한국어 어투(~해요, ~답니다, ~를 응원해요)를 사용하세요.`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  comfortMessage: {
                    type: Type.STRING,
                    description: '사용자의 감정과 일기 내용을 깊이 공감하고 다독여주는 따뜻한 위로/축하 답장'
                  },
                  actionSuggestion: {
                    type: Type.STRING,
                    description: '내일을 위한 구체적이고 부담 없는 긍정적인 작은 실천 행동 1가지'
                  },
                  cheerSummary: {
                    type: Type.STRING,
                    description: '마음에 온기를 불어넣는 한 줄 요약 응원 문구'
                  },
                  suggestedTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '마음 태그 3개'
                  }
                },
                required: ['comfortMessage', 'actionSuggestion', 'cheerSummary', 'suggestedTags']
              }
            }
          });

          if (resp.text) {
            aiResponseText = resp.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} call failed, trying next:`, err?.message || err);
        }
      }

      if (aiResponseText) {
        const parsedData = JSON.parse(aiResponseText);
        return res.status(200).json(parsedData);
      }

      // If all Gemini calls encounter 503 or transient issues, return a warm tailored fallback
      const fallbackComfort = emotion === '기쁨'
        ? `오늘 올려다본 하늘처럼 맑고 눈부신 소식이 가득했던 하루였네요! 당신의 성실한 노력들이 이렇게 값진 칭찬과 보람으로 되돌아온 것을 진심으로 축하해요. 오늘의 이 몽글몽글한 행복을 마음속 깊이 꼭꼭 담아두세요.`
        : emotion === '지침'
        ? `오늘 하루 정말, 정말 고생 많으셨어요. 쉼 없이 몰아친 하루를 온 힘으로 버텨낸 것만으로도 당신은 이미 너무나 훌륭해요. 지금 이 순간만큼은 모든 걱정을 내려놓고 편안히 쉬셔도 괜찮습니다.`
        : emotion === '설렘'
        ? `글자 너머로 전해지는 두근거림에 저까지 미소가 지어지네요! 기대하는 마음이 당신의 내일을 더욱 눈부시게 밝혀줄 거예요. 설레는 발걸음을 따뜻하게 응원합니다.`
        : `마음이 서성이고 불안했던 오늘, 솔직하게 털어놓아 주셔서 고마워요. 당신은 이미 충분히 잘 해내고 있고, 모든 파도는 지나가기 마련입니다. 깊은 숨을 쉬며 당신 자신을 믿어주세요.`;

      const fallbackAction = emotion === '기쁨'
        ? '오늘 나를 웃게 만든 순간을 사진이나 한 줄 메모로 남겨두고 잠들기'
        : emotion === '지침'
        ? '잠들기 전 따뜻한 물로 샤워하고 포근한 이불 속에서 좋아하는 음악 한 곡 듣기'
        : emotion === '설렘'
        ? '내일 기대되는 가장 즐거운 장면 하나를 머릿속으로 상상하며 미소 짓기'
        : '양손을 가슴에 얹고 천천히 4초 들이마시고 6초 내쉬는 심호흡 3번 하기';

      return res.status(200).json({
        comfortMessage: fallbackComfort,
        actionSuggestion: fallbackAction,
        cheerSummary: '당신의 오늘 하루는 그 자체로 눈부시게 소중합니다.',
        suggestedTags: ['#따뜻한위로', '#수고했어오늘도', '#다정한하루'],
        isFallback: true
      });
    } catch (error: any) {
      console.error('Error generating diary feedback:', error);
      return res.status(500).json({
        error: 'AI 응원을 생성하는 도중 오류가 발생했습니다.',
        details: error?.message || String(error)
      });
    }
  });

  // Serve Vite in development or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 따뜻한 하루 일기 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error('서버 시작 실패:', err);
  process.exit(1);
});
