import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RiskProgressionPoint } from '../../../models/risk-analysis/risk-progression-point.model';
import type { PeakReadinessMarker } from '../../../models/risk-analysis/peak-readiness-marker.model';

@Component({
  selector: 'app-risk-progression-trend-card',
  standalone: true,
  templateUrl: './risk-progression-trend-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskProgressionTrendCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly currentCohortPoints = input.required<RiskProgressionPoint[]>();
  readonly previousCohortPoints = input.required<RiskProgressionPoint[]>();
  readonly peakMarker = input.required<PeakReadinessMarker>();

  protected maxValue(): number {
    const current = this.currentCohortPoints();
    const previous = this.previousCohortPoints();
    const all = [...current.map((p) => p.value), ...previous.map((p) => p.value)];
    return Math.max(100, ...all);
  }

  protected yPercent(value: number): number {
    const max = this.maxValue();
    return 100 - (value / max) * 80;
  }

  protected peakMarkerIndex(): number {
    const points = this.currentCohortPoints();
    const key = this.peakMarker().monthKey;
    const idx = points.findIndex((p) => p.month === key);
    return idx >= 0 ? idx : 0;
  }

  protected peakMarkerLeftPercent(): number {
    const points = this.currentCohortPoints();
    const n = points.length;
    if (n <= 1) return 50;
    const idx = this.peakMarkerIndex();
    return (idx / (n - 1)) * 100;
  }

  protected currentPath(): string {
    const points = this.currentCohortPoints();
    const max = this.maxValue();
    if (!points.length) return '';
    const w = 400;
    const h = 200;
    const pad = 10;
    const xStep = (w - 2 * pad) / Math.max(1, points.length - 1);
    const ys = points.map((p) => h - pad - ((p.value / max) * (h - 2 * pad)));
    const xs = points.map((_, i) => pad + i * xStep);
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      d += ` L ${xs[i]} ${ys[i]}`;
    }
    d += ` L ${xs[xs.length - 1]} ${h - pad} L ${xs[0]} ${h - pad} Z`;
    return d;
  }

  protected previousPath(): string {
    const points = this.previousCohortPoints();
    const max = this.maxValue();
    if (!points.length) return '';
    const w = 400;
    const h = 200;
    const pad = 10;
    const xStep = (w - 2 * pad) / Math.max(1, points.length - 1);
    const xs = points.map((_, i) => pad + i * xStep);
    const ys = points.map((p) => h - pad - ((p.value / max) * (h - 2 * pad)));
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      d += ` L ${xs[i]} ${ys[i]}`;
    }
    return d;
  }
}
