import { Component, input, output } from '@angular/core';
import { SearchBarComponent } from '../../ui/search-bar/search-bar';

// top bar - sticky header at the top of every page
// shows page title, search, notifications, and user profile
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './top-bar.html',
})
export class TopBarComponent {
  // current page title
  pageTitle = input<string>('');

  // breadcrumb text (optional)
  breadcrumb = input<string>('');

  // search placeholder
  searchPlaceholder = input<string>('Search...');

  // whether to show the search bar
  showSearch = input<boolean>(true);

  // emitted when user searches
  searchChange = output<string>();

  // user info - hardcoded for now
  userName = 'Dr. Aruna Perera';
  userRole = 'Senior Lecturer';
  userInitials = 'AP';

  onSearch(value: string) {
    this.searchChange.emit(value);
  }
}
