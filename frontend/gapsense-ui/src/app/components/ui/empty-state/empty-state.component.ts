import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  /** Material symbol name; defaults to inbox when omitted. */
  readonly icon = input<string | null>(null);
  readonly title = input<string>('No data');
  readonly message = input<string>('Get started by adding your first item.');
}
