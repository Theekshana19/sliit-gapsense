import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { TopicFormComponent } from '../../../components/curriculum/topic-form/topic-form';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Topic } from '../../../models/curriculum/topic.model';

// add/edit topic page
@Component({
  selector: 'app-add-edit-topic',
  standalone: true,
  imports: [MainLayoutComponent, TopicFormComponent],
  templateUrl: './add-edit-topic.html',
})
export class AddEditTopicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isEditMode = signal(false);
  topic = signal<Topic | null>(null);
  pageTitle = signal('Add Topic');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Topic');
      this.curriculumService.getTopicById(id).subscribe((t) => {
        if (t) this.topic.set(t);
        else {
          this.toastService.error('Topic not found');
          this.router.navigate(['/curriculum/module-management']);
        }
      });
    }
  }

  onFormSubmit(data: Partial<Topic>) {
    if (this.isEditMode()) {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.curriculumService.updateTopic(id, data).subscribe(() => {
        this.toastService.success('Topic updated successfully');
        this.router.navigate(['/curriculum/module-management']);
      });
    } else {
      this.curriculumService.createTopic(data).subscribe(() => {
        this.toastService.success('Topic created successfully');
        this.router.navigate(['/curriculum/module-management']);
      });
    }
  }

  onFormCancel() {
    this.router.navigate(['/curriculum/module-management']);
  }
}
