import { Component, input, output, signal, OnInit, inject } from '@angular/core';
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

  // dropdown options
  programs: string[] = ['BSc IT', 'BSc CS', 'BSc SE', 'BSc DS'];
  semesters: string[] = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];

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

  // submit the form
  onSubmit() {
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
