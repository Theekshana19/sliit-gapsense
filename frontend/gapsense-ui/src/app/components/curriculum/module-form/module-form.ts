import { Component, input, output, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Module, ModuleStatus, Program, Semester } from '../../../models/curriculum/module.model';
import { CurriculumService } from '../../../services/curriculum.service';

// module form - used in add/edit module page
// handles creating new modules and editing existing ones
@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './module-form.html',
})
export class ModuleFormComponent implements OnInit {
  private curriculumService = inject(CurriculumService);

  // pass a module to edit, or null for creating new
  module = input<Module | null>(null);

  // emitted when form is submitted
  formSubmit = output<Partial<Module>>();

  // emitted when user clicks cancel
  formCancel = output<void>();

  // form fields
  moduleCode = signal('');
  moduleName = signal('');
  description = signal('');
  program = signal<Program>('BSc IT');
  semester = signal<Semester>('Y1S1');
  credits = signal(3);
  status = signal<ModuleStatus>('Draft');

  // track if user tried to submit (shows errors only after first attempt)
  submitted = signal(false);

  // dropdown options
  programs: string[] = ['BSc IT', 'BSc CS', 'BSc SE', 'BSc DS'];
  semesters: string[] = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];

  // --- validation rules ---

  // module code must be exactly 6 characters like "IT2040"
  codeError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.moduleCode().trim()) return 'Module code is required';
    if (this.moduleCode().trim().length !== 6) return 'Module code must be exactly 6 characters (e.g. IT2040)';
    return '';
  });

  // module name must not be empty
  nameError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.moduleName().trim()) return 'Module name is required';
    if (this.moduleName().trim().length < 3) return 'Module name must be at least 3 characters';
    return '';
  });

  // credits must be between 1 and 6
  creditsError = computed(() => {
    if (!this.submitted()) return '';
    if (this.credits() < 1) return 'Credits must be at least 1';
    if (this.credits() > 6) return 'Credits cannot exceed 6';
    return '';
  });

  // check if the whole form is valid
  isFormValid = computed(() => {
    return (
      this.moduleCode().trim().length === 6 &&
      this.moduleName().trim().length >= 3 &&
      this.credits() >= 1 &&
      this.credits() <= 6
    );
  });

  ngOnInit() {
    // if editing, fill form with existing data
    const m = this.module();
    if (m) {
      this.moduleCode.set(m.moduleCode);
      this.moduleName.set(m.moduleName);
      this.description.set(m.description);
      this.program.set(m.program);
      this.semester.set(m.semester);
      this.credits.set(m.credits);
      this.status.set(m.status);
    }
  }

  // submit the form - only if valid
  onSubmit() {
    this.submitted.set(true);

    // don't submit if form has errors
    if (!this.isFormValid()) return;

    const data: Partial<Module> = {
      moduleCode: this.moduleCode(),
      moduleName: this.moduleName(),
      description: this.description(),
      program: this.program(),
      semester: this.semester(),
      credits: this.credits(),
      status: this.status(),
    };
    this.formSubmit.emit(data);
  }

  onCancel() {
    this.formCancel.emit();
  }
}
