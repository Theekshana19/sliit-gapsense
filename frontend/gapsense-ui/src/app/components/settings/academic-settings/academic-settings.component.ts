import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AcademicSettings } from '../../../models/settings/settings.model';
import { ToastService } from '../../ui/toast/toast.service';
import { SettingsService } from '../../../services/settings.service';

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

  readonly semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'] as const;
  readonly yearOptions = ['2024/2025', '2025/2026', '2026/2027'] as const;

  ngOnInit(): void {
    this.academic = { ...this.settings.getSettings().academic };
  }

  save(): void {
    this.settings.updateAcademic(this.academic);
    this.toast.show('Academic settings saved.', 'success');
  }
}
