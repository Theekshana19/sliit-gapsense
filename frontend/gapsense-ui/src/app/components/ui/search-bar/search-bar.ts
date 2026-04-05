import { Component, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, Subscription } from 'rxjs';

// search bar with debounce - waits 300ms after user stops typing
// usage: <app-search-bar placeholder="Search questions..." (searchChange)="onSearch($event)" />
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  // placeholder text
  placeholder = input<string>('Search...');

  // emits the search text after debounce
  searchChange = output<string>();

  // the current search text
  searchText = signal('');

  // debounce subject - waits before emitting
  private searchSubject = new Subject<string>();
  private subscription?: Subscription;

  ngOnInit() {
    // wait 300ms after user stops typing, then emit
    this.subscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.searchChange.emit(value);
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  // called when user types in the search box
  onInput(value: string) {
    this.searchText.set(value);
    this.searchSubject.next(value);
  }

  // clear the search
  clear() {
    this.searchText.set('');
    this.searchSubject.next('');
  }
}
