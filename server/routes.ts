import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractTextFromImage } from "./lib/ocr";
import { identifyProduct } from "./lib/openai";
import { insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/products/identify", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      const extractedText = await extractTextFromImage(image);
      const productDetails = await identifyProduct(image, extractedText);
      
      const product = await storage.createProduct({
        ...productDetails,
        identifiedText: extractedText,
        imageUrl: image,
        metadata: {}
      });

      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }
      const products = await storage.searchProducts(q);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
