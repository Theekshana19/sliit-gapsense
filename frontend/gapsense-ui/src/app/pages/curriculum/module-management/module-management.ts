import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../../components/ui/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../components/ui/confirm-dialog/confirm-dialog';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Module, ModuleFilter, ModuleStats } from '../../../models/curriculum/module.model';

// module management page - list all academic modules
// lecturers can browse, filter, edit and archive modules here
@Component({
  selector: 'app-module-management',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './module-management.html',
})
export class ModuleManagementComponent implements OnInit {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(true);
  modules = signal<Module[]>([]);
  stats = signal<ModuleStats>({ totalModules: 0, activeModules: 0, totalCreditHours: 0, needsAttention: 0 });

  // filters
  filterProgram = signal('');
  filterSemester = signal('');
  filterStatus = signal('');

  // dropdown options
  programs: string[] = [];
  semesters: string[] = [];

  // delete dialog
  showDeleteDialog = signal(false);
  moduleToDelete = signal<Module | null>(null);

  // pagination
  currentPage = signal(1);
  pageSize = 8;

  ngOnInit() {
    this.programs = this.curriculumService.getPrograms();
    this.semesters = this.curriculumService.getSemesters();
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    const filter: ModuleFilter = {
      program: this.filterProgram() as any,
      semester: this.filterSemester() as any,
      status: this.filterStatus() as any,
    };

    this.curriculumService.getModules(filter).subscribe((data) => {
      this.modules.set(data);
      this.isLoading.set(false);
    });

    this.curriculumService.getModuleStats().subscribe((s) => this.stats.set(s));
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadData();
  }

  get paginatedModules(): Module[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.modules().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.modules().length / this.pageSize);
  }

  goToAddModule() {
    this.router.navigate(['/curriculum/modules/new']);
  }

  goToEditModule(id: string) {
    this.router.navigate(['/curriculum/modules', id, 'edit']);
  }

  goToTopics(moduleId: string) {
    this.router.navigate(['/curriculum/modules', moduleId, 'topics']);
  }

  confirmDelete(module: Module) {
    this.moduleToDelete.set(module);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed() {
    const mod = this.moduleToDelete();
    if (mod) {
      this.curriculumService.deleteModule(mod.id).subscribe(() => {
        this.toastService.success('Module archived successfully');
        this.showDeleteDialog.set(false);
        this.moduleToDelete.set(null);
        this.loadData();
      });
    }
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.moduleToDelete.set(null);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage.set(page);
  }

  getStatusVariant(status: string): 'primary' | 'neutral' | 'error' {
    switch (status) {
      case 'Active': return 'primary';
      case 'Archived': return 'error';
      default: return 'neutral';
    }
  }
}
