import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-readiness-export-actions',
  standalone: true,
  templateUrl: './readiness-export-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessExportActionsComponent {
  /** Disables Export PDF while the request is in flight. */
  readonly exportPdfLoading = input(false);

  readonly exportPdf = output<void>();
  readonly shareReport = output<void>();

  protected onExportPdf(): void {
    if (this.exportPdfLoading()) return;
    this.exportPdf.emit();
  }

  protected onShareReport(): void {
    this.shareReport.emit();
  }
}
