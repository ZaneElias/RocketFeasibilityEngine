import type { AnalysisResult, InsertSavedAnalysis } from "@shared/schema";
import { savedAnalyses } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  saveAnalysis(analysis: AnalysisResult): Promise<AnalysisResult>;
  getAnalysis(id: string): Promise<AnalysisResult | undefined>;
  getAllAnalyses(sessionId?: string): Promise<AnalysisResult[]>;
  getRecentAnalyses(limit?: number): Promise<AnalysisResult[]>;
}

export class DatabaseStorage implements IStorage {
  async saveAnalysis(analysis: AnalysisResult): Promise<AnalysisResult> {
    const insertData: InsertSavedAnalysis = {
      analysisId: analysis.id,
      sessionId: null,
      latitude: analysis.location.latitude,
      longitude: analysis.location.longitude,
      country: analysis.location.country || null,
      city: analysis.location.city || null,
      state: analysis.location.state || null,
      displayName: analysis.location.displayName || null,
      rocketCategory: analysis.rocketConfig.category,
      modelType: analysis.rocketConfig.modelType || null,
      safetyLevel: analysis.rocketConfig.safetyLevel || null,
      analysisData: analysis as any,
      overallScore: analysis.overallScore,
    };

    await db.insert(savedAnalyses).values(insertData);
    return analysis;
  }

  async getAnalysis(id: string): Promise<AnalysisResult | undefined> {
    const [saved] = await db
      .select()
      .from(savedAnalyses)
      .where(eq(savedAnalyses.analysisId, id));

    if (!saved) return undefined;
    return saved.analysisData as AnalysisResult;
  }

  async getAllAnalyses(sessionId?: string): Promise<AnalysisResult[]> {
    let query = db.select().from(savedAnalyses);
    
    if (sessionId) {
      query = query.where(eq(savedAnalyses.sessionId, sessionId)) as any;
    }
    
    const results = await query.orderBy(desc(savedAnalyses.createdAt));
    return results.map((r) => r.analysisData as AnalysisResult);
  }

  async getRecentAnalyses(limit = 10): Promise<AnalysisResult[]> {
    const results = await db
      .select()
      .from(savedAnalyses)
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(limit);

    return results.map((r) => r.analysisData as AnalysisResult);
  }
}

export const storage = new DatabaseStorage();
