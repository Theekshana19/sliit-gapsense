import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-risk-trends-header-actions',
  standalone: true,
  templateUrl: './risk-trends-header-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskTrendsHeaderActionsComponent {
  readonly exportPdf = output<void>();
  readonly shareInsight = output<void>();
}
