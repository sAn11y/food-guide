import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import * as store from "../lib/json-store";
import {
  createFoodInput,
  updateFoodInput,
  randomPickInput,
  FoodCategory,
} from "@contracts/food";

export const foodRouter = createRouter({
  list: publicQuery.query(async () => {
    return store.list();
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return store.getById(input.id);
    }),

  byCategory: publicQuery
    .input(z.object({ category: FoodCategory }))
    .query(async ({ input }) => {
      return store.getByCategory(input.category);
    }),

  random: publicQuery
    .input(randomPickInput)
    .query(async ({ input }) => {
      return store.randomByCategory(input.category);
    }),

  create: publicQuery
    .input(createFoodInput)
    .mutation(async ({ input }) => {
      return store.create({
        name: input.name,
        category: input.category,
        calories: input.calories,
        source: input.source,
        tags: input.tags,
        imageUrl: input.imageUrl ?? null,
      });
    }),

  update: publicQuery
    .input(updateFoodInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return store.update(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return { success: store.remove(input.id) };
    }),
});
