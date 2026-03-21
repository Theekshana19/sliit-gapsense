import { computed, Injectable, signal } from '@angular/core';
import { MODULE_OPTIONS } from '../models/risk-analysis/module-topic.constants';
import type { RecommendationRule } from '../models/risk-analysis/recommendation-rule.model';
import type { RecommendationRuleFormValue } from '../models/risk-analysis/recommendation-rule-form.model';

function moduleLabel(moduleId: string): string {
  return MODULE_OPTIONS.find((m) => m.id === moduleId)?.label ?? moduleId;
}

function seedRules(): RecommendationRule[] {
  return [
    {
      id: 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901',
      ruleName: 'Risk Analysis Under-50',
      moduleId: 'IT3040',
      moduleLabel: moduleLabel('IT3040'),
      topic: 'Risk Analysis',
      conditionType: 'scoreUnderThreshold',
      scoreThreshold: 50,
      priority: 'high',
      recommendedActionSummary: 'Assign support material...',
      recommendationTitle: 'Master Quantitative Risk Assessment',
      resourceType: 'Reading Material',
      status: 'active',
      isActive: true,
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'b2c3d4e5-f6a7-5b6c-9d0e-123456789012',
      ruleName: 'Advanced Logic Mastery',
      moduleId: 'CS2010',
      moduleLabel: moduleLabel('CS2010'),
      topic: 'Algorithmic Logic',
      conditionType: 'scoreOverThreshold',
      scoreThreshold: 85,
      priority: 'low',
      recommendedActionSummary: 'Advanced certification path',
      recommendationTitle: 'Advanced Logic Track',
      resourceType: 'External Workshop',
      status: 'paused',
      isActive: false,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'c3d4e5f6-a7b8-6c7d-0e1f-234567890123',
      ruleName: 'Mid-Tier Performance',
      moduleId: 'SE4020',
      moduleLabel: moduleLabel('SE4020'),
      topic: 'System Arch',
      conditionType: 'scoreUnderThreshold',
      scoreThreshold: 70,
      priority: 'medium',
      recommendedActionSummary: 'Architecture webinar link',
      recommendationTitle: 'Architecture Webinar',
      resourceType: 'Video Tutorial',
      status: 'active',
      isActive: true,
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      conditionDisplayOverride: 'Score 50-70%',
    },
  ];
}

function formToRule(id: string, v: RecommendationRuleFormValue): RecommendationRule {
  return {
    id,
    ruleName: v.ruleName.trim(),
    moduleId: v.moduleId,
    moduleLabel: moduleLabel(v.moduleId),
    topic: v.topic,
    conditionType: v.conditionType,
    scoreThreshold: Number(v.scoreThreshold),
    priority: v.priorityLevel,
    recommendedActionSummary: v.recommendationTitle.slice(0, 80),
    recommendationTitle: v.recommendationTitle.trim(),
    resourceType: v.resourceType,
    resourceUrl: v.resourceUrl?.trim() || undefined,
    administrativeRationale: v.administrativeRationale?.trim() || undefined,
    status: v.isActive ? 'active' : 'paused',
    isActive: v.isActive,
    updatedAt: new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class RecommendationRuleService {
  private readonly _rules = signal<RecommendationRule[]>(seedRules());

  readonly rules = this._rules.asReadonly();

  /** Mock metric: scales lightly with rule count */
  readonly activeImpactCount = computed(() => {
    const base = 1200;
    const n = this._rules().filter((r) => r.status === 'active').length;
    return base + n * 40;
  });

  readonly efficiencyRate = computed(() => {
    const rules = this._rules();
    if (rules.length === 0) return 94.2;
    const active = rules.filter((r) => r.status === 'active').length;
    return Math.min(99, 88 + (active / rules.length) * 10);
  });

  readonly criticalGapsCount = computed(() => {
    const topicsCovered = new Set(this._rules().map((r) => `${r.moduleId}:${r.topic}`));
    const mockTotalTopics = 24;
    return Math.max(0, mockTotalTopics - topicsCovered.size);
  });

  getAll(): RecommendationRule[] {
    return this._rules();
  }

  getById(id: string): RecommendationRule | undefined {
    return this._rules().find((r) => r.id === id);
  }

  /** Returns true if another rule (excluding excludeId) uses same module+topic */
  hasConflict(moduleId: string, topic: string, excludeId?: string): boolean {
    return this._rules().some(
      (r) =>
        r.moduleId === moduleId &&
        r.topic === topic &&
        r.id !== excludeId
    );
  }

  create(value: RecommendationRuleFormValue): RecommendationRule {
    const id = crypto.randomUUID();
    const rule = formToRule(id, value);
    this._rules.update((list) => [...list, rule]);
    return rule;
  }

  update(id: string, value: RecommendationRuleFormValue): RecommendationRule | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const rule = formToRule(id, value);
    this._rules.update((list) => list.map((r) => (r.id === id ? rule : r)));
    return rule;
  }

  delete(id: string): boolean {
    const next = this._rules().filter((r) => r.id !== id);
    if (next.length === this._rules().length) return false;
    this._rules.set(next);
    return true;
  }
}
