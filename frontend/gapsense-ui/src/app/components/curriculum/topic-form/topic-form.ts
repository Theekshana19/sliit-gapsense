import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Topic, ImportanceLevel, TopicStatus } from '../../../models/curriculum/topic.model';
import { CurriculumService } from '../../../services/curriculum.service';
import { Module } from '../../../models/curriculum/module.model';

// topic form - used in add/edit topic page
// each topic belongs to a module and has a weight percentage
@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './topic-form.html',
})
export class TopicFormComponent implements OnInit {
  private curriculumService = inject(CurriculumService);

  // pass a topic to edit, or null for creating new
  topic = input<Topic | null>(null);

  // emitted when form is submitted
  formSubmit = output<Partial<Topic>>();

  // emitted when user clicks cancel
  formCancel = output<void>();

  // form fields
  moduleId = signal('');
  moduleCode = signal('');
  topicName = signal('');
  description = signal('');
  weight = signal(0);
  importanceLevel = signal<ImportanceLevel>('Medium');
  status = signal<TopicStatus>('Draft');
  isActive = signal(true);

  // available modules for dropdown
  modules: Module[] = [];

  ngOnInit() {
    // load modules for dropdown
    this.curriculumService.getModules().subscribe((mods) => {
      this.modules = mods;
    });

    // if editing, fill form
    const t = this.topic();
    if (t) {
      this.moduleId.set(t.moduleId);
      this.moduleCode.set(t.moduleCode);
      this.topicName.set(t.topicName);
      this.description.set(t.description);
      this.weight.set(t.weight);
      this.importanceLevel.set(t.importanceLevel);
      this.status.set(t.status);
      this.isActive.set(t.isActive);
    }
  }

  // when module dropdown changes, update moduleCode too
  onModuleChange(moduleId: string) {
    this.moduleId.set(moduleId);
    const mod = this.modules.find((m) => m.id === moduleId);
    if (mod) {
      this.moduleCode.set(mod.moduleCode);
    }
  }

  // toggle active status
  toggleActive() {
    this.isActive.update((v) => !v);
  }

  // submit the form
  onSubmit() {
    const mod = this.modules.find((m) => m.id === this.moduleId());
    const data: Partial<Topic> = {
      moduleId: this.moduleId(),
      moduleCode: this.moduleCode(),
      moduleName: mod?.moduleName || '',
      topicName: this.topicName(),
      description: this.description(),
      weight: this.weight(),
      importanceLevel: this.importanceLevel(),
      status: this.status(),
      isActive: this.isActive(),
    };
    this.formSubmit.emit(data);
  }

  onCancel() {
    this.formCancel.emit();
  }
}
