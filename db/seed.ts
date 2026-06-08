import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { foods } from "./schema";

function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port) || 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
  };
}

async function seed() {
  const config = parseDbUrl(process.env.DATABASE_URL!);
  const pool = mysql.createPool(config);
  const db = drizzle(pool);

  const seedData = [
    // Breakfast
    { name: "全麦面包", category: "breakfast" as const, calories: 120, source: "学校食堂一楼 / 超市", tags: "低脂,高纤维", imageUrl: "/foods/avocado-toast.jpg" },
    { name: "水煮蛋", category: "breakfast" as const, calories: 70, source: "学校食堂 / 自制", tags: "高蛋白,低脂", imageUrl: null },
    { name: "无糖酸奶", category: "breakfast" as const, calories: 80, source: "便利店 / 超市", tags: "低糖,益生菌", imageUrl: null },
    { name: "燕麦杯", category: "breakfast" as const, calories: 150, source: "超市 / 网购", tags: "高纤维,饱腹感强", imageUrl: null },
    { name: "豆浆", category: "breakfast" as const, calories: 60, source: "学校食堂", tags: "植物蛋白,低脂", imageUrl: null },
    { name: "玉米", category: "breakfast" as const, calories: 105, source: "学校食堂 / 超市", tags: "粗粮,高纤维", imageUrl: null },
    // Main
    { name: "鸡胸肉饭", category: "main" as const, calories: 420, source: "学校食堂轻食窗口 / 外卖", tags: "高蛋白,低脂,减脂友好", imageUrl: "/foods/chicken.jpg" },
    { name: "牛肉藜麦饭", category: "main" as const, calories: 480, source: "外卖轻食店", tags: "高蛋白,低GI,均衡营养", imageUrl: "/foods/beef-rice.jpg" },
    { name: "沙拉碗", category: "main" as const, calories: 350, source: "学校食堂 / 外卖", tags: "低脂,高纤维,轻食", imageUrl: "/foods/salad.jpg" },
    { name: "三文鱼套餐", category: "main" as const, calories: 520, source: "外卖日料店", tags: "优质蛋白,Omega-3", imageUrl: null },
    { name: "轻食便当", category: "main" as const, calories: 400, source: "学校食堂轻食窗口", tags: "均衡营养,低脂", imageUrl: null },
    { name: "健康盖饭", category: "main" as const, calories: 450, source: "学校食堂", tags: "均衡搭配,饱腹感强", imageUrl: null },
    // Snack
    { name: "混合坚果", category: "snack" as const, calories: 160, source: "超市 / 便利店", tags: "优质脂肪,高蛋白", imageUrl: null },
    { name: "香蕉", category: "snack" as const, calories: 90, source: "超市 / 水果店", tags: "快速能量,钾元素", imageUrl: null },
    { name: "黑巧克力", category: "snack" as const, calories: 120, source: "超市", tags: "抗氧化,低糖", imageUrl: null },
    { name: "希腊酸奶", category: "snack" as const, calories: 100, source: "超市 / 便利店", tags: "高蛋白,低糖", imageUrl: null },
    { name: "高蛋白能量棒", category: "snack" as const, calories: 200, source: "超市 / 网购", tags: "高蛋白,便携", imageUrl: null },
    { name: "无糖水果干", category: "snack" as const, calories: 80, source: "超市", tags: "天然果糖,高纤维", imageUrl: null },
  ];

  console.log("Seeding foods...");
  for (const food of seedData) {
    await db.insert(foods).values(food);
  }
  console.log(`Seeded ${seedData.length} foods.`);
  await pool.end();
}

seed().catch(console.error);
