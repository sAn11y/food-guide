// Local food data store (replaces tRPC backend)
export interface Food {
  id: number;
  name: string;
  category: 'breakfast' | 'main' | 'snack';
  calories: number;
  source: string;
  tags: string;
  imageUrl: string | null;
  createdAt: string;
}

const foods: Food[] = [
  {
    "id": 1,
    "name": "牛油果全麦吐司",
    "category": "breakfast",
    "calories": 120,
    "source": "学校食堂一楼 / 早餐窗口",
    "tags": "低脂,膳食纤维",
    "imageUrl": "/foods/avocado-toast.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 2,
    "name": "水煮蛋",
    "category": "breakfast",
    "calories": 70,
    "source": "学校食堂 / 早餐窗口",
    "tags": "高蛋白,低脂",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 3,
    "name": "燕麦粥",
    "category": "breakfast",
    "calories": 80,
    "source": "面包房 / 早餐窗口",
    "tags": "膳食纤维,饱腹感强",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 4,
    "name": "玉米",
    "category": "breakfast",
    "calories": 150,
    "source": "一楼早餐 / 面包房",
    "tags": "膳食纤维,饱腹感强",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 5,
    "name": "豆浆",
    "category": "breakfast",
    "calories": 60,
    "source": "学校食堂",
    "tags": "植物蛋白,低脂",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 6,
    "name": "包子",
    "category": "breakfast",
    "calories": 105,
    "source": "学校食堂 / 早餐窗口",
    "tags": "碳水,膳食纤维",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 7,
    "name": "鸡胸肉饭",
    "category": "main",
    "calories": 420,
    "source": "学校食堂美食窗口 / 二楼",
    "tags": "高蛋白,低脂",
    "imageUrl": "/foods/chicken.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 8,
    "name": "牛肉藜麦",
    "category": "main",
    "calories": 480,
    "source": "清真食堂",
    "tags": "高蛋白,低GI",
    "imageUrl": "/foods/beef-rice.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 9,
    "name": "沙拉盘",
    "category": "main",
    "calories": 350,
    "source": "学校食堂 / 二楼轻食",
    "tags": "低脂,膳食纤维",
    "imageUrl": "/foods/salad.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 10,
    "name": "三文鱼套餐",
    "category": "main",
    "calories": 520,
    "source": "二楼西餐档口",
    "tags": "优质蛋白,Omega-3",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 11,
    "name": "素食便当",
    "category": "main",
    "calories": 400,
    "source": "学校食堂美食窗口",
    "tags": "均衡营养,低脂",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 12,
    "name": "番茄意面",
    "category": "main",
    "calories": 450,
    "source": "二楼西餐档口",
    "tags": "碳水化合物,番茄红素",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 13,
    "name": "铁板牛肉饭",
    "category": "main",
    "calories": 510,
    "source": "美食窗口 / 清真食堂",
    "tags": "高蛋白,铁元素",
    "imageUrl": "/foods/beef-rice.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 14,
    "name": "巴西莓碗",
    "category": "snack",
    "calories": 220,
    "source": "二楼轻食柜台",
    "tags": "抗氧化,低卡",
    "imageUrl": "/foods/acai-bowl.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 15,
    "name": "水果酸奶杯",
    "category": "snack",
    "calories": 160,
    "source": "面包房",
    "tags": "益生菌,维生素",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 16,
    "name": "全麦三明治",
    "category": "snack",
    "calories": 250,
    "source": "面包房 / 早餐窗口",
    "tags": "膳食纤维,便携",
    "imageUrl": "/foods/avocado-toast.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 17,
    "name": "气泡水",
    "category": "snack",
    "calories": 5,
    "source": "校内便利店",
    "tags": "零卡,清爽",
    "imageUrl": "/foods/sparkling.jpg",
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 18,
    "name": "蛋白棒",
    "category": "snack",
    "calories": 180,
    "source": "校内便利店",
    "tags": "高蛋白,便携",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": 19,
    "name": "紫薯燕麦饼干",
    "category": "snack",
    "calories": 140,
    "source": "面包房",
    "tags": "全谷物,低糖",
    "imageUrl": null,
    "createdAt": "2026-06-01T08:00:00Z"
  }
];

export function getAllFoods(): Food[] {
  return foods;
}

export function getByCategory(category: string): Food[] {
  return foods.filter(f => f.category === category);
}

export function getRandomByCategory(category: string): Food | null {
  const filtered = getByCategory(category);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
