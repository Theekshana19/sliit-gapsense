import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-readiness-export-actions',
  standalone: true,
  templateUrl: './readiness-export-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessExportActionsComponent {
  readonly exportPdf = output<void>();
  readonly shareReport = output<void>();

  protected onExportPdf(): void {
    this.exportPdf.emit();
  }

  protected onShareReport(): void {
    this.shareReport.emit();
  }
}
