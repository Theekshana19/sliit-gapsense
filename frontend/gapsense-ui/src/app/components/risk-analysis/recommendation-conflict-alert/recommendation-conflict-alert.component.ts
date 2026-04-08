import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-recommendation-conflict-alert',
  standalone: true,
  templateUrl: './recommendation-conflict-alert.component.html',
  styleUrl: './recommendation-conflict-alert.component.css',
})
export class RecommendationConflictAlertComponent {
  readonly message = input.required<string>();
  readonly visible = input<boolean>(true);

  readonly dismiss = output<void>();
}
