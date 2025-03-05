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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  verifyUser(userId: number): Promise<void>;
  updateUserProfile(userId: number, data: Partial<User>): Promise<User>;
  changePassword(userId: number, password: string): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }
  
  async verifyUser(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        isVerified: "true", 
        verificationToken: null 
      })
      .where(eq(users.id, userId));
  }
  
  async updateUserProfile(userId: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async changePassword(userId: number, password: string): Promise<void> {
    await db
      .update(users)
      .set({ password })
      .where(eq(users.id, userId));
  }
  
  async deleteUser(userId: number): Promise<void> {
    // First delete all associated products
    await db
      .delete(products)
      .where(eq(products.userId, userId));
      
    // Then delete the user
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users);
  }
}

export const storage = new DatabaseStorage();