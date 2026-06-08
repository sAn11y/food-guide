import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";

export const foods = mysqlTable("foods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: mysqlEnum("category", ["breakfast", "main", "snack"]).notNull(),
  calories: int("calories").notNull(),
  source: varchar("source", { length: 200 }).notNull(),
  tags: varchar("tags", { length: 200 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});
