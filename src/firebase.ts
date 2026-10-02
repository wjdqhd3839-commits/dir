import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';

// 사용자 지정 Firebase 설정 (memo-6bb29)
// 환경 변수로 오버라이드 가능하도록 구성
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBVQKgQEHFHsQPQALl5vfatX5EzAXTNbwQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "memo-6bb29.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "memo-6bb29",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "memo-6bb29.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "394176395617",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:394176395617:web:2eaf54304005511e446d20"
};

// Firebase 인스턴스 초기화 (싱글톤)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface AIResponseData {
  comfortMessage: string;
  actionSuggestion: string;
  cheerSummary: string;
  suggestedTags: string[];
  isMock?: boolean;
}

export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  emotion: EmotionType;
  title: string;
  content: string;
  aiResponse?: AIResponseData;
  createdAt: number; // timestamp
  syncedToCloud?: boolean;
}

const LOCAL_STORAGE_KEY = 'warm_daily_diaries_v1';

// 로컬 스토리지 헬퍼
export function getLocalDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('로컬 일기 불러오기 실패:', e);
    return [];
  }
}

export function saveLocalDiaries(diaries: DiaryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.error('로컬 일기 저장 실패:', e);
  }
}

// Firestore에 일기 저장
export async function saveDiaryToFirestore(entry: Omit<DiaryEntry, 'id'>): Promise<{ id: string; cloudSuccess: boolean }> {
  const localId = `diary_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let cloudSuccess = false;

  try {
    const docRef = await addDoc(collection(db, 'diaries'), {
      ...entry,
      createdAtServer: serverTimestamp(),
      createdAtClient: entry.createdAt
    });
    cloudSuccess = true;
    return { id: docRef.id, cloudSuccess };
  } catch (err) {
    console.warn('Firestore 저장 실패 (오프라인이거나 권한 제한). 로컬 저장소에 우선 보관합니다:', err);
    return { id: localId, cloudSuccess: false };
  }
}

// Firestore에서 일기 목록 불러오기
export async function fetchDiariesFromFirestore(): Promise<{ diaries: DiaryEntry[]; isFromCloud: boolean }> {
  try {
    const q = query(collection(db, 'diaries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const cloudDiaries: DiaryEntry[] = [];
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as DocumentData;
      cloudDiaries.push({
        id: docSnapshot.id,
        date: data.date || '',
        time: data.time || '',
        emotion: data.emotion as EmotionType,
        title: data.title || '',
        content: data.content || '',
        aiResponse: data.aiResponse,
        createdAt: data.createdAt || Date.now(),
        syncedToCloud: true
      });
    });

    if (cloudDiaries.length > 0) {
      // 로컬 스토리지와 동기화
      saveLocalDiaries(cloudDiaries);
      return { diaries: cloudDiaries, isFromCloud: true };
    }
  } catch (err) {
    console.warn('Firestore 조회 실패, 로컬 백업 데이터를 로드합니다:', err);
  }

  // Cloud 조회 실패 또는 데이터 없음 시 로컬 데이터 반환
  const localDiaries = getLocalDiaries();
  return { diaries: localDiaries, isFromCloud: false };
}

// Firestore 일기 삭제
export async function deleteDiaryFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'diaries', id));
    return true;
  } catch (err) {
    console.warn('Firestore 삭제 실패:', err);
    return false;
  }
}
