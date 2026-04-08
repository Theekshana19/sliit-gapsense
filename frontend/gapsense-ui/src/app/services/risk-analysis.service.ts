import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { RiskThreshold } from '../models/risk-analysis/risk-threshold.model';
import type { RiskThresholdFormValue } from '../models/risk-analysis/risk-threshold-form.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RiskThresholdApiResponse {
  id: string;
  ruleName: string;
  lowRiskMin: number;
  mediumRiskMin: number;
  mediumRiskMax: number;
  highRiskMax: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapFromApi(d: RiskThresholdApiResponse): RiskThreshold {
  return {
    id: d.id,
    ruleName: d.ruleName,
    description: d.notes ? d.notes.split('\n')[0]?.slice(0, 80) : undefined,
    lowRiskMin: d.lowRiskMin,
    mediumRiskMin: d.mediumRiskMin,
    mediumRiskMax: d.mediumRiskMax,
    highRiskMax: d.highRiskMax,
    status: d.isActive ? 'active' : 'inactive',
    notes: d.notes ?? '',
    updatedAt: d.updatedAt,
  };
}

function toCreateRequest(payload: RiskThresholdFormValue) {
  return {
    ruleName: payload.ruleName,
    lowRiskMin: payload.lowRiskMin,
    mediumRiskMin: payload.mediumRiskMin,
    mediumRiskMax: payload.mediumRiskMax,
    highRiskMax: payload.highRiskMax,
    isActive: payload.status === 'active',
    notes: payload.notes || null,
  };
}

@Injectable({ providedIn: 'root' })
export class RiskAnalysisService {
  private readonly http = inject(HttpClient);
  private readonly _thresholds = signal<RiskThreshold[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdatedAt = signal<string | null>(null);

  readonly thresholds = this._thresholds.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdatedAt = this._lastUpdatedAt.asReadonly();

  readonly activeCount = computed(() =>
    this._thresholds().filter((t) => t.status === 'active').length
  );

  private get baseUrl(): string {
    return `${API_BASE_URL}/api/RiskThresholds`;
  }

  async loadAll(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<RiskThresholdApiResponse[]>>(this.baseUrl)
      );
      if (res.success && Array.isArray(res.data)) {
        this._thresholds.set(res.data.map(mapFromApi));
        const latest = res.data
          .map((d) => d.updatedAt)
          .sort()
          .pop();
        this._lastUpdatedAt.set(latest ?? null);
      } else {
        this._error.set(res.message || 'Failed to load thresholds');
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to connect to API';
      this._error.set(msg);
      this._thresholds.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  getAll(): RiskThreshold[] {
    return this._thresholds();
  }

  getById(id: string): RiskThreshold | undefined {
    return this._thresholds().find((t) => t.id === id);
  }

  async add(payload: RiskThresholdFormValue): Promise<RiskThreshold | null> {
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<RiskThresholdApiResponse>>(
          this.baseUrl,
          toCreateRequest(payload)
        )
      );
      if (res.success && res.data) {
        const mapped = mapFromApi(res.data);
        this._thresholds.update((list) => [...list, mapped]);
        this._lastUpdatedAt.set(res.data.updatedAt);
        return mapped;
      }
      this._error.set(res.message || 'Create failed');
      return null;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create threshold';
      this._error.set(msg);
      return null;
    }
  }

  async update(
    id: string,
    payload: RiskThresholdFormValue
  ): Promise<RiskThreshold | null> {
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.put<ApiResponse<RiskThresholdApiResponse>>(
          `${this.baseUrl}/${id}`,
          toCreateRequest(payload)
        )
      );
      if (res.success && res.data) {
        const mapped = mapFromApi(res.data);
        this._thresholds.update((list) =>
          list.map((t) => (t.id === id ? mapped : t))
        );
        this._lastUpdatedAt.set(res.data.updatedAt);
        return mapped;
      }
      this._error.set(res.message || 'Update failed');
      return null;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update threshold';
      this._error.set(msg);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    this._error.set(null);
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this._thresholds.update((list) => list.filter((t) => t.id !== id));
      this._lastUpdatedAt.set(new Date().toISOString());
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to delete threshold';
      this._error.set(msg);
      return false;
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}
