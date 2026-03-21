import type { RecommendationConditionType } from './recommendation-condition-type.model';
import type { RecommendationPriority } from './recommendation-priority.model';
import type { RecommendationRuleStatus } from './recommendation-status.model';

export interface RecommendationRule {
  id: string;
  ruleName: string;
  moduleId: string;
  moduleLabel: string;
  topic: string;
  conditionType: RecommendationConditionType;
  scoreThreshold: number;
  priority: RecommendationPriority;
  /** Short line for the table "Recommended Action" column */
  recommendedActionSummary: string;
  recommendationTitle: string;
  resourceType: string;
  resourceUrl?: string;
  administrativeRationale?: string;
  status: RecommendationRuleStatus;
  isActive: boolean;
  updatedAt: string;
  /** When set, table shows this instead of formatConditionDisplay (e.g. mid-band) */
  conditionDisplayOverride?: string;
}

export type ConditionDisplayIcon = 'down' | 'up' | 'range';

export interface ConditionDisplay {
  icon: ConditionDisplayIcon;
  text: string;
}

export function formatConditionDisplay(
  rule: Pick<
    RecommendationRule,
    'conditionType' | 'scoreThreshold' | 'conditionDisplayOverride'
  >
): ConditionDisplay {
  if (rule.conditionDisplayOverride) {
    return { icon: 'range', text: rule.conditionDisplayOverride };
  }
  const t = rule.scoreThreshold;
  if (rule.conditionType === 'scoreUnderThreshold') {
    return { icon: 'down', text: `Score < ${t}%` };
  }
  return { icon: 'up', text: `Score > ${t}%` };
}

/** For mid-band style rows in mock data (optional display) */
export function formatConditionRangeDisplay(
  min: number,
  max: number
): ConditionDisplay {
  return { icon: 'range', text: `Score ${min}-${max}%` };
}

export function relativeTimeLabel(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const h = Math.floor(diffMs / 3600000);
    if (h < 24 && h >= 0) return h <= 1 ? '1h ago' : `${h}h ago`;
    const days = Math.floor(diffMs / 86400000);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export function formatTriggerPreview(
  conditionType: RecommendationConditionType,
  scoreThreshold: number
): string {
  const t = scoreThreshold;
  return conditionType === 'scoreUnderThreshold'
    ? `Score < ${t}%`
    : `Score > ${t}%`;
}

export function actionIconForResourceType(resourceType: string): string {
  const r = resourceType.toLowerCase();
  if (r.includes('video')) return 'ondemand_video';
  if (r.includes('quiz')) return 'quiz';
  if (r.includes('workshop')) return 'groups';
  if (r.includes('reading')) return 'menu_book';
  return 'description';
}
