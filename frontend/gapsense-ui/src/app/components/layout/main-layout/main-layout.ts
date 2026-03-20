import { Component, input, output } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopBarComponent } from '../top-bar/top-bar';

// main layout - wraps sidebar + top bar + page content
// used by all 6 lecturer-facing pages (everything except quiz attempt)
// usage:
// <app-main-layout pageTitle="Question Bank" breadcrumb="Academic > Question Bank">
//   <div>page content here</div>
// </app-main-layout>
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SidebarComponent, TopBarComponent],
  templateUrl: './main-layout.html',
})
export class MainLayoutComponent {
  // passed to top bar
  pageTitle = input<string>('');
  breadcrumb = input<string>('');
  searchPlaceholder = input<string>('Search...');
  showSearch = input<boolean>(true);

  // search event from top bar
  searchChange = output<string>();

  onSearch(value: string) {
    this.searchChange.emit(value);
  }
}
