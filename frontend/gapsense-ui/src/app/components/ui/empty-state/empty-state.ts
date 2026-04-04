import { Component, input } from '@angular/core';

// empty state - shown when there's no data to display
// usage: <app-empty-state icon="search_off" title="No results" message="Try different filters" />
@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
})
export class EmptyStateComponent {
  // material icon name
  icon = input<string>('inbox');

  // main title
  title = input<string>('No data found');

  // description message
  message = input<string>('There is nothing to show here yet.');
}
