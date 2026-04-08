export type TopicMasteryBarColor = 'primary' | 'error' | 'secondary';

export interface TopicMasteryItemView {
  topicName: string;
  percent: number;
  barColor: TopicMasteryBarColor;
}
