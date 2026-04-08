import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-readiness-interpretation-alert',
  standalone: true,
  templateUrl: './readiness-interpretation-alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessInterpretationAlertComponent {
  readonly message = input.required<string>();
  readonly tone = input<'warning' | 'info' | 'success'>('warning');
}
