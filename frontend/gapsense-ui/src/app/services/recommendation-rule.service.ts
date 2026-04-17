import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { MODULE_OPTIONS } from '../models/risk-analysis/module-topic.constants';
import type { RecommendationConditionType } from '../models/risk-analysis/recommendation-condition-type.model';
import type { RecommendationRule } from '../models/risk-analysis/recommendation-rule.model';
import type { RecommendationRuleFormValue } from '../models/risk-analysis/recommendation-rule-form.model';
import type { RecommendationRuleStatus } from '../models/risk-analysis/recommendation-status.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RecommendationRuleApiDto {
  id: string;
  ruleName: string;
  moduleCode: string;
  moduleName: string;
  topicName: string;
  conditionType: RecommendationConditionType;
  scoreThreshold: number;
  recommendationTitle: string;
  resourceType: string;
  priorityLevel: 'high' | 'medium' | 'low';
  resourceUrl: string | null;
  attachmentPath: string | null;
  administrativeRationale: string | null;
  status: RecommendationRuleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function moduleLabelFromId(moduleId: string): string {
  return MODULE_OPTIONS.find((m) => m.id === moduleId)?.label ?? moduleId;
}

function mapFromApi(d: RecommendationRuleApiDto): RecommendationRule {
  const title = d.recommendationTitle?.trim() ?? '';
  return {
    id: d.id,
    ruleName: d.ruleName,
    moduleId: d.moduleCode,
    moduleLabel: d.moduleName,
    topic: d.topicName,
    conditionType: d.conditionType,
    scoreThreshold: d.scoreThreshold,
    priority: d.priorityLevel,
    recommendedActionSummary:
      title.length > 80 ? `${title.slice(0, 77)}…` : title,
    recommendationTitle: title,
    resourceType: d.resourceType,
    resourceUrl: d.resourceUrl ?? undefined,
    attachmentPath: d.attachmentPath ?? undefined,
    administrativeRationale: d.administrativeRationale ?? undefined,
    status: d.status,
    isActive: d.isActive,
    updatedAt: d.updatedAt,
  };
}

function formToApiBody(
  v: RecommendationRuleFormValue,
  attachmentPath: string | null | undefined
): Record<string, unknown> {
  const moduleName = moduleLabelFromId(v.moduleId);
  const status: RecommendationRuleStatus = v.isActive ? 'active' : 'paused';
  return {
    ruleName: v.ruleName.trim(),
    moduleCode: v.moduleId.trim(),
    moduleName: moduleName,
    topicName: v.topic.trim(),
    conditionType: v.conditionType,
    scoreThreshold: Number(v.scoreThreshold),
    recommendationTitle: v.recommendationTitle.trim(),
    resourceType: v.resourceType.trim(),
    priorityLevel: v.priorityLevel,
    resourceUrl: v.resourceUrl?.trim() || null,
    attachmentPath: attachmentPath?.trim() || null,
    administrativeRationale: v.administrativeRationale?.trim() || null,
    status,
  };
}

function getApiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as ApiResponse<unknown>).message === 'string'
    ) {
      return (body as ApiResponse<unknown>).message;
    }
    return err.message || 'Request failed';
  }
  if (err instanceof Error) return err.message;
  return 'Request failed';
}

@Injectable({ providedIn: 'root' })
export class RecommendationRuleService {
  private readonly http = inject(HttpClient);

  private readonly _rules = signal<RecommendationRule[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly rules = this._rules.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeImpactCount = computed(() =>
    this._rules().filter((r) => r.status === 'active').length
  );

  readonly efficiencyRate = computed(() => {
    const rules = this._rules();
    if (rules.length === 0) return 0;
    const active = rules.filter((r) => r.status === 'active').length;
    return Math.round((active / rules.length) * 1000) / 10;
  });

  /** Rules that are not active (e.g. draft) — a real count from loaded rules only. */
  readonly criticalGapsCount = computed(() =>
    this._rules().filter((r) => r.status !== 'active').length
  );

  private get baseUrl(): string {
    return `${API_BASE_URL}/api/recommendation-rules`;
  }

  clearError(): void {
    this._error.set(null);
  }

  async loadAll(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<RecommendationRuleApiDto[]>>(this.baseUrl)
      );
      if (res.success && Array.isArray(res.data)) {
        this._rules.set(res.data.map(mapFromApi));
      } else {
        this._error.set(res.message || 'Failed to load recommendation rules');
        this._rules.set([]);
      }
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      this._rules.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  getById(id: string): RecommendationRule | undefined {
    return this._rules().find((r) => r.id === id);
  }

  async loadById(id: string): Promise<RecommendationRule | null> {
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<RecommendationRuleApiDto>>(
          `${this.baseUrl}/${id}`
        )
      );
      if (res.success && res.data) {
        return mapFromApi(res.data);
      }
      this._error.set(res.message || 'Rule not found');
      return null;
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      return null;
    }
  }

  /**
   * Duplicate detection aligned with backend unique index:
   * moduleCode + topicName + conditionType + scoreThreshold
   */
  hasDuplicateComposite(
    moduleId: string,
    topic: string,
    conditionType: RecommendationConditionType,
    scoreThreshold: number,
    excludeId?: string
  ): boolean {
    return this._rules().some(
      (r) =>
        r.moduleId === moduleId &&
        r.topic === topic &&
        r.conditionType === conditionType &&
        r.scoreThreshold === scoreThreshold &&
        r.id !== excludeId
    );
  }

  /** @deprecated Prefer hasDuplicateComposite */
  hasConflict(
    moduleId: string,
    topic: string,
    excludeId?: string
  ): boolean {
    return this._rules().some(
      (r) => r.moduleId === moduleId && r.topic === topic && r.id !== excludeId
    );
  }

  async uploadAttachment(file: File): Promise<string | null> {
    this._error.set(null);
    const fd = new FormData();
    fd.append('file', file, file.name);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<{ attachmentPath: string }>>(
          `${this.baseUrl}/attachments`,
          fd
        )
      );
      if (res.success && res.data?.attachmentPath) {
        return res.data.attachmentPath;
      }
      this._error.set(res.message || 'Upload failed');
      return null;
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      return null;
    }
  }

  async create(
    value: RecommendationRuleFormValue,
    attachmentPath?: string | null
  ): Promise<RecommendationRule | null> {
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<RecommendationRuleApiDto>>(this.baseUrl, {
          ...formToApiBody(value, attachmentPath ?? null),
        })
      );
      if (res.success && res.data) {
        const mapped = mapFromApi(res.data);
        this._rules.update((list) => [...list, mapped]);
        return mapped;
      }
      this._error.set(res.message || 'Create failed');
      return null;
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      return null;
    }
  }

  async update(
    id: string,
    value: RecommendationRuleFormValue,
    attachmentPath?: string | null
  ): Promise<RecommendationRule | null> {
    this._error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.put<ApiResponse<RecommendationRuleApiDto>>(
          `${this.baseUrl}/${id}`,
          { ...formToApiBody(value, attachmentPath ?? null) }
        )
      );
      if (res.success && res.data) {
        const mapped = mapFromApi(res.data);
        this._rules.update((list) =>
          list.map((r) => (r.id === id ? mapped : r))
        );
        return mapped;
      }
      this._error.set(res.message || 'Update failed');
      return null;
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    this._error.set(null);
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this._rules.update((list) => list.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      this._error.set(getApiErrorMessage(err));
      return false;
    }
  }
}
