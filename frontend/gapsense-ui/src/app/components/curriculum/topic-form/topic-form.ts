import { Component, input, output, signal, computed, OnInit, inject } from '@angular/core';
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

  // track if user tried to submit
  submitted = signal(false);

  // available modules for dropdown (signal so template updates when loaded)
  modules = signal<Module[]>([]);

  // --- validation rules ---

  // module must be selected
  moduleError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.moduleId()) return 'Please select a module';
    return '';
  });

  // topic name is required
  nameError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.topicName().trim()) return 'Topic name is required';
    if (this.topicName().trim().length < 3) return 'Topic name must be at least 3 characters';
    return '';
  });

  // weight must be between 0 and 100
  weightError = computed(() => {
    if (!this.submitted()) return '';
    if (this.weight() < 0) return 'Weight cannot be negative';
    if (this.weight() > 100) return 'Weight cannot exceed 100%';
    return '';
  });

  // check if the whole form is valid
  isFormValid = computed(() => {
    return (
      this.moduleId() !== '' &&
      this.topicName().trim().length >= 3 &&
      this.weight() >= 0 &&
      this.weight() <= 100
    );
  });

  ngOnInit() {
    // load modules from API for dropdown
    this.curriculumService.getModules().subscribe({
      next: (mods) => {
        this.modules.set(mods);
      },
      error: (err) => {
        console.error('Failed to load modules for dropdown:', err);
      },
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
    const mod = this.modules().find((m) => m.id === moduleId);
    if (mod) {
      this.moduleCode.set(mod.moduleCode);
    }
  }

  // toggle active status
  toggleActive() {
    this.isActive.update((v) => !v);
  }

  // submit the form - only if valid
  onSubmit() {
    this.submitted.set(true);
    if (!this.isFormValid()) return;

    const mod = this.modules().find((m) => m.id === this.moduleId());
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
