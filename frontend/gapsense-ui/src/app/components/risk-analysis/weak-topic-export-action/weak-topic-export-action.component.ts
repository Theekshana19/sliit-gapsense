import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-weak-topic-export-action',
  standalone: true,
  templateUrl: './weak-topic-export-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicExportActionComponent {
  readonly exportDetailedPdf = output<void>();

  protected click(): void {
    this.exportDetailedPdf.emit();
  }
}
