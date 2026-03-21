import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { CurriculumStatus } from '../../../models/curriculum/curriculum.model';
import { CurriculumService } from '../../../services/curriculum.service';
import { controlInvalid } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-curriculum-add-page',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <div>
        <a routerLink="/curriculum" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">← Back to curriculum</a>
        <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Add curriculum module</h1>
        <p class="mt-1 text-sm text-slate-600">Creates a local mock record via CurriculumService.</p>
      </div>

      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="text-xs font-semibold text-slate-700" for="code">Module code</label>
            <input
              id="code"
              formControlName="code"
              maxlength="16"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.code)
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (invalid(form.controls.code)) {
              <p class="mt-1 text-xs text-rose-600">Code is required.</p>
            }
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-700" for="credits">Credits</label>
            <input
              id="credits"
              type="number"
              formControlName="credits"
              min="1"
              max="30"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.credits)
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (invalid(form.controls.credits)) {
              <p class="mt-1 text-xs text-rose-600">Credits must be between 1 and 30.</p>
            }
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-700" for="name">Module title</label>
          <input
            id="name"
            formControlName="name"
            maxlength="200"
            class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            [ngClass]="
              invalid(form.controls.name)
                ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
            "
          />
          @if (invalid(form.controls.name)) {
            <p class="mt-1 text-xs text-rose-600">Provide a descriptive title.</p>
          }
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-700" for="description">Description</label>
          <textarea
            id="description"
            rows="3"
            formControlName="description"
            maxlength="1000"
            class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            [ngClass]="
              invalid(form.controls.description)
                ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
            "
          ></textarea>
            @if (invalid(form.controls.description)) {
              <p class="mt-1 text-xs text-rose-600">10–1000 characters.</p>
            }
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-700" for="status">Status</label>
          <select
            id="status"
            formControlName="status"
            class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            [ngClass]="
              invalid(form.controls.status)
                ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
            "
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <a
            routerLink="/curriculum"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </a>
          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            [disabled]="form.invalid"
          >
            Save module
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CurriculumAddPageComponent {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly curriculum = inject(CurriculumService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(16)]],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    credits: [3, [Validators.required, Validators.min(1), Validators.max(30)]],
    status: this.fb.nonNullable.control<CurriculumStatus>('draft', { validators: [Validators.required] }),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.curriculum.add({
      code: v.code.trim().toUpperCase(),
      name: v.name.trim(),
      description: v.description.trim(),
      credits: v.credits,
      status: v.status,
    });
    this.toast.show('Curriculum module saved.', 'success');
    void this.router.navigateByUrl('/curriculum');
  }
}
