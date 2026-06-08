import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Plus, Pencil, Trash2, Flame, MapPin,
  Coffee, UtensilsCrossed, Cookie, Search, X, Save,
  Upload, Loader2
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

const categoryLabels: Record<string, { name: string; icon: typeof Coffee }> = {
  breakfast: { name: '早餐', icon: Coffee },
  main: { name: '正餐', icon: UtensilsCrossed },
  snack: { name: '零食', icon: Cookie },
};

const categoryOptions = [
  { value: 'breakfast', label: '早餐' },
  { value: 'main', label: '正餐' },
  { value: 'snack', label: '零食' },
];

interface FoodFormData {
  name: string;
  category: 'breakfast' | 'main' | 'snack';
  calories: number;
  source: string;
  tags: string;
  imageUrl: string;
}

const emptyForm: FoodFormData = {
  name: '',
  category: 'breakfast',
  calories: 0,
  source: '',
  tags: '',
  imageUrl: '',
};

export default function Admin() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FoodFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const foodsQuery = trpc.food.list.useQuery();
  const createMutation = trpc.food.create.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate();
      resetForm();
    },
  });
  const updateMutation = trpc.food.update.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate();
      resetForm();
    },
  });
  const deleteMutation = trpc.food.delete.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate();
      setDeleteConfirm(null);
    },
  });

  const foods = foodsQuery.data || [];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.tags.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || food.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setPreviewUrl(null);
  };

  const handleEdit = (food: (typeof foods)[0]) => {
    setFormData({
      name: food.name,
      category: food.category as 'breakfast' | 'main' | 'snack',
      calories: food.calories,
      source: food.source,
      tags: food.tags,
      imageUrl: food.imageUrl || '',
    });
    setPreviewUrl(food.imageUrl);
    setEditingId(food.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
        imageUrl: formData.imageUrl || undefined,
      });
    } else {
      createMutation.mutate({
        ...formData,
        imageUrl: formData.imageUrl || undefined,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate({ id });
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过 5MB');
      return;
    }

    setUploading(true);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        setPreviewUrl(data.url);
      } else {
        alert(data.error || '上传失败');
        setPreviewUrl(null);
      }
    } catch {
      alert('上传出错，请重试');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#8a8a8a] hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="text-white font-bold text-xl">食物管理</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#b6ff53] text-[#0a0a0a] text-sm font-semibold rounded-full
              transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            新增
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />
            <input
              type="text"
              placeholder="搜索食物..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/[0.06] rounded-xl text-white text-sm
                placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#b6ff53]/30 transition-colors"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-[#141414] border border-white/[0.06] rounded-xl text-white text-sm
              focus:outline-none focus:border-[#b6ff53]/30 transition-colors cursor-pointer"
          >
            <option value="all">全部分类</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Food List */}
      <main className="relative z-10 px-6 pb-24">
        {foodsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#b6ff53] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8a8a8a] text-lg">暂无食物数据</p>
            <p className="text-[#8a8a8a]/50 text-sm mt-2">点击右上角"新增"添加食物</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFoods.map(food => {
              const catInfo = categoryLabels[food.category];
              const Icon = catInfo.icon;
              return (
                <div
                  key={food.id}
                  className="bg-[#141414] rounded-xl border border-white/[0.04] p-4 transition-all duration-300 hover:border-white/[0.08]"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#b6ff53]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#b6ff53]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{food.name}</h3>
                        <span className="text-[#8a8a8a] text-xs px-2 py-0.5 bg-white/5 rounded-full">
                          {catInfo.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8a8a8a]">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-[#b6ff53]" />
                          {food.calories} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8a8a8a]" />
                          {food.source}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {food.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#b6ff53]/8 text-[#b6ff53]/80 text-xs rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(food)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center
                          text-[#8a8a8a] hover:text-[#b6ff53] hover:bg-[#b6ff53]/10 transition-all duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                          ${deleteConfirm === food.id
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-[#8a8a8a] hover:text-red-400 hover:bg-red-500/10'
                          }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full md:max-w-lg bg-[#141414] rounded-t-3xl md:rounded-2xl border border-white/[0.06] p-6 max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? '编辑食物' : '新增食物'}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#8a8a8a] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">食物名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="例如：鸡胸肉沙拉"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm
                    placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#b6ff53]/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">分类</label>
                <div className="flex gap-2">
                  {categoryOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, category: opt.value as 'breakfast' | 'main' | 'snack' }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${formData.category === opt.value
                          ? 'bg-[#b6ff53] text-[#0a0a0a]'
                          : 'bg-[#0a0a0a] text-[#8a8a8a] border border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">热量 (kcal)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={10000}
                  value={formData.calories}
                  onChange={e => setFormData(p => ({ ...p, calories: parseInt(e.target.value) || 0 }))}
                  placeholder="例如：350"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm
                    placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#b6ff53]/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">来源</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                  placeholder="例如：学校食堂轻食窗口 / 外卖"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm
                    placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#b6ff53]/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">
                  标签
                  <span className="text-[#8a8a8a]/50 ml-1">（用逗号分隔）</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tags}
                  onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                  placeholder="例如：高蛋白,低脂,减脂友好"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm
                    placeholder:text-[#8a8a8a]/50 focus:outline-none focus:border-[#b6ff53]/30 transition-colors"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[#8a8a8a] text-sm mb-1.5">
                  食物图片
                  <span className="text-[#8a8a8a]/50 ml-1">（可选，支持拖拽上传）</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.08]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-white/80 text-xs truncate">
                        {formData.imageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-40 bg-[#0a0a0a] border border-dashed border-white/[0.12] rounded-xl
                      flex flex-col items-center justify-center gap-3 cursor-pointer
                      transition-all duration-300 hover:border-[#b6ff53]/30 hover:bg-[#b6ff53]/[0.02]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-[#b6ff53] animate-spin" />
                        <span className="text-[#8a8a8a] text-sm">上传中...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[#b6ff53]/10 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-[#b6ff53]" />
                        </div>
                        <div className="text-center">
                          <p className="text-white text-sm font-medium">点击或拖拽上传图片</p>
                          <p className="text-[#8a8a8a] text-xs mt-0.5">支持 JPG、PNG 格式，最大 5MB</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || uploading}
                className="w-full py-3.5 bg-[#b6ff53] text-[#0a0a0a] font-semibold rounded-xl
                  transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
