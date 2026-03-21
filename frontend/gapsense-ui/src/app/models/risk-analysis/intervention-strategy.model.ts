export type InterventionItemTone = 'error' | 'secondary';

export interface InterventionStrategyItem {
  icon: string;
  tone: InterventionItemTone;
  title: string;
  description: string;
}

export interface InterventionStrategyView {
  items: InterventionStrategyItem[];
}
