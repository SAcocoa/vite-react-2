import React, { useState, useCallback, useRef, useEffect } from 'react';

// === アイコンコンポーネント ===
const RotateCcwIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
const MinusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const InfoIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const HomeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ImageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const CameraIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const SaveIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const FolderIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const TrashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// === 型定義 ===
type SkillRating = 'double' | 'single' | 'triangle' | null;
type PageState = 'home' | 'evaluation' | 'skill' | 'detail';

interface ItemDef {
  id: number;
  type: 'eval' | 'skill';
  category: string;
  text: string;
  titleLines: string[];
  description: string;
  imageUrl: string; 
}

interface Spark {
  id: number;
  x: number;
  y: number;
}

// === ローカルデータベース（IndexedDB）の設定 ===
const DB_NAME = 'LessonEvalAppDB';
const STORE_NAME = 'records';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const target = e.target as IDBOpenDBRequest;
      if (!target.result.objectStoreNames.contains(STORE_NAME)) {
        target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveRecordToDB = async (record: any) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getRecordsFromDB = async () => {
  const db = await openDB();
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      // any型による警告を避けるため型安全にソート
      const records = request.result.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : 0;
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : 0;
        return timeB - timeA;
      });
      resolve(records);
    };
    request.onerror = () => reject(request.error);
  });
};

const deleteRecordFromDB = async (id: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// === データ定義 ===
const EVALUATION_ITEMS: ItemDef[] = [
  { id: 1, type: 'eval', category: '導入', text: '振り返り・課題設定', titleLines: ['振り返り', '課題設定'], description: '子どもが主体的に取り組む課題（めあて）設定ができたか？', imageUrl: '/A1.png' },
  { id: 2, type: 'eval', category: '導入', text: '見通し（予想）', titleLines: ['見通し', '（予想）'], description: '子どもに課題解決のための予想や見通しをもたせたか？', imageUrl: '/A2.png' },
  { id: 3, type: 'eval', category: '展開', text: '自力解決', titleLines: ['自力解決'], description: '子どもに自力解決の場を与えたか？', imageUrl: '/A3.png' },
  { id: 4, type: 'eval', category: '展開', text: '質問・話し合い', titleLines: ['質問', '話し合い'], description: '質問や話し合いを通して多様な考えを引き出したか？', imageUrl: '/A4.png' },
  { id: 5, type: 'eval', category: '展開', text: '学習形態', titleLines: ['学習形態'], description: 'グループ活動等を効果的に使ったか？', imageUrl: '/A5.png' },
  { id: 6, type: 'eval', category: '展開', text: '発表', titleLines: ['発表'], description: '個人やグループ発表の場面を設定したか？', imageUrl: '/A6.png' },
  { id: 7, type: 'eval', category: '展開', text: '比較・検討', titleLines: ['比較', '検討'], description: '子どもの発表の内容を全体で比較・検討したか？', imageUrl: '/A7.png' },
  { id: 8, type: 'eval', category: 'まとめ', text: 'まとめ・自己評価', titleLines: ['まとめ', '自己評価'], description: '学習のまとめを子ども主体で行ったか？', imageUrl: '/A8.png' },
  { id: 9, type: 'eval', category: 'まとめ', text: '練習問題', titleLines: ['練習問題'], description: '学習した内容について確認の問題を提示したか？', imageUrl: '/A9.png' },
  { id: 10, type: 'eval', category: 'まとめ', text: '次時予告・意欲付け', titleLines: ['次時予告', '意欲付け'], description: '次時の学習の予告と意欲付けを行ったか？', imageUrl: '/A10.png' },
];

const SKILL_ITEMS: ItemDef[] = [
  { id: 101, type: 'skill', category: '準備', text: '教材研究・指導計画', titleLines: ['教材研究', '指導計画'], description: '教材研究を行い、指導の計画立てはできているか？', imageUrl: '/B1.png' },
  { id: 102, type: 'skill', category: '準備', text: '教材・資料', titleLines: ['教材', '資料'], description: '必要十分な教材や資料は揃っているか？', imageUrl: '/B2.png' },
  { id: 103, type: 'skill', category: '授業', text: '時間配分', titleLines: ['時間配分'], description: '各活動の時間配分は適当か？', imageUrl: '/B3.png' },
  { id: 104, type: 'skill', category: '授業', text: '説明・発問', titleLines: ['説明', '発問'], description: '説明や発問の内容やタイミングは的確か？', imageUrl: '/B4.png' },
  { id: 105, type: 'skill', category: '授業', text: '評価・指示', titleLines: ['評価', '指示'], description: '子どもの言動に対して適切なフィードバックや指示を行ったか？', imageUrl: '/B5.png' },
  { id: 106, type: 'skill', category: '授業', text: '板書', titleLines: ['板書'], description: '板書は見やすく学習の支援になっているか？', imageUrl: '/B6.png' },
  { id: 107, type: 'skill', category: '授業', text: '個別対応', titleLines: ['個別対応'], description: '理解の遅い子どもに個別に対応できているか？', imageUrl: '/B7.png' },
  { id: 108, type: 'skill', category: '授業', text: 'ノート指導', titleLines: ['ノート指導'], description: 'ノート指導を適宜取り入れ学習の効果を上げているか？', imageUrl: '/B8.png' },
  { id: 109, type: 'skill', category: '常時', text: '児童・生徒への意欲喚起', titleLines: ['児童・生徒への', '意欲喚起'], description: '子どもの様子を把握して、適切な声かけができているか？', imageUrl: '/B9.png' },
  { id: 110, type: 'skill', category: '常時', text: 'パターン化・学習規律', titleLines: ['パターン化', '学習規律'], description: '学習規律や授業のパターン化を図っているか？', imageUrl: '/B10.png' },
];

const CATEGORY_COLORS: Record<string, { bg: string, border: string, text: string, icon: string }> = {
  '導入': { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-900', icon: 'bg-pink-600' },
  '展開': { bg: 'bg-orange-200', border: 'border-orange-400', text: 'text-orange-900', icon: 'bg-orange-600' },
  'まとめ': { bg: 'bg-sky-200', border: 'border-sky-400', text: 'text-sky-900', icon: 'bg-sky-600' },
  '準備': { bg: 'bg-amber-200', border: 'border-amber-400', text: 'text-amber-900', icon: 'bg-amber-600' },
  '授業': { bg: 'bg-emerald-200', border: 'border-emerald-400', text: 'text-emerald-900', icon: 'bg-emerald-600' },
  '常時': { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-900', icon: 'bg-purple-600' },
};

const CustomStyles = () => (
  <style>
    {`
      #root { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
      body { margin: 0 !important; padding: 0 !important; display: block !important; }
      @keyframes ripple { 0% { transform: scale(0); opacity: 0.8; } 100% { transform: scale(3); opacity: 0; } }
      @keyframes floatUpFade { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-40px) scale(1.5); opacity: 0; } }
      .animate-ripple { animation: ripple 0.6s ease-out forwards; }
      .animate-float-up { animation: floatUpFade 0.8s ease-out forwards; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// === 授業評価カードコンポーネント ===
interface EvalCardProps {
  item: ItemDef;
  count: number;
  isActive: boolean;
  hasPhotos?: boolean; // 写真が1枚以上あるかどうかの判定用
  onToggle: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onShowDetail: (item: ItemDef) => void;
  onPhotoUpload: (id: number, file: File) => void; 
}

const EvalCard: React.FC<EvalCardProps> = ({ item, count, isActive, hasPhotos, onToggle, onIncrement, onDecrement, onShowDetail, onPhotoUpload }) => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const handlePush = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.ignore-push')) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // 型安全に座標を取得
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) { 
      clientX = e.touches[0].clientX; 
      clientY = e.touches[0].clientY; 
    } else if ('clientX' in e) { 
      clientX = (e as React.MouseEvent).clientX; 
      clientY = (e as React.MouseEvent).clientY; 
    }
    
    const x = clientX - rect.left; 
    const y = clientY - rect.top;
    const newSpark: Spark = { id: Date.now(), x, y };
    
    setSparks((prev) => [...prev, newSpark]);
    onIncrement(item.id);
    setTimeout(() => { setSparks((prev) => prev.filter((spark) => spark.id !== newSpark.id)); }, 800);
  };

  const handleCameraClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) { fileInputRef.current.click(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoUpload(item.id, e.target.files[0]);
    }
    // エラー防止: valueのリセット
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl shadow-sm border transition-all flex flex-col h-28 ${isActive ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
    >
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      <div className="flex items-stretch border-b border-gray-100 bg-gray-50 z-20 ignore-push min-h-[2.5rem]">
        <div className="flex-1 p-1.5 cursor-pointer flex items-center" onClick={() => onToggle(item.id)}>
          <div className={`w-2.5 h-2.5 rounded-full mr-1.5 shrink-0 transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {item.titleLines.map((line, idx) => (
              <h3 key={idx} className={`text-sm sm:text-base font-bold leading-none ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{line}</h3>
            ))}
          </div>
        </div>
        <button className="px-2.5 text-blue-500 hover:bg-blue-100 border-l border-gray-100 transition-colors flex items-center justify-center relative" onClick={() => onShowDetail(item)}>
          <InfoIcon />
          {hasPhotos && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
        </button>
      </div>

      <div className={`flex-1 flex justify-center items-center select-none touch-manipulation ${isActive ? 'cursor-pointer active:bg-blue-50' : ''}`} onClick={(e) => isActive && handlePush(e)} onTouchStart={(e) => isActive && handlePush(e)}>
        <div className={`text-4xl sm:text-5xl font-extrabold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{count}</div>
      </div>

      <button onClick={handleCameraClick} onTouchStart={(e) => e.stopPropagation()} disabled={!isActive}
        className={`absolute bottom-1.5 left-1.5 p-1.5 rounded-full z-20 transition-colors flex items-center justify-center ignore-push ${hasPhotos ? 'bg-blue-100 text-blue-600 shadow-sm border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-sm'} ${!isActive ? 'hidden' : ''}`}
      >
        <CameraIcon />
      </button>

      <button onClick={(e) => { e.stopPropagation(); if (count > 0) onDecrement(item.id); }} onTouchStart={(e) => e.stopPropagation()} disabled={count === 0 || !isActive}
        className={`absolute bottom-1.5 right-1.5 p-1.5 rounded-full z-20 transition-colors flex items-center justify-center ignore-push ${count > 0 && isActive ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-sm' : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'} ${!isActive ? 'hidden' : ''}`}
      >
        <MinusIcon />
      </button>

      {sparks.map((spark) => (
        <svg key={spark.id} className="absolute pointer-events-none z-0" style={{ left: spark.x - 30, top: spark.y - 30, width: 60, height: 60, overflow: 'visible' }}>
          <circle cx="30" cy="30" r="15" fill="none" stroke="#3b82f6" strokeWidth="3" className="animate-ripple" />
          <text x="30" y="35" textAnchor="middle" fill="#2563eb" className="font-bold text-xl animate-float-up">+1</text>
        </svg>
      ))}
    </div>
  );
};

// === 教師スキルカードコンポーネント ===
interface SkillCardProps {
  item: ItemDef;
  rating: SkillRating;
  isActive: boolean;
  onToggle: (id: number) => void;
  onRate: (id: number, rating: SkillRating) => void;
  onShowDetail: (item: ItemDef) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ item, rating, isActive, onToggle, onRate, onShowDetail }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-sm border transition-all flex flex-col h-28 ${isActive ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
      <div className="flex items-stretch border-b border-gray-100 bg-gray-50 z-20 min-h-[2.5rem]">
        <div className="flex-1 p-1.5 cursor-pointer flex items-center" onClick={() => onToggle(item.id)}>
          <div className={`w-2.5 h-2.5 rounded-full mr-1.5 shrink-0 transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {item.titleLines.map((line, idx) => (
              <h3 key={idx} className={`text-sm sm:text-base font-bold leading-none ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{line}</h3>
            ))}
          </div>
        </div>
        <button className="px-2.5 text-blue-500 hover:bg-blue-100 border-l border-gray-100 transition-colors flex items-center justify-center" onClick={() => onShowDetail(item)}>
          <InfoIcon />
        </button>
      </div>

      <div className="flex-1 flex justify-evenly items-center px-1">
        <button onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'double'); }} disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-2xl flex items-center justify-center transition-all ${rating === 'double' && isActive ? 'bg-green-100 text-green-600 border-2 border-green-500 shadow-md transform scale-110 font-bold' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'}`}
        >◎</button>
        <button onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'single'); }} disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl flex items-center justify-center transition-all ${rating === 'single' && isActive ? 'bg-blue-100 text-blue-600 border-2 border-blue-500 shadow-md transform scale-110 font-bold' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'}`}
        >◯</button>
        <button onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'triangle'); }} disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl flex items-center justify-center transition-all ${rating === 'triangle' && isActive ? 'bg-orange-100 text-orange-600 border-2 border-orange-500 shadow-md transform scale-110 font-bold' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'}`}
        >△</button>
      </div>
    </div>
  );
};

// === メインアプリケーション ===
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('home');
  const [detailItem, setDetailItem] = useState<ItemDef | null>(null);

  // 通知とダイアログの状態
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, message: string, onConfirm: () => void } | null>(null);

  // セーブ・ロード関係のモーダル状態
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  
  // 上書き保存用に、現在読み込んでいる記録のIDを保持する
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // アプリのデータ状態 (写真を「配列」で保持して複数枚対応)
  const [itemPhotos, setItemPhotos] = useState<{ [key: number]: Blob[] }>({});
  const [itemPhotoUrls, setItemPhotoUrls] = useState<{ [key: number]: string[] }>({});

  const [evalCounts, setEvalCounts] = useState<{ [key: number]: number }>({});
  const [evalActive, setEvalActive] = useState<{ [key: number]: boolean }>(() => {
    const init: Record<number, boolean> = {}; 
    EVALUATION_ITEMS.forEach(item => { init[item.id] = true; }); 
    return init;
  });

  const [skillRatings, setSkillRatings] = useState<{ [key: number]: SkillRating }>({});
  const [skillActive, setSkillActive] = useState<{ [key: number]: boolean }>(() => {
    const init: Record<number, boolean> = {}; 
    SKILL_ITEMS.forEach(item => { init[item.id] = true; }); 
    return init;
  });

  // Blob(写真配列)から表示用のURL配列を生成する処理（型エラー対応版）
  useEffect(() => {
    const urls: Record<number, string[]> = {};
    Object.keys(itemPhotos).forEach((key) => {
      const id = Number(key);
      if (itemPhotos[id] && itemPhotos[id].length > 0) {
        urls[id] = itemPhotos[id].map((blob) => URL.createObjectURL(blob));
      }
    });
    
    setItemPhotoUrls(urls);
    
    // クリーンアップ
    return () => {
      Object.keys(urls).forEach((key) => {
        const id = Number(key);
        if (urls[id]) {
          urls[id].forEach(url => URL.revokeObjectURL(url));
        }
      });
    };
  }, [itemPhotos]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // アクション処理
  const handleEvalToggle = (id: number) => setEvalActive(p => ({ ...p, [id]: !p[id] }));
  const handleEvalIncrement = useCallback((id: number) => setEvalCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 })), []);
  const handleEvalDecrement = useCallback((id: number) => setEvalCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) })), []);

  const handleSkillToggle = (id: number) => setSkillActive(p => ({ ...p, [id]: !p[id] }));
  const handleSkillRate = (id: number, rating: SkillRating) => setSkillRatings(prev => ({ ...prev, [id]: prev[id] === rating ? null : rating }));

  const showDetail = (item: ItemDef) => {
    setDetailItem(item);
    setCurrentPage('detail');
  };

  // 写真を追加する処理（配列に追加していく）
  const handlePhotoUpload = useCallback((id: number, file: File) => {
    setItemPhotos(prev => {
      const existing = prev[id] || [];
      return { ...prev, [id]: [...existing, file] };
    });
    showToast('写真を追加しました！');
  }, []);

  // === 保存・呼び出し・リセット処理 ===
  const handleResetAll = () => {
    setConfirmDialog({
      isOpen: true,
      message: '入力中のすべての記録と写真、設定を初期化しますか？（保存済みの記録は消えません）',
      onConfirm: () => {
        setEvalCounts({}); setSkillRatings({}); setItemPhotos({});
        setCurrentRecordId(null); // 上書き対象もリセット
        setSaveName('');
        setConfirmDialog(null);
        showToast('データを初期化しました');
      }
    });
  };

  const handleLoadClick = async () => {
    try {
      const records = await getRecordsFromDB();
      setSavedRecords(records);
      setShowLoadModal(true);
    } catch (e) {
      showToast('過去の記録の取得に失敗しました');
    }
  };

  const handleSaveClick = async () => {
    try {
      if (currentRecordId) {
        // すでに呼び出している記録がある場合はそのままの名前をセット
        setShowSaveModal(true);
      } else {
        // 新規作成の場合は重複しない名前(日付など)を自動生成
        const records = await getRecordsFromDB();
        const existingNames = new Set(records.map(r => r.name));
        
        const d = new Date();
        const baseName = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日の記録`;
        let newName = baseName;
        let counter = 2;
        
        while (existingNames.has(newName)) {
          newName = `${baseName}(${counter})`;
          counter++;
        }
        setSaveName(newName);
        setShowSaveModal(true);
      }
    } catch (e) {
      showToast('保存の準備に失敗しました');
    }
  };

  const executeSave = async () => {
    if (!saveName.trim()) {
      showToast('名前を入力してください');
      return;
    }
    
    // 上書き保存時は既存のIDを使い、新規なら新しくIDを発行
    const targetId = currentRecordId || Date.now().toString();
    
    const record: any = {
      id: targetId,
      name: saveName.trim(),
      createdAt: Date.now(), 
      evalCounts, skillRatings, itemPhotos, evalActive, skillActive
    };

    // 上書き保存の場合は、元の作成日時を維持する
    if (currentRecordId) {
      try {
        const existingRecords = await getRecordsFromDB();
        const existing = existingRecords.find(r => r.id === currentRecordId);
        if (existing) record.createdAt = existing.createdAt;
      } catch (e) {
        // エラー時は何もしない
      }
    }

    try {
      await saveRecordToDB(record);
      setCurrentRecordId(targetId); // これで次回からも上書きになる
      setShowSaveModal(false);
      showToast(currentRecordId ? '記録を上書き保存しました！' : '記録を保存しました！');
    } catch (e) {
      showToast('保存に失敗しました');
    }
  };

  const executeLoad = (record: any) => {
    setConfirmDialog({
      isOpen: true,
      message: `「${record.name}」を呼び出しますか？（現在入力中のデータは上書きされます）`,
      onConfirm: () => {
        setEvalCounts(record.evalCounts || {});
        setSkillRatings(record.skillRatings || {});
        
        // 型の不一致エラーを回避するための安全なデータ復元処理
        const loadedPhotos = record.itemPhotos || {};
        const migratedPhotos: Record<number, Blob[]> = {};
        
        Object.keys(loadedPhotos).forEach((key) => {
          const id = Number(key);
          const photoData = loadedPhotos[key as keyof typeof loadedPhotos];
          migratedPhotos[id] = Array.isArray(photoData) ? photoData : [photoData];
        });
        
        setItemPhotos(migratedPhotos);
        setEvalActive(record.evalActive || {});
        setSkillActive(record.skillActive || {});
        
        setCurrentRecordId(record.id); // 呼び出した記録を「現在の記録」として保持
        setSaveName(record.name);
        
        setShowLoadModal(false);
        setConfirmDialog(null);
        showToast('記録を呼び出しました');
      }
    });
  };

  const executeDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      message: `保存した記録「${name}」を削除してもよろしいですか？`,
      onConfirm: async () => {
        await deleteRecordFromDB(id);
        if (id === currentRecordId) {
           setCurrentRecordId(null);
           setSaveName('');
        }
        const records = await getRecordsFromDB();
        setSavedRecords(records);
        setConfirmDialog(null);
        showToast('記録を削除しました');
      }
    });
  };

  // 集計
  const totalEvalCount = EVALUATION_ITEMS.reduce((sum, item) => evalActive[item.id] ? sum + (evalCounts[item.id] || 0) : sum, 0);
  let doubleCount = 0, singleCount = 0, triangleCount = 0;
  SKILL_ITEMS.forEach(item => {
    if (skillActive[item.id]) {
      if (skillRatings[item.id] === 'double') doubleCount++;
      if (skillRatings[item.id] === 'single') singleCount++;
      if (skillRatings[item.id] === 'triangle') triangleCount++;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <CustomStyles />
      
      <div className="w-full sm:max-w-md mx-auto bg-white min-h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* === トースト通知 === */}
        {toast && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-[70] transition-opacity animate-in fade-in slide-in-from-top-4 whitespace-nowrap font-bold text-sm">
            {toast}
          </div>
        )}

        {/* === 確認ダイアログ === */}
        {confirmDialog?.isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
              <h3 className="text-base font-bold text-gray-800 mb-6 leading-relaxed text-center">{confirmDialog.message}</h3>
              <div className="flex space-x-3">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">キャンセル</button>
                <button onClick={confirmDialog.onConfirm} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700">OK</button>
              </div>
            </div>
          </div>
        )}

        {/* === 保存モーダル === */}
        {showSaveModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-4 duration-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <SaveIcon /> <span className="ml-2">{currentRecordId ? '記録を上書き保存' : '記録を新規保存'}</span>
              </h3>
              <p className="text-xs text-gray-500 mb-2">点数、評価、撮影した写真のすべてが保存されます。</p>
              <input 
                type="text" 
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="保存する名前を入力"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 mb-6 focus:outline-none focus:border-blue-500 font-bold text-gray-700 bg-gray-50"
              />
              <div className="flex space-x-3">
                <button onClick={() => setShowSaveModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">キャンセル</button>
                <button onClick={executeSave} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700">
                  {currentRecordId ? '上書きする' : '保存する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === 呼び出しモーダル === */}
        {showLoadModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center shrink-0">
                <FolderIcon /> <span className="ml-2">過去の記録を呼び出す</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar mb-6">
                {savedRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 font-medium">保存された記録はありません。</p>
                ) : (
                  savedRecords.map(record => (
                    <div key={record.id} className="border-2 border-gray-100 rounded-xl p-3 flex justify-between items-center bg-gray-50 hover:border-blue-300 transition-colors">
                      <div className="flex-1 cursor-pointer pr-2" onClick={() => executeLoad(record)}>
                        <h4 className="font-bold text-gray-800 text-base">{record.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(record.createdAt).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => executeDelete(record.id, record.name)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 border border-gray-200 bg-white"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button onClick={() => setShowLoadModal(false)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 shrink-0">
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* === ホーム画面 === */}
        {currentPage === 'home' && (
          <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-white overflow-y-auto no-scrollbar">
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-8">
              
              <div className="text-center space-y-2 pt-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">授業評価<br/>プログラム</h1>
                <p className="text-lg sm:text-xl font-bold text-gray-500 tracking-[0.3em]">-S.Aoki-</p>
              </div>

              <div className="w-full space-y-4 px-2">
                <button onClick={() => setCurrentPage('evaluation')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-between px-6">
                  <span className="flex items-center"><span className="w-2 h-8 bg-blue-400 rounded-full mr-3"></span>授業の設定と工夫</span>
                  <ChevronRightIcon />
                </button>
                <button onClick={() => setCurrentPage('skill')} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-between px-6">
                  <span className="flex items-center"><span className="w-2 h-8 bg-green-400 rounded-full mr-3"></span>教師の技能の発揮</span>
                  <ChevronRightIcon />
                </button>
              </div>

              {/* セーブ・ロードボタンのエリア */}
              <div className="w-full px-2">
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={handleSaveClick}
                    className="flex-1 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold text-base shadow-sm border-2 border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all flex flex-col items-center justify-center"
                  >
                    <SaveIcon />
                    <span className="mt-1">記録を保存</span>
                  </button>
                  
                  <button 
                    onClick={handleLoadClick}
                    className="flex-1 py-4 bg-teal-50 text-teal-700 rounded-2xl font-bold text-base shadow-sm border-2 border-teal-100 hover:bg-teal-100 active:scale-95 transition-all flex flex-col items-center justify-center"
                  >
                    <FolderIcon />
                    <span className="mt-1">記録を呼出</span>
                  </button>
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4 mx-2">
                <h2 className="text-center font-bold text-gray-700 border-b pb-2">現在の集計結果</h2>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm sm:text-base font-bold text-gray-600">授業評価 合計点:</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-blue-600">{totalEvalCount}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-sm sm:text-base font-bold text-gray-600 block mb-3 px-2">教師スキル 評価数:</span>
                  <div className="flex justify-between px-2">
                    <div className="flex flex-col items-center bg-green-50 px-4 py-2 rounded-xl">
                      <span className="text-xl sm:text-2xl text-green-600 font-bold mb-1">◎</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-800">{doubleCount}</span>
                    </div>
                    <div className="flex flex-col items-center bg-blue-50 px-4 py-2 rounded-xl">
                      <span className="text-xl sm:text-2xl text-blue-600 font-bold mb-1">◯</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-800">{singleCount}</span>
                    </div>
                    <div className="flex flex-col items-center bg-orange-50 px-4 py-2 rounded-xl">
                      <span className="text-xl sm:text-2xl text-orange-600 font-bold mb-1">△</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-800">{triangleCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleResetAll} className="flex items-center text-sm text-red-500 font-medium px-5 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors pb-6">
                <span className="mr-2 flex items-center"><RotateCcwIcon /></span>データ初期化
              </button>
            </main>
          </div>
        )}

        {/* === 授業評価プログラム画面 === */}
        {currentPage === 'evaluation' && (
          <div className="flex-1 flex flex-col bg-gray-50 h-full">
            <header className="bg-white pt-12 pb-3 px-3 shadow-sm z-20 flex justify-between items-center shrink-0 border-b-2 border-blue-500">
              <button onClick={() => setCurrentPage('home')} className="p-2 text-sm sm:text-base text-gray-600 flex items-center hover:bg-gray-100 rounded-lg">
                <HomeIcon /><span className="ml-1 hidden sm:inline">表紙へ</span>
              </button>
              <h1 className="text-base sm:text-lg font-bold text-gray-800">授業の設定と工夫</h1>
              <button onClick={() => setCurrentPage('skill')} className="p-2 text-sm sm:text-base text-green-600 font-bold flex items-center bg-green-50 rounded-lg">
                教師スキル <ChevronRightIcon />
              </button>
            </header>
            <main className="flex-1 overflow-y-auto p-2 sm:p-3 no-scrollbar space-y-4 pb-12">
              {['導入', '展開', 'まとめ'].map((category) => {
                const colors = CATEGORY_COLORS[category];
                return (
                <div key={category} className={`p-3 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-sm`}>
                  <h2 className={`text-base sm:text-xl font-extrabold ${colors.text} mb-3 flex items-center pl-1`}>
                    <span className={`w-1.5 h-6 ${colors.icon} rounded-full mr-2`}></span>
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {EVALUATION_ITEMS.filter(item => item.category === category).map((item) => (
                      <EvalCard
                        key={item.id}
                        item={item}
                        count={evalCounts[item.id] || 0}
                        isActive={evalActive[item.id]}
                        hasPhotos={itemPhotoUrls[item.id] && itemPhotoUrls[item.id].length > 0}
                        onToggle={handleEvalToggle}
                        onIncrement={handleEvalIncrement}
                        onDecrement={handleEvalDecrement}
                        onShowDetail={showDetail}
                        onPhotoUpload={handlePhotoUpload}
                      />
                    ))}
                  </div>
                </div>
              )})}
            </main>
          </div>
        )}

        {/* === 教師スキル画面 === */}
        {currentPage === 'skill' && (
          <div className="flex-1 flex flex-col bg-gray-50 h-full">
            <header className="bg-white pt-12 pb-3 px-3 shadow-sm z-20 flex justify-between items-center shrink-0 border-b-2 border-green-500">
              <button onClick={() => setCurrentPage('home')} className="p-2 text-sm sm:text-base text-gray-600 flex items-center hover:bg-gray-100 rounded-lg">
                <HomeIcon /><span className="ml-1 hidden sm:inline">表紙へ</span>
              </button>
              <h1 className="text-base sm:text-lg font-bold text-gray-800">教師の技能の発揮</h1>
              <button onClick={() => setCurrentPage('evaluation')} className="p-2 text-sm sm:text-base text-blue-600 font-bold flex items-center bg-blue-50 rounded-lg">
                授業評価 <ChevronRightIcon />
              </button>
            </header>
            <main className="flex-1 overflow-y-auto p-2 sm:p-3 no-scrollbar space-y-4 pb-12">
              {['準備', '授業', '常時'].map((category) => {
                const colors = CATEGORY_COLORS[category];
                return (
                <div key={category} className={`p-3 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-sm`}>
                  <h2 className={`text-base sm:text-xl font-extrabold ${colors.text} mb-3 flex items-center pl-1`}>
                    <span className={`w-1.5 h-6 ${colors.icon} rounded-full mr-2`}></span>
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {SKILL_ITEMS.filter(item => item.category === category).map((item) => (
                      <SkillCard
                        key={item.id}
                        item={item}
                        rating={skillRatings[item.id] || null}
                        isActive={skillActive[item.id]}
                        onToggle={handleSkillToggle}
                        onRate={handleSkillRate}
                        onShowDetail={showDetail}
                      />
                    ))}
                  </div>
                </div>
              )})}
            </main>
          </div>
        )}

        {/* === 詳細説明画面 === */}
        {currentPage === 'detail' && detailItem && (
          <div className="flex-1 flex flex-col bg-white h-full animate-in fade-in slide-in-from-right-4 duration-200">
            <header className="bg-white pt-12 pb-3 px-4 shadow-sm z-20 flex items-center shrink-0 border-b">
              <button 
                onClick={() => setCurrentPage(detailItem.type === 'eval' ? 'evaluation' : 'skill')} 
                className="p-2 -ml-2 text-blue-600 flex items-center font-bold text-lg"
              >
                <ChevronLeftIcon /> 戻る
              </button>
            </header>
            <main className="flex-1 p-6 sm:p-8 overflow-y-auto no-scrollbar">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${detailItem.type === 'eval' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {detailItem.type === 'eval' ? '授業の設定と工夫' : '教師の技能の発揮'}
                </span>
                <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full border ${detailItem.type === 'eval' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                  {detailItem.category}
                </span>
                <h1 className="text-3xl font-extrabold text-gray-800 leading-tight w-full mt-3">{detailItem.text}</h1>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <h2 className="text-base font-bold text-gray-500 mb-2 flex items-center">
                  <InfoIcon /> <span className="ml-1">評価のポイント</span>
                </h2>
                <p className="text-gray-800 text-xl leading-relaxed font-medium">
                  {detailItem.description}
                </p>
              </div>
              
              {/* === 画像・写真表示エリア === */}
              <div className="w-full bg-white rounded-2xl flex flex-col items-center p-4 shadow-sm border border-gray-100">
                
                {/* 1. 参考画像（常に一番上に表示） */}
                <div className="w-full flex flex-col items-center pb-6">
                  <span className="text-sm font-bold text-gray-400 mb-3 flex items-center">
                    <ImageIcon /> <span className="ml-1">参考画像</span>
                  </span>
                  
                  {detailItem.imageUrl ? (
                    <img 
                      src={encodeURI(detailItem.imageUrl)} 
                      alt={detailItem.text} 
                      className={`max-w-full object-contain rounded-xl border border-gray-100 ${itemPhotoUrls[detailItem.id] && itemPhotoUrls[detailItem.id].length > 0 ? 'max-h-[250px] opacity-80' : 'max-h-[400px] shadow-sm'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  <div className={`text-gray-400 font-medium text-center px-4 leading-loose flex flex-col items-center justify-center ${detailItem.imageUrl ? 'hidden' : ''}`}>
                    <ImageIcon />
                    <span className="mt-2 text-base">画像ファイル（{detailItem.imageUrl}）が<br/>見つかりません</span>
                  </div>
                </div>

                {/* 2. 撮影された写真リスト（参考画像の下に順番に並べる） */}
                {itemPhotoUrls[detailItem.id] && itemPhotoUrls[detailItem.id].length > 0 && (
                  <div className="w-full flex flex-col items-center pt-6 border-t border-dashed border-gray-200 space-y-6">
                    <span className="text-sm font-bold text-blue-500 flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      <CameraIcon /> <span className="ml-1">撮影した写真 ({itemPhotoUrls[detailItem.id].length}枚)</span>
                    </span>
                    
                    {/* 写真を順番にすべて表示 */}
                    {itemPhotoUrls[detailItem.id].map((url, idx) => (
                      <div key={idx} className="w-full relative">
                        <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
                          {idx + 1}枚目
                        </span>
                        <img 
                          src={url} 
                          alt={`撮影した写真 ${idx + 1}`} 
                          className="max-w-full w-full object-contain rounded-xl shadow-md border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </main>
          </div>
        )}

      </div>
    </div>
  );
}
