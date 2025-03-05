import { products, users, type Product, type InsertProduct, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  createProduct(product: InsertProduct, userId: number): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  getUserProducts(userId: number): Promise<Product[]>;

  // Auth related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async createProduct(insertProduct: InsertProduct, userId: number): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({ ...insertProduct, userId })
      .returning();
    return product;
  }

  async getProducts(userId?: number): Promise<Product[]> {
    if (userId) {
      return await db
        .select()
        .from(products)
        .where(eq(products.userId, userId));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return await db
      .select()
      .from(products)
      .where(
        sql`LOWER(name) LIKE ${`%${lowercaseQuery}%`} OR 
            LOWER(description) LIKE ${`%${lowercaseQuery}%`} OR 
            LOWER(brand) LIKE ${`%${lowercaseQuery}%`}`
      );
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();