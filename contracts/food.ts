import { z } from "zod";

export const FoodCategory = z.enum(["breakfast", "main", "snack"]);

export const foodSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: FoodCategory,
  calories: z.number(),
  source: z.string(),
  tags: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
});

export const createFoodInput = z.object({
  name: z.string().min(1).max(100),
  category: FoodCategory,
  calories: z.number().min(0).max(10000),
  source: z.string().min(1).max(200),
  tags: z.string().min(1).max(200),
  imageUrl: z.string().optional(),
});

export const updateFoodInput = createFoodInput.partial().extend({
  id: z.number(),
});

export const randomPickInput = z.object({
  category: FoodCategory,
});

export type Food = z.infer<typeof foodSchema>;
export type CreateFoodInput = z.infer<typeof createFoodInput>;
export type UpdateFoodInput = z.infer<typeof updateFoodInput>;
