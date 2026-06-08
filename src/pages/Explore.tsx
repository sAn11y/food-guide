import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import gsap from 'gsap';
import { ArrowLeft, RotateCcw, Flame, MapPin, Tag, Sparkles } from 'lucide-react';
import { getRandomByCategory, getByCategory, getAllFoods, type Food } from '@/lib/foodStore';
import ScribbleBadge from '@/components/ScribbleBadge';

/* ─────────────────────── constants ─────────────────────── */

const categoryLabels: Record<string, { name: string; subtitle: string }> = {
  breakfast: { name: '早餐', subtitle: 'Breakfast' },
  main: { name: '正餐', subtitle: 'Main Course' },
  snack: { name: '零食', subtitle: 'Snack' },
};

const imageMap: { keywords: string[]; image: string }[] = [
  { keywords: ['鸡胸', '鸡肉', '鸡'], image: '/foods/chicken.jpg' },
  { keywords: ['牛肉', '藜麦'], image: '/foods/beef-rice.jpg' },
  { keywords: ['沙拉', '蔬菜', '菜'], image: '/foods/salad.jpg' },
  { keywords: ['牛油果', '全麦', '面包', '吐司', '蛋', '玉米', '豆浆', '燕麦', '酸奶'], image: '/foods/avocado-toast.jpg' },
  { keywords: ['果', '巧克力', '坚果', '香蕉', '能量棒', '果干'], image: '/foods/acai-bowl.jpg' },
  { keywords: ['气泡', '水', '饮', '柠檬'], image: '/foods/sparkling.jpg' },
  { keywords: ['鱼', '三文鱼', '海鲜'], image: '/foods/salad.jpg' },
];

const fallbackImages = [
  '/foods/salad.jpg',
  '/foods/beef-rice.jpg',
  '/foods/chicken.jpg',
  '/foods/avocado-toast.jpg',
  '/foods/sparkling.jpg',
  '/foods/acai-bowl.jpg',
];

const scribbleTags = ['高蛋白', '低脂', '高纤维', '均衡', '轻食', '营养'];

const STREAM_CARD_WIDTH = 160;   // px — includes gap

/* ─────────────────────── helpers ─────────────────────── */

function matchImage(name: string): string {
  const lower = name.toLowerCase();
  for (const entry of imageMap) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.image;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return fallbackImages[Math.abs(hash) % fallbackImages.length];
}

function getFoodImage(food: { name: string; imageUrl: string | null }): string {
  if (food.imageUrl) return food.imageUrl;
  return matchImage(food.name);
}

interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories: number;
  source: string;
  tags: string;
  imageUrl: string | null;
  createdAt: Date | null;
}

/* ═════════════════════════ COMPONENT ═════════════════════════ */

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'breakfast';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  /* phases: idle | preparing | streaming | result */
  const [phase, setPhase] = useState<'idle' | 'preparing' | 'streaming' | 'result'>('idle');
  const [result, setResult] = useState<FoodItem | null>(null);
  const [prepStep, setPrepStep] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const streamTrackRef = useRef<HTMLDivElement>(null);
  const phaseOverlayRef = useRef<HTMLDivElement>(null);

  const [categoryFoods, setCategoryFoods] = useState<Food[]>([]);
  const [randomFood, setRandomFood] = useState<Food | null>(null);

  useEffect(() => {
    if (!selectedCategory) return;
    setCategoryFoods(getByCategory(selectedCategory));
    setRandomFood(getRandomByCategory(selectedCategory));
  }, [selectedCategory]);

  const foods = categoryFoods || [];

  /* ── Build 6 grid items ── */
  const gridItems = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const food = foods[i];
    return food
      ? { id: food.id, name: food.name, image: getFoodImage(food), tag: food.tags.split(',')[0] || scribbleTags[i % 6] }
      : { id: i, name: '推荐中...', image: fallbackImages[i % 6], tag: scribbleTags[i % 6] };
  }), [foods]);

  useEffect(() => { setSelectedCategory(categoryParam); }, [categoryParam]);

  /* ═══════════════ PHASE 1: PREPARING ═══════════════ */

  const runPreparingPhase = useCallback((pickedFood: FoodItem) => {
    setPhase('preparing');
    setPrepStep(0);

    const steps = [
      { delay: 0,    index: 0 },
      { delay: 550,  index: 1 },
      { delay: 1100, index: 2 },
    ];

    steps.forEach(({ delay, index }) => {
      setTimeout(() => setPrepStep(index), delay);
    });

    // After 1.8s → Phase 2
    setTimeout(() => {
      runStreamingPhase(pickedFood);
    }, 1800);
  }, []);

  /* ═══════════════ PHASE 2: DATA STREAM ═══════════════ */

  const runStreamingPhase = useCallback((pickedFood: FoodItem) => {
    setPhase('streaming');

    // Wait one frame for DOM to render the track
    requestAnimationFrame(() => {
      const track = streamTrackRef.current;
      if (!track) return;

      const vw = window.innerWidth;
      const centerX = vw / 2;

      /* Build the stream array:
         [pickedFood] is placed at the tail so it lands in the centre. */
      const pool = foods.length > 0 ? foods : [pickedFood];
      const repeatCount = Math.max(5, Math.ceil(20 / pool.length));
      const poolRepeated: FoodItem[] = [];
      for (let r = 0; r < repeatCount; r++) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        poolRepeated.push(...shuffled);
      }
      const totalItems = poolRepeated.length;
      const pickedIndex = totalItems; // second copy tail
      const streamItems: FoodItem[] = [...poolRepeated, pickedFood, ...poolRepeated];

      /* Render cards into track via React state won't work for GSAP x —
         we write them directly into the DOM ref to avoid re-render flashes. */
      track.innerHTML = '';
      streamItems.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'stream-card absolute flex-shrink-0 flex flex-col items-center justify-center transition-none';
        card.style.cssText = `
          left: ${i * STREAM_CARD_WIDTH}px;
          width: ${STREAM_CARD_WIDTH - 16}px;
          top: 50%;
          transform: translateY(-50%);
        `;

        const isCenter = i === pickedIndex;

        card.innerHTML = `
          <div class="relative w-full aspect-square rounded-2xl overflow-hidden ${isCenter ? 'ring-2 ring-[#b6ff53]/50 shadow-[0_0_30px_rgba(182,255,83,0.15)]' : ''}">
            <img src="${getFoodImage(item)}" class="w-full h-full object-cover ${isCenter ? '' : 'opacity-60'}" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 to-transparent"></div>
          </div>
          <div class="mt-3 text-center">
            <span class="text-xs ${isCenter ? 'text-[#b6ff53] font-bold text-sm' : 'text-white/40'}">${item.name}</span>
          </div>
        `;
        track.appendChild(card);
      });

      /* GSAP animation — start far right, ease out to centre */
      const cardCenter = pickedIndex * STREAM_CARD_WIDTH + STREAM_CARD_WIDTH / 2;
      const endX = centerX - cardCenter;
      const startX = endX + vw * 1.8;

      gsap.set(track, { x: startX });

      gsap.to(track, {
        x: endX,
        duration: 3.3,
        ease: 'expo.out',
        onComplete: () => {
          // small settling pause then → Phase 3
          setTimeout(() => {
            setResult(pickedFood);
            setPhase('result');
          }, 200);
        },
      });
    });
  }, [foods]);

  /* ═══════════════ MASTER: start pick ═══════════════ */

  const startPick = useCallback(async () => {
    if (phase !== 'idle') return;

    // Get random food directly
    let picked: FoodItem | null = null;
    try {
      const randomResult = getRandomByCategory(selectedCategory!);
      setRandomFood(randomResult);
      if (randomResult) picked = randomResult as FoodItem;
    } catch {
      if (foods.length > 0) picked = foods[Math.floor(Math.random() * foods.length)] as FoodItem;
    }
    if (!picked) return;

    // Dim the grid
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0.15,
        filter: 'blur(6px)',
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.inOut',
      });
    }

    runPreparingPhase(picked);
  }, [phase, selectedCategory, foods, runPreparingPhase]);

  /* ═══════════════ RESET ═══════════════ */

  const resetAll = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setPrepStep(0);

    // Restore grid
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    // Clear stream track
    if (streamTrackRef.current) {
      gsap.killTweensOf(streamTrackRef.current);
      streamTrackRef.current.innerHTML = '';
    }
  }, []);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory || phase !== 'idle') return;
    setSelectedCategory(cat);
    setResult(null);
    setPhase('idle');
    navigate(`/explore?category=${cat}`, { replace: true });
  };

  const handleRepick = () => {
    resetAll();
    setTimeout(() => startPick(), 400);
  };

  const categoryInfo = categoryLabels[selectedCategory] || categoryLabels.breakfast;
  const isBusy = phase !== 'idle';

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />

      {/* Header */}
      <header className="relative z-30 px-6 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#8a8a8a] hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="text-center">
          <h2 className="text-white font-bold text-lg">{categoryInfo.name}</h2>
          <span className="text-[#8a8a8a] text-xs tracking-wider uppercase">{categoryInfo.subtitle}</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Category Tabs */}
      <div className="relative z-30 px-6 mb-8">
        <div className="flex justify-center gap-3">
          {Object.entries(categoryLabels).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              disabled={isBusy}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${selectedCategory === key
                  ? 'bg-[#b6ff53] text-[#0a0a0a]'
                  : 'bg-[#141414] text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a]'
                } ${isBusy ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Food Grid (normal / dimmed during pick) ── */}
      <div className="relative z-10 px-6 flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
          {gridItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#141414]"
            >
              <div className="w-full h-full">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <ScribbleBadge type={index % 2 === 0 ? 'circle' : 'underline'} delay={500 + index * 100}>
                    <span className="font-kalam text-[#b6ff53] text-xs font-bold px-1">{item.tag}</span>
                  </ScribbleBadge>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-white text-sm font-medium">{item.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-30 flex justify-center py-8">
        <button
          onClick={startPick}
          disabled={isBusy}
          className={`group relative px-12 py-4 font-semibold text-lg rounded-full transition-all duration-500
            ${isBusy
              ? 'bg-[#141414] text-[#8a8a8a] cursor-not-allowed opacity-0 pointer-events-none'
              : 'bg-[#b6ff53] text-[#0a0a0a] hover:scale-105 hover:glow-green-strong active:scale-95'
            }`}
        >
          <span className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            开始抽取
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════
          PHASE OVERLAY (preparing + streaming)
          ═══════════════════════════════════════════ */}
      {(phase === 'preparing' || phase === 'streaming') && (
        <div
          ref={phaseOverlayRef}
          className="fixed inset-0 z-20 flex flex-col items-center justify-center"
        >
          {/* Subtle backdrop tint */}
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />

          {/* ── Phase 1: Preparing ── */}
          {phase === 'preparing' && (
            <div className="relative flex flex-col items-center">
              {/* Main title */}
              <h3
                className="text-white/90 text-xl md:text-2xl font-medium tracking-wide mb-10"
                style={{ animation: 'info-fade-in 0.6s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                正在分析你的健康饮食选择…
              </h3>

              {/* Status steps */}
              <div className="flex flex-col items-start gap-5">
                {[
                  { label: '早餐数据库已载入',   sub: 'Database loaded' },
                  { label: '营养模型同步中',       sub: 'Nutrition model synced' },
                  { label: '健康推荐计算中',       sub: 'Calculating recommendation' },
                ].map((step, i) => {
                  const active = prepStep >= i;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 transition-all duration-500"
                      style={{
                        opacity: active ? 1 : 0.2,
                        transform: active ? 'translateX(0)' : 'translateX(-8px)',
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${active ? 'bg-[#b6ff53] status-dot-animate' : 'bg-white/20'}`}
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                      <div>
                        <div className={`text-sm font-medium ${active ? 'text-white' : 'text-white/30'}`}>
                          {step.label}
                        </div>
                        <div className={`text-xs tracking-wider ${active ? 'text-[#b6ff53]/60' : 'text-white/15'}`}>
                          {step.sub}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thin progress line at bottom */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-px bg-white/10 overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#b6ff53]/50"
                  style={{
                    width: `${((prepStep + 1) / 3) * 100}%`,
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Phase 2: Data Stream ── */}
          {phase === 'streaming' && (
            <div className="relative w-full h-80 flex flex-col items-center justify-center">
              {/* Track label */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                <span className="text-[#8a8a8a]/50 text-xs tracking-[0.3em] uppercase">Food Data Stream</span>
              </div>

              {/* Stream track container */}
              <div className="relative w-full h-56 stream-track overflow-hidden">
                <div
                  ref={streamTrackRef}
                  className="absolute top-0 h-full"
                  style={{ width: '9999px', willChange: 'transform' }}
                />

                {/* Center focus indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-40 h-52 rounded-2xl border border-[#b6ff53]/10 bg-[#b6ff53]/[0.02]" />
                </div>
              </div>

              {/* Velocity indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="w-16 h-px bg-white/10 overflow-hidden rounded-full">
                  <div className="h-full bg-[#b6ff53]/40 animate-pulse" style={{ width: '100%' }} />
                </div>
                <span className="text-[#8a8a8a]/30 text-[10px] tracking-widest uppercase">Processing</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          PHASE 3: Result Overlay
          ═══════════════════════════════════════════ */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0a0a0a]/70 backdrop-blur-xl"
            style={{ animation: 'fadeIn 0.5s ease forwards' }}
          />
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

          {/* Result Card */}
          <div className="relative w-full max-w-md mx-6">
            <div className="result-enter">
              {/* Food Image */}
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-[#141414]">
                <img
                  src={getFoodImage(result)}
                  alt={result.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />

                {/* Close button */}
                <button
                  onClick={resetAll}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md
                    flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50
                    transition-all duration-200"
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>

              {/* Food Name */}
              <div className="info-stagger-1 text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {result.name}
                </h2>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b6ff53]" />
                  <span className="text-[#8a8a8a] text-sm tracking-wider uppercase">
                    {categoryLabels[result.category]?.name || result.category}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="info-stagger-2 grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#141414]/80 rounded-2xl p-5 border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-[#8a8a8a] text-xs uppercase tracking-wider mb-2">
                    <Flame className="w-3.5 h-3.5 text-[#b6ff53]" />
                    热量
                  </div>
                  <div className="calorie-pop">
                    <span className="text-3xl font-bold text-white font-mono tabular-nums">
                      {result.calories}
                    </span>
                    <span className="text-[#8a8a8a] text-sm ml-1.5">kcal</span>
                  </div>
                </div>

                <div className="bg-[#141414]/80 rounded-2xl p-5 border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-[#8a8a8a] text-xs uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#b6ff53]" />
                    来源
                  </div>
                  <p className="text-white text-sm leading-relaxed line-clamp-2">
                    {result.source}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="info-stagger-3 flex items-center gap-2 mb-8 justify-center">
                <Tag className="w-3.5 h-3.5 text-[#8a8a8a]" />
                <div className="flex flex-wrap gap-2">
                  {result.tags.split(',').map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[#b6ff53]/8 text-[#b6ff53] text-sm rounded-full
                        border border-[#b6ff53]/15 font-medium"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="info-stagger-4 flex gap-3">
                <button
                  onClick={handleRepick}
                  className="flex-1 py-4 bg-[#b6ff53] text-[#0a0a0a] font-semibold rounded-full
                    transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                    flex items-center justify-center gap-2 text-base"
                >
                  <RotateCcw className="w-4 h-4" />
                  再次抽取
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-4 border border-white/10 text-white font-medium rounded-full
                    transition-all duration-300 hover:bg-white/5"
                >
                  关闭
                </button>
              </div>

              {/* Bottom hint */}
              <p className="info-stagger-5 text-center text-[#8a8a8a]/40 text-xs mt-6 tracking-wide">
                汕头大学东海岸校区 · 健康饮食指南
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer spacer */}
      <footer className="relative z-10 py-8 text-center">
        <p className="text-[#8a8a8a]/30 text-xs tracking-wide">
          汕头大学东海岸校区 · 健康饮食指南
        </p>
      </footer>
    </div>
  );
}
