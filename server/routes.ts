import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeLocation, validateZone } from "./analysis-engine";
import {
  analyzeLocationRequestSchema,
  reverseGeocodeRequestSchema,
  locationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedRequest = analyzeLocationRequestSchema.parse(req.body);
      
      const result = await analyzeLocation(
        validatedRequest.location,
        validatedRequest.rocketConfig
      );
      
      await storage.saveAnalysis(result);
      
      res.json(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(400).json({
        error: error.message || "Failed to analyze location",
      });
    }
  });

  app.post("/api/validate-zone", async (req, res) => {
    try {
      const { location } = req.body;
      const validatedLocation = locationSchema.parse(location);
      
      const validation = validateZone(validatedLocation);
      
      res.json(validation);
    } catch (error: any) {
      console.error("Zone validation error:", error);
      res.status(400).json({
        error: error.message || "Failed to validate zone",
      });
    }
  });

  app.post("/api/reverse-geocode", async (req, res) => {
    try {
      const validatedRequest = reverseGeocodeRequestSchema.parse(req.body);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${validatedRequest.latitude}&lon=${validatedRequest.longitude}&format=json`
      );
      
      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }
      
      const data = await response.json();
      
      res.json({
        country: data.address?.country,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        displayName: data.display_name,
      });
    } catch (error: any) {
      console.error("Reverse geocode error:", error);
      res.status(400).json({
        error: error.message || "Failed to reverse geocode location",
      });
    }
  });

  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error: any) {
      console.error("Get analyses error:", error);
      res.status(500).json({
        error: error.message || "Failed to retrieve analyses",
      });
    }
  });

  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Get analysis error:", error);
      res.status(500).json({
        error: error.message || "Failed to retrieve analysis",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
