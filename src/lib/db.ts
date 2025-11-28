/**
 * Database Layer for Persistent Storage
 * Handles GPSR compliance, mockups, fulfillment tracking, and bulk operations
 * 
 * In production, this would connect to PostgreSQL, MongoDB, or similar
 * Currently uses in-memory with file-based persistence for demonstration
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Generic database collection handler
 */
class Collection<T extends { id?: string }> {
  private filePath: string;
  private data: Map<string, T> = new Map();

  constructor(name: string) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(content);
        this.data = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error(`Failed to load ${this.filePath}:`, error);
    }
  }

  private save() {
    try {
      const obj = Object.fromEntries(this.data);
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.error(`Failed to save ${this.filePath}:`, error);
    }
  }

  create(id: string, document: T): T {
    const doc = { ...document, id };
    this.data.set(id, doc);
    this.save();
    return doc;
  }

  findById(id: string): T | undefined {
    return this.data.get(id);
  }

  findAll(): T[] {
    return Array.from(this.data.values());
  }

  findByQuery(predicate: (doc: T) => boolean): T[] {
    return Array.from(this.data.values()).filter(predicate);
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const doc = this.data.get(id);
    if (!doc) return undefined;

    const updated = { ...doc, ...updates };
    this.data.set(id, updated);
    this.save();
    return updated;
  }

  delete(id: string): boolean {
    const deleted = this.data.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  clear(): void {
    this.data.clear();
    this.save();
  }
}

/**
 * Collections
 */
export const gpsrData = new Collection<any>('gpsr');
export const mockups = new Collection<any>('mockups');
export const fulfillmentTracking = new Collection<any>('fulfillment-tracking');
export const bulkOperations = new Collection<any>('bulk-operations');

/**
 * Database initialization
 */
export function initializeDatabase() {
  console.log(`Database initialized. Data directory: ${DATA_DIR}`);
}

/**
 * Health check
 */
export function isDatabaseHealthy(): boolean {
  try {
    return fs.existsSync(DATA_DIR);
  } catch {
    return false;
  }
}
