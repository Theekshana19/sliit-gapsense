import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { ShellSearchService } from '../../../services/shell-search.service';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  riskIcon?: boolean;
}

/** Admin + lecturer: monitoring and risk-analysis shell (routes guarded accordingly). */
const STAFF_MAIN_LINKS: SidebarLink[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/readiness/overview', label: 'Batch Overview', icon: 'groups' },
  { path: '/risk-analysis/heatmap', label: 'High-Risk Students', icon: 'warning', riskIcon: true },
  { path: '/monitoring/plans', label: 'Interventions', icon: 'auto_fix_high' },
  { path: '/monitoring/follow-ups', label: 'Follow-ups', icon: 'campaign' },
  { path: '/risk-analysis/reports', label: 'Reports', icon: 'description' },
];

/** Student: only routes this role may use (staff links removed to avoid dead-end redirects). */
const STUDENT_MAIN_LINKS: SidebarLink[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/readiness-results', label: 'Readiness Result', icon: 'fact_check' },
  { path: '/readiness/available-quizzes', label: 'Readiness quizzes', icon: 'quiz' },
  { path: '/notifications', label: 'Notifications', icon: 'notifications' },
  { path: '/risk-trends', label: 'Risk Trends', icon: 'trending_up' },
];

const CTA_LINK: SidebarLink = {
  path: '/monitoring/intervention-plan',
  label: 'New Intervention',
  icon: 'add',
};

@Component({
  standalone: true,
  selector: 'app-tharindu-shell-sidebar',
  imports: [RouterLink, RouterLinkActive],
  styles: `
    :host a.sidebar-link.router-link-active {
      background: #fff;
      color: #003f87;
      font-weight: 600;
      border: 1px solid rgb(226 232 240 / 0.9);
      box-shadow:
        0 1px 3px rgb(15 23 42 / 0.08),
        0 6px 16px rgb(0 63 135 / 0.09);
    }
    :host a.sidebar-link:not(.router-link-active) {
      color: #475569;
    }
    :host a.sidebar-link:not(.router-link-active) .sidebar-icon {
      color: #64748b;
    }
    :host a.sidebar-link.router-link-active .sidebar-icon:not(.sidebar-icon--risk) {
      color: #003f87;
    }
    :host a.sidebar-link.router-link-active .sidebar-icon.sidebar-icon--risk {
      color: #dc2626;
    }
    :host a.sidebar-link:not(.router-link-active) .sidebar-icon.sidebar-icon--risk {
      color: #dc2626;
    }
  `,
  template: `
    <aside
      class="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col overflow-hidden border-r border-slate-200/80 bg-white pt-16 shadow-sm lg:flex"
    >
      <nav
        class="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-6 pb-2 pt-4 text-sm font-medium [scrollbar-gutter:stable]"
      >
        @for (item of filteredMainLinks(); track item.path) {
          <a
            [routerLink]="item.path"
            [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
            routerLinkActive="router-link-active"
            class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-slate-50/80"
          >
            <span
              class="sidebar-icon material-symbols-outlined text-[22px] leading-none"
              [class.sidebar-icon--risk]="item.riskIcon"
              >{{ item.icon }}</span
            >
            {{ item.label }}
          </a>
        }
        @if (filteredMainLinks().length === 0 && shellSearch.query().trim()) {
          <p class="px-4 py-6 text-center text-xs leading-relaxed text-slate-500">
            No navigation items match "{{ shellSearch.query().trim() }}".
          </p>
        }
      </nav>

      @if (showCta()) {
        <div class="shrink-0 px-6 py-6">
          <a
            [routerLink]="ctaLink.path"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#003f87] to-[#0056b3] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#003f87]/28 transition hover:brightness-110"
          >
            <span class="material-symbols-outlined text-[20px]">{{ ctaLink.icon }}</span>
            {{ ctaLink.label }}
          </a>
        </div>
      }

      <div class="shrink-0 space-y-1 px-6 pb-8 pt-2">
        <a
          routerLink="/settings"
          routerLinkActive="router-link-active"
          class="sidebar-link flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
        >
          <span class="material-symbols-outlined text-[20px] text-slate-500">settings</span>
          Settings
        </a>
        <button
          type="button"
          (click)="logout()"
          class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
        >
          <span class="material-symbols-outlined text-[20px] text-rose-600">logout</span>
          Logout
        </button>
      </div>
    </aside>
  `,
})
export class TharinduShellSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  readonly shellSearch = inject(ShellSearchService);

  readonly ctaLink = CTA_LINK;

  private mainLinksForRole(): SidebarLink[] {
    const role = this.session.user()?.role;
    return role === 'student' ? STUDENT_MAIN_LINKS : STAFF_MAIN_LINKS;
  }

  readonly filteredMainLinks = computed(() => {
    const base = this.mainLinksForRole();
    const q = this.shellSearch.query().trim().toLowerCase();
    if (!q) {
      return base;
    }
    return base.filter((item) => linkMatches(item, q));
  });

  readonly showCta = computed(() => {
    if (this.session.user()?.role === 'student') {
      return false;
    }
    const q = this.shellSearch.query().trim().toLowerCase();
    if (!q) {
      return true;
    }
    return linkMatches(CTA_LINK, q);
  });

  logout(): void {
    this.auth.logout();
  }
}

function linkMatches(item: SidebarLink, q: string): boolean {
  const label = item.label.toLowerCase();
  const pathTokens = item.path.toLowerCase().replace(/^\//, '').split(/[/\-_]+/);
  if (label.includes(q)) {
    return true;
  }
  if (pathTokens.some((t) => t.length > 0 && t.includes(q))) {
    return true;
  }
  if (q.length >= 2 && pathTokens.some((t) => t.startsWith(q))) {
    return true;
  }
  return false;
}
