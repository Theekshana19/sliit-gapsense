/** How the topic bar should render (matches dashboard severity styling). */
export type TopicPerformanceBarVariant = 'critical' | 'neutral';

export interface TopicPerformanceItem {
  topicName: string;
  /** 0–100 */
  percent: number;
  barVariant: TopicPerformanceBarVariant;
}
