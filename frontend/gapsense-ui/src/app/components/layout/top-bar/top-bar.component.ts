import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  readonly activeMainNav = input<string>('analysis');

  private readonly router = inject(Router);

  protected isAnalysisRoute(): boolean {
    const path = this.router.url.split('?')[0] ?? '';
    return path.startsWith('/risk-thresholds') || path.startsWith('/recommendation-rules');
  }
}
