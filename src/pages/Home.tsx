import { useNavigate } from 'react-router';
import { Coffee, UtensilsCrossed, Cookie, ArrowRight, Sparkles } from 'lucide-react';
import ScribbleBadge from '@/components/ScribbleBadge';

const categories = [
  {
    id: 'breakfast',
    label: '早餐',
    subtitle: 'Breakfast',
    description: '开启活力满满的一天',
    icon: Coffee,
    image: '/foods/avocado-toast.jpg',
    tag: '高纤维',
    tagType: 'circle' as const,
  },
  {
    id: 'main',
    label: '正餐',
    subtitle: 'Main Course',
    description: '营养均衡的能量补给',
    icon: UtensilsCrossed,
    image: '/foods/chicken.jpg',
    tag: '高蛋白',
    tagType: 'underline' as const,
  },
  {
    id: 'snack',
    label: '零食',
    subtitle: 'Snack',
    description: '健康解馋的小确幸',
    icon: Cookie,
    image: '/foods/acai-bowl.jpg',
    tag: '低卡',
    tagType: 'circle' as const,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-[#b6ff53]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-[#64c896]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-[#b6ff53]" />
          <span className="text-[#8a8a8a] text-sm tracking-widest uppercase font-medium">
            STU East Coast Campus
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white text-center tracking-tight leading-[1.1] mb-6">
          汕头大学
          <br />
          <span className="text-[#b6ff53]">东海岸</span>
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white/90">
            健康饮食指南
          </span>
        </h1>

        <p className="text-[#8a8a8a] text-lg md:text-xl text-center max-w-lg mb-12 leading-relaxed">
          今天吃什么？让健康帮你做决定
        </p>

        <button
          onClick={() => navigate('/explore')}
          className="group relative px-10 py-4 bg-[#b6ff53] text-[#0a0a0a] font-semibold text-lg rounded-full
            transition-all duration-500 hover:scale-105 hover:glow-green-strong
            active:scale-95"
        >
          <span className="flex items-center gap-3">
            开始探索
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>
      </section>

      {/* Category Cards */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/explore?category=${cat.id}`)}
              className="group relative bg-[#141414] rounded-2xl overflow-hidden border border-white/[0.06]
                transition-all duration-500 hover:border-[#b6ff53]/30 hover:scale-[1.02]
                hover:glow-green text-left"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                
                {/* Scribble Tag */}
                <div className="absolute top-4 left-4">
                  <ScribbleBadge type={cat.tagType} delay={800 + index * 200}>
                    <span className="font-kalam text-[#b6ff53] text-sm font-bold px-2 py-1">
                      {cat.tag}
                    </span>
                  </ScribbleBadge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <cat.icon className="w-5 h-5 text-[#b6ff53]" />
                  <span className="text-[#8a8a8a] text-xs tracking-wider uppercase">
                    {cat.subtitle}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#b6ff53] transition-colors duration-300">
                  {cat.label}
                </h3>
                <p className="text-[#8a8a8a] text-sm">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/[0.04]">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-[#8a8a8a] text-sm">食物管理</span>
          <span className="text-white/10">|</span>
          <span className="text-[#8a8a8a] text-sm">汕头大学东海岸校区</span>
        </div>
        <p className="text-[#8a8a8a]/50 text-xs">
          健康饮食，从今天开始
        </p>
      </footer>
    </div>
  );
}
