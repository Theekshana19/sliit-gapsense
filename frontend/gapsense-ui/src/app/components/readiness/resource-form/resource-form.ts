import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Resource, ResourceType } from '../../../models/readiness/resource.model';
import { ReadinessService } from '../../../services/readiness.service';

// resource form - for adding/editing learning resources
// resources are linked to specific modules and topics so students can find them easily
@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './resource-form.html',
})
export class ResourceFormComponent implements OnInit {
  private readinessService = inject(ReadinessService);

  // pass a resource to edit, or null for creating a new one
  resource = input<Resource | null>(null);

  // emitted when the form is submitted
  formSubmit = output<Partial<Resource>>();

  // emitted when user clicks cancel
  formCancel = output<void>();

  // form fields
  title = signal('');
  description = signal('');
  type = signal<ResourceType>('Article');
  url = signal('');
  topic = signal('');
  module = signal('');

  // dropdown options
  modules: string[] = [];
  topics: string[] = [];

  ngOnInit() {
    this.modules = this.readinessService.getModules();
    this.topics = this.readinessService.getTopics();

    // if editing, fill the form with existing data
    const r = this.resource();
    if (r) {
      this.title.set(r.title);
      this.description.set(r.description);
      this.type.set(r.type);
      this.url.set(r.url);
      this.topic.set(r.topic);
      this.module.set(r.module);
    }
  }

  // submit the form
  onSubmit() {
    const data: Partial<Resource> = {
      title: this.title(),
      description: this.description(),
      type: this.type(),
      url: this.url(),
      topic: this.topic(),
      module: this.module(),
    };

    this.formSubmit.emit(data);
  }

  onCancel() {
    this.formCancel.emit();
  }
}
