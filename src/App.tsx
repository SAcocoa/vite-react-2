import React, { useState, useCallback, useRef } from 'react';

// === アイコンコンポーネント ===
const RotateCcwIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
const MinusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const InfoIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const HomeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ImageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;

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

// === カテゴリカラーの定義 ===
const CATEGORY_COLORS: Record<string, { bg: string, border: string, text: string, icon: string }> = {
  '導入': { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-900', icon: 'bg-pink-600' },
  '展開': { bg: 'bg-orange-200', border: 'border-orange-400', text: 'text-orange-900', icon: 'bg-orange-600' },
  'まとめ': { bg: 'bg-sky-200', border: 'border-sky-400', text: 'text-sky-900', icon: 'bg-sky-600' },
  '準備': { bg: 'bg-amber-200', border: 'border-amber-400', text: 'text-amber-900', icon: 'bg-amber-600' },
  '授業': { bg: 'bg-emerald-200', border: 'border-emerald-400', text: 'text-emerald-900', icon: 'bg-emerald-600' },
  '常時': { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-900', icon: 'bg-purple-600' },
};

// === SVGアニメーション & グローバルCSSリセット ===
const CustomStyles = () => (
  <style>
    {`
      /* Vite初期設定の不要な余白を強制リセット */
      #root {
        max-width: none !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: left !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
      }

      /* アニメーション定義 */
      @keyframes ripple {
        0% { transform: scale(0); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
      @keyframes floatUpFade {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
      }
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
  onToggle: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onShowDetail: (item: ItemDef) => void;
}

const EvalCard: React.FC<EvalCardProps> = ({ item, count, isActive, onToggle, onIncrement, onDecrement, onShowDetail }) => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const handlePush = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.ignore-push')) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) return;
    lastTapRef.current = now;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newSpark: Spark = { id: Date.now(), x, y };
    setSparks((prev) => [...prev, newSpark]);

    onIncrement(item.id);

    setTimeout(() => {
      setSparks((prev) => prev.filter((spark) => spark.id !== newSpark.id));
    }, 800);
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl shadow-sm border transition-all flex flex-col h-28 ${
        isActive ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-stretch border-b border-gray-100 bg-gray-50 z-20 ignore-push min-h-[2.5rem]">
        <div 
          className="flex-1 p-1.5 cursor-pointer flex items-center" 
          onClick={() => onToggle(item.id)}
        >
          <div className={`w-2.5 h-2.5 rounded-full mr-1.5 shrink-0 transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {item.titleLines.map((line, idx) => (
              <h3 key={idx} className={`text-sm sm:text-base font-bold leading-none ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {line}
              </h3>
            ))}
          </div>
        </div>
        <button 
          className="px-2.5 text-blue-500 hover:bg-blue-100 border-l border-gray-100 transition-colors flex items-center justify-center"
          onClick={() => onShowDetail(item)}
        >
          <InfoIcon />
        </button>
      </div>

      <div 
        className={`flex-1 flex justify-center items-center select-none touch-manipulation ${isActive ? 'cursor-pointer active:bg-blue-50' : ''}`}
        onClick={(e) => isActive && handlePush(e)}
        onTouchStart={(e) => isActive && handlePush(e)}
      >
        <div className={`text-4xl sm:text-5xl font-extrabold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          {count}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (count > 0) onDecrement(item.id);
        }}
        onTouchStart={(e) => e.stopPropagation()}
        disabled={count === 0 || !isActive}
        className={`absolute bottom-1.5 right-1.5 p-1.5 rounded-full z-20 transition-colors flex items-center justify-center ignore-push ${
          count > 0 && isActive 
            ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-sm' 
            : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
        } ${!isActive ? 'hidden' : ''}`}
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
    <div className={`relative overflow-hidden rounded-2xl shadow-sm border transition-all flex flex-col h-28 ${
      isActive ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="flex items-stretch border-b border-gray-100 bg-gray-50 z-20 min-h-[2.5rem]">
        <div 
          className="flex-1 p-1.5 cursor-pointer flex items-center" 
          onClick={() => onToggle(item.id)}
        >
          <div className={`w-2.5 h-2.5 rounded-full mr-1.5 shrink-0 transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {item.titleLines.map((line, idx) => (
              <h3 key={idx} className={`text-sm sm:text-base font-bold leading-none ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {line}
              </h3>
            ))}
          </div>
        </div>
        <button 
          className="px-2.5 text-blue-500 hover:bg-blue-100 border-l border-gray-100 transition-colors flex items-center justify-center"
          onClick={() => onShowDetail(item)}
        >
          <InfoIcon />
        </button>
      </div>

      <div className="flex-1 flex justify-evenly items-center px-1">
        <button 
          onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'double'); }}
          disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-2xl flex items-center justify-center transition-all ${
            rating === 'double' && isActive 
              ? 'bg-green-100 text-green-600 border-2 border-green-500 shadow-md transform scale-110 font-bold' 
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >◎</button>
        <button 
          onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'single'); }}
          disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl flex items-center justify-center transition-all ${
            rating === 'single' && isActive 
              ? 'bg-blue-100 text-blue-600 border-2 border-blue-500 shadow-md transform scale-110 font-bold' 
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >◯</button>
        <button 
          onClick={(e) => { e.stopPropagation(); isActive && onRate(item.id, 'triangle'); }}
          disabled={!isActive}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl flex items-center justify-center transition-all ${
            rating === 'triangle' && isActive 
              ? 'bg-orange-100 text-orange-600 border-2 border-orange-500 shadow-md transform scale-110 font-bold' 
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
          }`}
        >△</button>
      </div>
    </div>
  );
};

// === メインアプリケーション ===
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('home');
  const [detailItem, setDetailItem] = useState<ItemDef | null>(null);

  const [evalCounts, setEvalCounts] = useState<{ [key: number]: number }>({});
  const [evalActive, setEvalActive] = useState<{ [key: number]: boolean }>(() => {
    const init: any = {};
    EVALUATION_ITEMS.forEach(item => init[item.id] = true);
    return init;
  });

  const [skillRatings, setSkillRatings] = useState<{ [key: number]: SkillRating }>({});
  const [skillActive, setSkillActive] = useState<{ [key: number]: boolean }>(() => {
    const init: any = {};
    SKILL_ITEMS.forEach(item => init[item.id] = true);
    return init;
  });

  const handleEvalToggle = (id: number) => setEvalActive(p => ({ ...p, [id]: !p[id] }));
  const handleEvalIncrement = useCallback((id: number) => {
    setEvalCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);
  const handleEvalDecrement = useCallback((id: number) => {
    setEvalCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }, []);

  const handleSkillToggle = (id: number) => setSkillActive(p => ({ ...p, [id]: !p[id] }));
  const handleSkillRate = (id: number, rating: SkillRating) => {
    setSkillRatings(prev => ({ ...prev, [id]: prev[id] === rating ? null : rating }));
  };

  const showDetail = (item: ItemDef) => {
    setDetailItem(item);
    setCurrentPage('detail');
  };

  const handleResetAll = () => {
    if (window.confirm('すべての記録と設定を初期化しますか？')) {
      setEvalCounts({});
      setSkillRatings({});
      const resetEvalActive: any = {}; EVALUATION_ITEMS.forEach(i => resetEvalActive[i.id] = true);
      const resetSkillActive: any = {}; SKILL_ITEMS.forEach(i => resetSkillActive[i.id] = true);
      setEvalActive(resetEvalActive);
      setSkillActive(resetSkillActive);
    }
  };

  const totalEvalCount = EVALUATION_ITEMS.reduce((sum, item) => {
    return evalActive[item.id] ? sum + (evalCounts[item.id] || 0) : sum;
  }, 0);

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
      
      {/* PC表示時はスマホサイズ(max-w-md)に制限、スマホでは横幅いっぱい(w-full)になるように設定 */}
      <div className="w-full sm:max-w-md mx-auto bg-white min-h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* === ホーム画面 === */}
        {currentPage === 'home' && (
          <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-white overflow-y-auto no-scrollbar">
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-10">
              
              <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">授業評価<br/>プログラム</h1>
                <p className="text-lg sm:text-xl font-bold text-gray-500 tracking-[0.3em]">-S.Aoki-</p>
              </div>

              {/* 幅を広げて余白を減らしました */}
              <div className="w-full space-y-4 px-2">
                <button 
                  onClick={() => setCurrentPage('evaluation')}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-between px-6"
                >
                  <span className="flex items-center"><span className="w-2 h-8 bg-blue-400 rounded-full mr-3"></span>授業の設定と工夫</span>
                  <ChevronRightIcon />
                </button>
                <button 
                  onClick={() => setCurrentPage('skill')}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-between px-6"
                >
                  <span className="flex items-center"><span className="w-2 h-8 bg-green-400 rounded-full mr-3"></span>教師の技能の発揮</span>
                  <ChevronRightIcon />
                </button>
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

              <button 
                onClick={handleResetAll}
                className="flex items-center text-sm text-red-500 font-medium px-5 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
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
            {/* 余白を削り画面いっぱいに表示 (p-2 sm:p-3) */}
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
                        onToggle={handleEvalToggle}
                        onIncrement={handleEvalIncrement}
                        onDecrement={handleEvalDecrement}
                        onShowDetail={showDetail}
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
              
              {/* === 画像表示エリア === */}
              <div className="w-full bg-white rounded-2xl flex items-center justify-center p-2 min-h-[250px] overflow-hidden relative">
                {detailItem.imageUrl ? (
                  <img 
                    src={encodeURI(detailItem.imageUrl)} 
                    alt={detailItem.text} 
                    className="max-w-full max-h-[400px] object-contain rounded-xl shadow-sm border border-gray-100"
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
            </main>
          </div>
        )}

      </div>
    </div>
  );
}
