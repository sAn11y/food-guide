import { createRouter, publicQuery } from "./middleware";
import { foodRouter } from "./routers/food";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  food: foodRouter,
});

export type AppRouter = typeof appRouter;
