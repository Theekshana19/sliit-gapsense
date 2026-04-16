import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationBellComponent } from '../../notification/notification-bell/notification-bell.component';
import { SessionService } from '../../../services/session.service';
import { ShellSearchService } from '../../../services/shell-search.service';
import { SHELL_SEARCH_MAX_LENGTH } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, NotificationBellComponent],
  styles: `
    /* Avoid native search-input chrome (often draws a line/underline under the field). */
    .shell-search-input {
      -webkit-appearance: none;
      appearance: none;
    }
    .shell-search-input::-webkit-search-decoration,
    .shell-search-input::-webkit-search-cancel-button,
    .shell-search-input::-webkit-search-results-button,
    .shell-search-input::-webkit-search-results-decoration {
      display: none;
      -webkit-appearance: none;
    }
  `,
  template: `
    <header
      class="fixed top-0 z-50 flex h-16 w-full items-center gap-4 border-b border-slate-200/80 bg-white px-4 shadow-sm sm:px-6 lg:pl-64 lg:pr-8"
    >
      <!-- Left: SLIIT GapSense wordmark + dashboard sub-nav -->
      <div class="flex min-w-0 shrink-0 items-center gap-6 md:gap-8">
        <a
          routerLink="/dashboard"
          class="font-headline text-xl font-extrabold tracking-tight text-[#003f87] transition-opacity hover:opacity-90"
        >
          SLIIT GapSense
        </a>
        @if (isDashboardLayout()) {
          <nav class="hidden items-center gap-1 md:flex">
            <a
              routerLink="/dashboard"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="border-b-2 border-[#003f87] font-bold text-[#003f87]"
              class="border-b-2 border-transparent px-4 py-5 text-sm font-medium text-slate-500 transition-colors hover:text-[#003f87]"
            >
              Overview
            </a>
            <a
              routerLink="/readiness/overview"
              routerLinkActive="border-b-2 border-[#003f87] font-bold text-[#003f87]"
              class="border-b-2 border-transparent px-4 py-5 text-sm font-medium text-slate-500 transition-colors hover:text-[#003f87]"
            >
              Students
            </a>
            <a
              routerLink="/risk-analysis/heatmap"
              routerLinkActive="border-b-2 border-[#003f87] font-bold text-[#003f87]"
              class="border-b-2 border-transparent px-4 py-5 text-sm font-medium text-slate-500 transition-colors hover:text-[#003f87]"
            >
              Analytics
            </a>
          </nav>
        }
      </div>

      <!-- Search + utilities -->
      <div class="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <div class="relative mx-2 hidden min-w-0 flex-1 md:block lg:max-w-2xl xl:max-w-3xl">
          <div class="relative w-full">
            <span
              class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >search</span
            >
            <input
              type="text"
              role="search"
              enterkeyhint="search"
              class="shell-search-input w-full rounded-full border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-2 focus:ring-[#003f87]/25 focus:ring-offset-0"
              placeholder="Search data"
              [value]="shellSearch.query()"
              (input)="shellSearch.setQuery($any($event.target).value)"
              autocomplete="off"
              aria-label="Search data"
            />
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <app-notification-bell />
          <a
            routerLink="/settings"
            class="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Settings"
          >
            <span class="material-symbols-outlined text-[22px] text-slate-600">settings</span>
          </a>

          @if (session.user(); as u) {
            @if (isDashboardLayout()) {
              <div class="flex items-center gap-3">
                @if (showRegistrarLabel()) {
                  <div class="hidden text-right leading-tight xl:block">
                    <p class="text-sm font-semibold text-slate-900">{{ u.name }}</p>
                    <p class="text-xs text-slate-500">Academic Registrar</p>
                  </div>
                }
                <div class="relative">
                  <div
                    class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#d7e2ff] ring-2 ring-white"
                  >
                    <span class="text-sm font-bold text-[#004491]">{{ u.name.slice(0, 1) }}</span>
                  </div>
                  <span
                    class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                    aria-hidden="true"
                  ></span>
                </div>
              </div>
            } @else {
              <div class="ml-1 flex items-center gap-3 pl-1">
                <div class="hidden text-right leading-tight sm:block">
                  <p class="text-sm font-bold text-[#003f87]">{{ u.name }}</p>
                  <p class="text-xs text-slate-500">Academic Registrar</p>
                </div>
                <div class="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=faces"
                    [alt]="u.name"
                    class="h-full w-full object-cover"
                    width="36"
                    height="36"
                  />
                </div>
              </div>
            }
          } @else {
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Guest Session</span>
          }
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly searchMax = SHELL_SEARCH_MAX_LENGTH;
  readonly session = inject(SessionService);
  readonly shellSearch = inject(ShellSearchService);
  private readonly router = inject(Router);

  isDashboardLayout(): boolean {
    const path = this.router.url.split('?')[0].replace(/\/$/, '') || '/';
    return path === '/dashboard';
  }

  showRegistrarLabel(): boolean {
    return this.router.url.includes('/heatmap');
  }
}
