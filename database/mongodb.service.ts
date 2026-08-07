import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { OpportunityModel, IOpportunity } from './models/opportunity.model';

export class MongoDBService {
  private isConnected: boolean = false;
  private memoryStore: Map<string, any> = new Map();

  async connect(): Promise<boolean> {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_opportunity_agent';
    try {
      console.log(`[MongoDBService] Connecting to MongoDB Atlas...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      this.isConnected = true;
      console.log('[MongoDBService] Connected to MongoDB database successfully!');
      return true;
    } catch (err: any) {
      console.warn(`[MongoDBService] Could not connect to live MongoDB server (${err.message}). Using high-performance Memory/JSON repository mode.`);
      this.isConnected = false;
      return false;
    }
  }

  async saveOpportunity(record: any): Promise<any> {
    if (this.isConnected) {
      try {
        const query = { opportunityId: record.opportunityId };
        const updated = await OpportunityModel.findOneAndUpdate(query, record, { upsert: true, new: true });
        return updated;
      } catch (err: any) {
        console.error('[MongoDBService] Error saving to MongoDB:', err.message);
      }
    }
    
    // In-Memory Fallback Repository
    this.memoryStore.set(record.opportunityId, {
      ...record,
      updatedAt: new Date().toISOString()
    });
    return this.memoryStore.get(record.opportunityId);
  }

  async getOpportunity(opportunityId: string): Promise<any> {
    if (this.isConnected) {
      try {
        return await OpportunityModel.findOne({ opportunityId });
      } catch (err) {}
    }
    return this.memoryStore.get(opportunityId) || null;
  }

  async getAllOpportunities(): Promise<any[]> {
    if (this.isConnected) {
      try {
        const docs = await OpportunityModel.find().sort({ updatedAt: -1 });
        if (docs && docs.length > 0) return docs;
      } catch (err) {}
    }
    return Array.from(this.memoryStore.values()).sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }
}

export const dbService = new MongoDBService();
