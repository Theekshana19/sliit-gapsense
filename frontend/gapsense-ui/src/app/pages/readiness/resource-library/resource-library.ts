import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { ReadinessService } from '../../../services/readiness.service';
import { ToastService } from '../../../services/toast.service';
import { Resource } from '../../../models/readiness/resource.model';

// resource library page - browse learning resources to prepare for quizzes
// students click resources to open them in a new tab
// lecturers/admins can see resources but creation is via API for now
// route: /readiness/resources
@Component({
  selector: 'app-resource-library',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent],
  templateUrl: './resource-library.html',
})
export class ResourceLibraryComponent implements OnInit {
  private readinessService = inject(ReadinessService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  resources = signal<Resource[]>([]);

  // filter state
  filterType = signal<string>('');
  filterModule = signal<string>('');
  searchText = signal<string>('');

  // get unique modules from the resources for the dropdown
  uniqueModules = computed(() => {
    const modules = new Set<string>();
    this.resources().forEach((r) => {
      if (r.moduleCode) modules.add(r.moduleCode);
    });
    return Array.from(modules).sort();
  });

  // get filtered resources based on current filters
  filteredResources = computed(() => {
    let result = this.resources();

    if (this.filterType()) {
      result = result.filter((r) => r.type === this.filterType());
    }
    if (this.filterModule()) {
      result = result.filter((r) => r.moduleCode === this.filterModule());
    }
    if (this.searchText()) {
      const search = this.searchText().toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search) ||
          r.topic.toLowerCase().includes(search)
      );
    }

    return result;
  });

  // count by type for the stats cards
  pdfCount = computed(() => this.resources().filter((r) => r.type === 'PDF').length);
  videoCount = computed(() => this.resources().filter((r) => r.type === 'Video').length);
  articleCount = computed(() => this.resources().filter((r) => r.type === 'Article').length);
  linkCount = computed(() => this.resources().filter((r) => r.type === 'Link').length);

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.isLoading.set(true);
    this.readinessService.getResources().subscribe({
      next: (data) => {
        this.resources.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load resources');
        this.isLoading.set(false);
      },
    });
  }

  // open resource URL in a new tab
  openResource(resource: Resource) {
    if (!resource.url) {
      this.toastService.error('No URL available for this resource');
      return;
    }
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  }

  // get the icon for each resource type
  getIcon(type: string): string {
    switch (type) {
      case 'PDF': return 'picture_as_pdf';
      case 'Video': return 'play_circle';
      case 'Article': return 'article';
      case 'Link': return 'link';
      default: return 'description';
    }
  }

  // get color class for each resource type
  getTypeColor(type: string): string {
    switch (type) {
      case 'PDF': return 'text-error bg-error-container';
      case 'Video': return 'text-primary bg-primary-fixed';
      case 'Article': return 'text-tertiary bg-tertiary-fixed';
      case 'Link': return 'text-on-secondary-container bg-secondary-container';
      default: return 'text-on-surface-variant bg-surface-container-high';
    }
  }

  // pill variant for the type badge
  getTypeVariant(type: string): 'primary' | 'error' | 'success' | 'neutral' {
    switch (type) {
      case 'PDF': return 'error';
      case 'Video': return 'primary';
      case 'Article': return 'success';
      default: return 'neutral';
    }
  }
}
