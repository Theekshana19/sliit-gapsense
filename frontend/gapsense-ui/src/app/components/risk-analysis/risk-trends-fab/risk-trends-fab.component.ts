import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-risk-trends-fab',
  standalone: true,
  templateUrl: './risk-trends-fab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskTrendsFabComponent {
  readonly click = output<void>();
}
