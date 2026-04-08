import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ConfirmPromptDialogComponent } from '../../../components/ui/confirm-dialog/confirm-prompt-dialog';
import { CurriculumOverlayModalComponent } from '../../../components/ui/curriculum-overlay-modal/curriculum-overlay-modal.component';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { SemesterOffering, OfferingStats } from '../../../models/curriculum/semester-offering.model';
import { Module } from '../../../models/curriculum/module.model';

// semester offerings page - manage which modules are offered each semester
@Component({
  selector: 'app-semester-offerings',
  standalone: true,
  imports: [
    MemberShellComponent,
    PillBadgeComponent,
    LoadingSpinnerComponent,
    ConfirmPromptDialogComponent,
    CurriculumOverlayModalComponent,
    FormsModule,
  ],
  templateUrl: './semester-offerings.html',
})
export class SemesterOfferingsComponent implements OnInit {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  offerings = signal<SemesterOffering[]>([]);
  stats = signal<OfferingStats>({ completionPercentage: 0, attentionNeeded: 0, efficiencyGrowth: 0 });

  // modules for the add/edit modal dropdown
  modules = signal<Module[]>([]);

  // add/edit modal state
  showModal = signal(false);
  isEditMode = signal(false);
  editingId = signal('');
  formModuleId = signal('');
  formProgram = signal('');
  formIntake = signal('');
  formSemester = signal('');
  formLecturerName = signal('');
  formStatus = signal('Draft');

  // delete dialog
  showDeleteDialog = signal(false);
  offeringToDelete = signal<SemesterOffering | null>(null);

  ngOnInit() {
    this.loadData();
    this.curriculumService.getModules().subscribe({
      next: (mods) => this.modules.set(mods),
      error: () => console.error('Failed to load modules'),
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.curriculumService.getOfferings().subscribe({
      next: (data) => {
        this.offerings.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load offerings');
        this.isLoading.set(false);
      },
    });
    this.curriculumService.getOfferingStats().subscribe((s) => this.stats.set(s));
  }

  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Published': return 'primary';
      case 'Inactive': return 'error';
      default: return 'neutral';
    }
  }

  // open modal for adding new offering
  openAddModal() {
    this.isEditMode.set(false);
    this.editingId.set('');
    this.formModuleId.set('');
    this.formProgram.set('BSc IT');
    this.formIntake.set('');
    this.formSemester.set('');
    this.formLecturerName.set('');
    this.formStatus.set('Draft');
    this.showModal.set(true);
  }

  // open modal for editing an existing offering
  openEditModal(offering: SemesterOffering) {
    this.isEditMode.set(true);
    this.editingId.set(offering.id);
    this.formModuleId.set(offering.moduleId);
    this.formProgram.set(offering.program);
    this.formIntake.set(offering.intake);
    this.formSemester.set(offering.semester);
    this.formLecturerName.set(offering.lecturerName);
    this.formStatus.set(offering.status);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // save the offering (create or update)
  onSaveOffering() {
    if (!this.formModuleId() || !this.formIntake() || !this.formLecturerName()) {
      this.toastService.error('Please fill all required fields');
      return;
    }

    // generate avatar from lecturer name
    const nameParts = this.formLecturerName().split(' ');
    const avatar = nameParts.map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    const body: any = {
      moduleId: this.formModuleId(),
      program: this.formProgram(),
      intake: this.formIntake(),
      semester: this.formSemester(),
      lecturerName: this.formLecturerName(),
      lecturerAvatar: avatar,
      avatarColor: 'bg-primary-fixed',
      status: this.formStatus(),
    };

    if (this.isEditMode()) {
      // update existing - semester offerings controller doesn't have a dedicated update DTO
      // so we reuse the create DTO format
      this.curriculumService.updateOffering(this.editingId(), body).subscribe({
        next: () => {
          this.toastService.success('Offering updated successfully');
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to update offering');
        },
      });
    } else {
      this.curriculumService.createOffering(body).subscribe({
        next: () => {
          this.toastService.success('Offering created successfully');
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to create offering');
        },
      });
    }
  }

  // delete
  confirmDelete(offering: SemesterOffering) {
    this.offeringToDelete.set(offering);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed() {
    const o = this.offeringToDelete();
    if (o) {
      this.curriculumService.deleteOffering(o.id).subscribe({
        next: () => {
          this.toastService.success('Offering deleted');
          this.showDeleteDialog.set(false);
          this.offeringToDelete.set(null);
          this.loadData();
        },
        error: () => this.toastService.error('Failed to delete offering'),
      });
    }
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.offeringToDelete.set(null);
  }
}
