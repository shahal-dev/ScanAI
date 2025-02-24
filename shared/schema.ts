import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  brand: text("brand"),
  category: text("category"),
  identifiedText: text("identified_text"),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
