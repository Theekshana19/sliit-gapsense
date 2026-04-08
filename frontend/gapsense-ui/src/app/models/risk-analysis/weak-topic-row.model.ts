export type WeaknessLevel = 'critical' | 'moderate' | 'minor' | 'none';

export type TopicMatrixStatus =
  | 'immediate_action'
  | 'scheduled_review'
  | 'self_study'
  | 'meeting_target';

export interface WeakTopicMatrixRow {
  topicName: string;
  blockLabel: string;
  currentScorePercent: number;
  expectedLevelPercent: number;
  weaknessLevel: WeaknessLevel;
  status: TopicMatrixStatus;
}
