// src/lib/payments/memoryStore.ts

export type UnlockType = 'single' | 'pro';

export interface PurchaseRecord {
  sessionId: string;
  type: UnlockType;
  expMs: number;           // absolute timestamp in ms when access expires
  email?: string | null;
  amountTotal?: number | null;
  createdAtMs: number;
}

class InMemoryUnlockStore {
  // sessionId -> record
  private bySession = new Map<string, PurchaseRecord>();
  // email -> latest sessionId
  private latestByEmail = new Map<string, string>();

  save(rec: PurchaseRecord) {
    this.bySession.set(rec.sessionId, rec);
    if (rec.email) this.latestByEmail.set(rec.email.toLowerCase(), rec.sessionId);
    this.cleanup();
  }

  getBySession(sessionId: string) {
    this.cleanup();
    const rec = this.bySession.get(sessionId);
    if (!rec) return null;
    if (Date.now() > rec.expMs) {
      this.bySession.delete(sessionId);
      return null;
    }
    return rec;
  }

  getLatestByEmail(email: string) {
    this.cleanup();
    const key = email.toLowerCase();
    const sessionId = this.latestByEmail.get(key);
    if (!sessionId) return null;
    return this.getBySession(sessionId);
  }

  private cleanup() {
    const now = Date.now();
    for (const [sid, rec] of this.bySession.entries()) {
      if (rec.expMs <= now) this.bySession.delete(sid);
    }
    // Optionally prune latestByEmail entries that no longer exist
    for (const [email, sid] of this.latestByEmail.entries()) {
      if (!this.bySession.has(sid)) this.latestByEmail.delete(email);
    }
  }
}

export const unlockStore = new InMemoryUnlockStore();
