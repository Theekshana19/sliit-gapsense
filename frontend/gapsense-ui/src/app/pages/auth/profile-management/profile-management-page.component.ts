import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { AuthUiService } from '../../../services/auth-ui.service';
import type { UserProfile } from '../../../models/auth/user-profile.model';

@Component({
  selector: 'app-profile-management-page',
  standalone: true,
  imports: [ReactiveFormsModule, TopBarComponent],
  templateUrl: './profile-management-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileManagementPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly authUi = inject(AuthUiService);

  protected readonly form = this.fb.group({
    fullName: ['', Validators.required],
    batch: [''],
    degreeProgram: [''],
    department: [''],
    specialization: [''],
    adminCode: [''],
  });

  constructor() {
    void this.authUi.loadMe();

    effect(() => {
      const user = this.authUi.currentUser();
      if (!user) return;

      this.form.patchValue({
        fullName: user.fullName ?? '',
        batch: user.batch ?? '',
        degreeProgram: user.degreeProgram ?? '',
        department: user.department ?? '',
        specialization: user.specialization ?? '',
        adminCode: user.adminCode ?? '',
      });
    });
  }

  protected profileImageUrl(): string | null {
    const path = this.authUi.currentUser()?.profileImagePath;
    if (!path) return null;
    return path.startsWith('http') ? path : `https://localhost:7277${path}`;
  }

  protected role(): UserProfile['role'] | null {
    return this.authUi.currentUser()?.role ?? null;
  }

  protected async onSave(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    await this.authUi.updateMyProfile({
      fullName: v.fullName ?? '',
      batch: v.batch || null,
      degreeProgram: v.degreeProgram || null,
      department: v.department || null,
      specialization: v.specialization || null,
      adminCode: v.adminCode || null,
    });
  }

  protected async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    await this.authUi.uploadProfilePhoto(file);
    if (input) input.value = '';
  }

  protected async onRemovePhoto(): Promise<void> {
    await this.authUi.removeProfilePhoto();
  }
}

