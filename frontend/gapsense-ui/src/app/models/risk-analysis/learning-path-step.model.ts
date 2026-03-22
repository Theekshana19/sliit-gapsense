import type { LearningPathResourcePanel } from './learning-path-resource.model';
import type { LearningPathMetadataItem } from './learning-path-resource.model';

export type LearningPathStepStatus = 'completed' | 'in_progress' | 'locked';

export interface LearningPathStep {
  id: string;
  stepNumber: number;
  title: string;
  status: LearningPathStepStatus;
  /** Date string for completed steps. */
  date?: string;
  /** Badge label in top-right (e.g. "Recommended Action"). */
  badgeLabel?: string;
  /** Description/recommendation note for in-progress steps. */
  recommendationNote?: string;
  /** Metadata row (quiz, duration, etc.) for completed/locked. */
  metadata?: LearningPathMetadataItem[];
  /** Embedded resource panel for in-progress step. */
  resourcePanel?: LearningPathResourcePanel;
  /** Action link label (e.g. "View Performance Summary"). */
  actionLabel?: string;
  /** Helper note for locked steps (e.g. "Unlocks after completing X"). */
  unlockNote?: string;
}
