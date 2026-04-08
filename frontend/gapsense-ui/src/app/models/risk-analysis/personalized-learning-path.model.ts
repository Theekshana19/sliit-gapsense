import type { LearningPathStep } from './learning-path-step.model';
import type { LearningPathSummary } from './learning-path-summary.model';
import type { LearningPathResumeItem } from './learning-path-resource.model';
import type { LearningPathFooterAction } from './learning-path-footer-action.model';

/** Full view model for the Personalized Learning Path page (mock or API-mapped). */
export interface PersonalizedLearningPathViewModel {
  summary: LearningPathSummary;
  resumeItem: LearningPathResumeItem;
  steps: LearningPathStep[];
  footerActions: LearningPathFooterAction;
}
