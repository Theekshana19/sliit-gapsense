import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-guidelines-panel',
  standalone: true,
  templateUrl: './recommendation-guidelines-panel.component.html',
  styleUrl: './recommendation-guidelines-panel.component.css',
})
export class RecommendationGuidelinesPanelComponent {
  readonly footerNote = input<string>(
    'Last version update was 14 days ago by admin_jane.'
  );
}
