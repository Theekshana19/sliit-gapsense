import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-hero-panel',
  standalone: true,
  templateUrl: './auth-hero-panel.component.html',
  styleUrl: './auth-hero-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthHeroPanelComponent {
  /** Visual tone for gradient / pattern */
  readonly tone = input<'deep' | 'mid'>('deep');
}
