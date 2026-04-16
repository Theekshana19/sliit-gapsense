import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AcademicSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-academic-settings',
  imports: [FormsModule],
  templateUrl: './academic-settings.component.html',
})
export class AcademicSettingsComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);

  academic: AcademicSettings = {
    semester: '',
    academicYear: '',
    defaultModule: '',
    assignedFaculty: '',
  };

  semesterOptions: string[] = [];
  yearOptions: string[] = [];
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      academic: this.settings.getAcademic(),
      options: this.settings.getAcademicOptions(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ academic, options }) => {
          this.academic = { ...academic };
          this.semesterOptions = options.semesterOptions;
          this.yearOptions = options.yearOptions;
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to load academic settings.', 'error'),
      });
  }

  save(): void {
    this.saving = true;
    this.settings
      .updateAcademic(this.academic)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (saved) => {
          this.academic = { ...saved };
          this.toast.show('Academic settings saved.', 'success');
        },
        error: (err: Error) => this.toast.show(err.message || 'Failed to save academic settings.', 'error'),
      });
  }
}
