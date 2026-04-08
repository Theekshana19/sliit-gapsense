import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-recommendations-header-actions',
  standalone: true,
  templateUrl: './recommendations-header-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsHeaderActionsComponent {
  readonly filter = output<void>();
  readonly generateNew = output<void>();
}
