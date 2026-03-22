import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-learning-path-fab',
  standalone: true,
  templateUrl: './learning-path-fab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathFabComponent {
  readonly help = output<void>();
}
