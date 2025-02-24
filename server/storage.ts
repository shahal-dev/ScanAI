import { products, type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private currentId: number;

  constructor() {
    this.products = new Map();
    this.currentId = 1;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = {
      ...insertProduct,
      id,
      metadata: insertProduct.metadata ?? null,
      brand: insertProduct.brand ?? null,
      category: insertProduct.category ?? null,
      identifiedText: insertProduct.identifiedText ?? null,
      imageUrl: insertProduct.imageUrl ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.brand?.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();