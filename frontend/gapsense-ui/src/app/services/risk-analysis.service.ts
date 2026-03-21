import { computed, Injectable, signal } from '@angular/core';
import type { RiskThreshold } from '../models/risk-analysis/risk-threshold.model';
import type { RiskThresholdFormValue } from '../models/risk-analysis/risk-threshold-form.model';

const STORAGE_KEY = 'gapsense.riskThresholds.v1';

const MOCK_THRESHOLDS: RiskThreshold[] = [
  {
    id: '1',
    ruleName: 'Standard Academic Readiness',
    description: 'Default module logic',
    lowRiskMin: 75,
    mediumRiskMin: 50,
    mediumRiskMax: 74,
    highRiskMax: 49,
    status: 'active',
    notes: 'Default threshold for core academic modules.',
    updatedAt: '2025-10-24T10:00:00Z',
  },
  {
    id: '2',
    ruleName: 'Advanced Practical Skills',
    description: 'Lab-based competencies',
    lowRiskMin: 80,
    mediumRiskMin: 60,
    mediumRiskMax: 79,
    highRiskMax: 59,
    status: 'active',
    notes: 'Used for lab-based assessments.',
    updatedAt: '2025-10-24T10:00:00Z',
  },
  {
    id: '3',
    ruleName: 'Fast-Track Internship Qualifier',
    description: 'Strict industry standards',
    lowRiskMin: 90,
    mediumRiskMin: 80,
    mediumRiskMax: 89,
    highRiskMax: 79,
    status: 'inactive',
    notes: 'Strict threshold for industry placement.',
    updatedAt: '2025-10-24T10:00:00Z',
  },
];

function loadFromStorage(): RiskThreshold[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...MOCK_THRESHOLDS];
    const parsed = JSON.parse(raw) as RiskThreshold[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...MOCK_THRESHOLDS];
  } catch {
    return [...MOCK_THRESHOLDS];
  }
}

function persistToStorage(items: RiskThreshold[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateId(): string {
  return crypto.randomUUID();
}

export type RiskThresholdCreatePayload = Omit<RiskThreshold, 'id' | 'updatedAt'>;
export type RiskThresholdUpdatePayload = Omit<RiskThreshold, 'id' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class RiskAnalysisService {
  private readonly _thresholds = signal<RiskThreshold[]>(loadFromStorage());
  private readonly _lastUpdatedAt = signal<string>(new Date().toISOString());

  readonly thresholds = this._thresholds.asReadonly();
  readonly lastUpdatedAt = this._lastUpdatedAt.asReadonly();

  readonly activeCount = computed(() =>
    this._thresholds().filter((t) => t.status === 'active').length
  );

  getAll(): RiskThreshold[] {
    return this._thresholds();
  }

  getById(id: string): RiskThreshold | undefined {
    return this._thresholds().find((t) => t.id === id);
  }

  add(payload: RiskThresholdFormValue): RiskThreshold {
    const now = new Date().toISOString();
    const newItem: RiskThreshold = {
      id: generateId(),
      ruleName: payload.ruleName,
      description: payload.notes ? payload.notes.split('\n')[0]?.slice(0, 80) : undefined,
      lowRiskMin: payload.lowRiskMin,
      mediumRiskMin: payload.mediumRiskMin,
      mediumRiskMax: payload.mediumRiskMax,
      highRiskMax: payload.highRiskMax,
      status: payload.status,
      notes: payload.notes,
      updatedAt: now,
    };
    const next = [...this._thresholds(), newItem];
    this._thresholds.set(next);
    this._lastUpdatedAt.set(now);
    persistToStorage(next);
    return newItem;
  }

  update(id: string, payload: RiskThresholdFormValue): RiskThreshold | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const updated: RiskThreshold = {
      ...existing,
      ruleName: payload.ruleName,
      description: payload.notes ? payload.notes.split('\n')[0]?.slice(0, 80) : undefined,
      lowRiskMin: payload.lowRiskMin,
      mediumRiskMin: payload.mediumRiskMin,
      mediumRiskMax: payload.mediumRiskMax,
      highRiskMax: payload.highRiskMax,
      status: payload.status,
      notes: payload.notes,
      updatedAt: now,
    };
    const next = this._thresholds().map((t) => (t.id === id ? updated : t));
    this._thresholds.set(next);
    this._lastUpdatedAt.set(now);
    persistToStorage(next);
    return updated;
  }

  delete(id: string): boolean {
    const next = this._thresholds().filter((t) => t.id !== id);
    if (next.length === this._thresholds().length) return false;
    this._thresholds.set(next);
    this._lastUpdatedAt.set(new Date().toISOString());
    persistToStorage(next);
    return true;
  }
}
