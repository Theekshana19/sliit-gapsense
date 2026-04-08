export type ProjectionBarVariant = 'historical' | 'projection';

export interface ProjectionBar {
  label: string;
  /** 0–100, used as CSS height % inside chart area */
  heightPercent: number;
  variant: ProjectionBarVariant;
}

export interface ProjectionSummaryView {
  subtitle: string;
  bars: ProjectionBar[];
  /** Plain sentence; use {{name}} and {{percent}} for template substitution */
  insightTemplate: string;
  insightHighlightPercent: number;
}
