import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Prerequisite, RelationshipType } from '../../../models/curriculum/prerequisite.model';
import { Module } from '../../../models/curriculum/module.model';
import { CurriculumService } from '../../../services/curriculum.service';

// prerequisite form - used in prerequisite mapping page
// defines the relationship between two modules (which module requires which)
@Component({
  selector: 'app-prerequisite-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prerequisite-form.html',
})
export class PrerequisiteFormComponent implements OnInit {
  private curriculumService = inject(CurriculumService);

  // pass a prerequisite to edit, or null for new
  prerequisite = input<Prerequisite | null>(null);

  // emitted when form is submitted
  formSubmit = output<Partial<Prerequisite>>();

  // emitted when user clicks cancel
  formCancel = output<void>();

  // form fields
  mainModuleId = signal('');
  prerequisiteModuleId = signal('');
  relationshipType = signal<RelationshipType>('Mandatory');
  relevanceWeight = signal(50);
  notes = signal('');

  // available modules for dropdowns
  modules: Module[] = [];

  // circular dependency warning
  showCircularWarning = signal(false);

  ngOnInit() {
    // load modules for dropdowns
    this.curriculumService.getModules().subscribe((mods) => {
      this.modules = mods;
    });

    // if editing, fill form
    const p = this.prerequisite();
    if (p) {
      this.mainModuleId.set(p.mainModuleId);
      this.prerequisiteModuleId.set(p.prerequisiteModuleId);
      this.relationshipType.set(p.relationshipType);
      this.relevanceWeight.set(p.relevanceWeight);
      this.notes.set(p.notes);
    }
  }

  // check if the same module is selected for both dropdowns
  onModuleSelectionChange() {
    if (this.mainModuleId() && this.mainModuleId() === this.prerequisiteModuleId()) {
      this.showCircularWarning.set(true);
    } else {
      this.showCircularWarning.set(false);
    }
  }

  // get module name by id (for display)
  getModuleName(id: string): string {
    const mod = this.modules.find((m) => m.id === id);
    return mod ? `${mod.moduleCode} - ${mod.moduleName}` : '';
  }

  // submit the form
  onSubmit() {
    // don't submit if there's a circular dependency
    if (this.showCircularWarning()) return;

    const mainMod = this.modules.find((m) => m.id === this.mainModuleId());
    const prereqMod = this.modules.find((m) => m.id === this.prerequisiteModuleId());

    const data: Partial<Prerequisite> = {
      mainModuleId: this.mainModuleId(),
      mainModuleCode: mainMod?.moduleCode || '',
      mainModuleName: mainMod?.moduleName || '',
      prerequisiteModuleId: this.prerequisiteModuleId(),
      prerequisiteModuleCode: prereqMod?.moduleCode || '',
      prerequisiteModuleName: prereqMod?.moduleName || '',
      relationshipType: this.relationshipType(),
      relevanceWeight: this.relevanceWeight(),
      notes: this.notes(),
    };

    this.formSubmit.emit(data);
  }

  onCancel() {
    this.formCancel.emit();
  }
}
