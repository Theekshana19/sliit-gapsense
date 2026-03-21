import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { ModuleFormComponent } from '../../../components/curriculum/module-form/module-form';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Module } from '../../../models/curriculum/module.model';

// add/edit module page - create new or edit existing module
@Component({
  selector: 'app-add-edit-module',
  standalone: true,
  imports: [MainLayoutComponent, ModuleFormComponent],
  templateUrl: './add-edit-module.html',
})
export class AddEditModuleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isEditMode = signal(false);
  module = signal<Module | null>(null);
  pageTitle = signal('Add Module');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Module');
      this.curriculumService.getModuleById(id).subscribe((m) => {
        if (m) {
          this.module.set(m);
        } else {
          this.toastService.error('Module not found');
          this.router.navigate(['/curriculum/module-management']);
        }
      });
    }
  }

  onFormSubmit(data: Partial<Module>) {
    if (this.isEditMode()) {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.curriculumService.updateModule(id, data).subscribe(() => {
        this.toastService.success('Module updated successfully');
        this.router.navigate(['/curriculum/module-management']);
      });
    } else {
      this.curriculumService.createModule(data).subscribe(() => {
        this.toastService.success('Module created successfully');
        this.router.navigate(['/curriculum/module-management']);
      });
    }
  }

  onFormCancel() {
    this.router.navigate(['/curriculum/module-management']);
  }
}
