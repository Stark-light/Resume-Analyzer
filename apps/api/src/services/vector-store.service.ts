import { ChromaClient, Collection } from 'chromadb';
import { config } from '../config';
import { logger } from '../utils/logger';

const COLLECTION_NAME = 'resumes';

class VectorStoreService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private initialized = false;

  constructor() {
    this.client = new ChromaClient({ path: config.chroma.url });
  }

  async init(): Promise<void> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' },
      });
      this.initialized = true;
      logger.info('ChromaDB collection ready');
    } catch (err) {
      logger.warn('ChromaDB unavailable — RAG features disabled', { error: (err as Error).message });
    }
  }

  async upsertResume(id: string, embedding: number[], metadata: Record<string, string>): Promise<void> {
    if (!this.initialized || !this.collection) return;
    try {
      await this.collection.upsert({
        ids: [id],
        embeddings: [embedding],
        metadatas: [metadata],
      });
    } catch (err) {
      logger.error('ChromaDB upsert failed', { error: err });
    }
  }

  async querySimilar(embedding: number[], limit = 5): Promise<Array<{ id: string; distance: number; metadata: Record<string, string> }>> {
    if (!this.initialized || !this.collection) return [];
    try {
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
      });

      return (results.ids[0] ?? []).map((id, idx) => ({
        id,
        distance: results.distances?.[0]?.[idx] ?? 1,
        metadata: (results.metadatas?.[0]?.[idx] as Record<string, string>) ?? {},
      }));
    } catch (err) {
      logger.error('ChromaDB query failed', { error: err });
      return [];
    }
  }

  async deleteResume(id: string): Promise<void> {
    if (!this.initialized || !this.collection) return;
    try {
      await this.collection.delete({ ids: [id] });
    } catch {
      // no-op
    }
  }
}

export const vectorStore = new VectorStoreService();