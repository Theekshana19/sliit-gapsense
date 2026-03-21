import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-live-preview',
  standalone: true,
  templateUrl: './recommendation-live-preview.component.html',
  styleUrl: './recommendation-live-preview.component.css',
})
export class RecommendationLivePreviewComponent {
  readonly recommendationTitle = input<string>('');
  readonly triggerLabel = input<string>('');
  readonly priorityLabel = input<string>('');
  readonly moduleCode = input<string>('');
  readonly topicLabel = input<string>('');

  protected topicAbbrev(): string {
    const t = this.topicLabel();
    if (!t) return '—';
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0]![0] + parts[1]![0]).toUpperCase();
    }
    return t.slice(0, 2).toUpperCase();
  }
}
