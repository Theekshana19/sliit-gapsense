import { Component, input } from '@angular/core';

// simple loading spinner - shows when data is loading
// usage: <app-loading-spinner size="md" />
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.html',
})
export class LoadingSpinnerComponent {
  // size of the spinner - sm, md, or lg
  size = input<'sm' | 'md' | 'lg'>('md');
}
