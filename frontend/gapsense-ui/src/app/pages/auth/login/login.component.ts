import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { controlInvalid } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-8 text-center">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white"
          >
            GS
          </div>
          <h1 class="mb-2 mt-4 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Sign in to GapSense</h1>
          <p class="mt-1 text-sm text-slate-600">Lecturer workspace · mock authentication</p>
        </div>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="block text-xs font-semibold text-slate-700" for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="username"
              class="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
            }
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700" for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              maxlength="128"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.password)
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (invalid(form.controls.password)) {
              <p class="mt-1 text-xs text-rose-600">Password is required (min 6 characters).</p>
            }
          </div>
          <button
            type="submit"
            class="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="form.invalid || busy"
          >
            @if (busy) {
              <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></span>
            }
            Continue
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          New here?
          <a routerLink="/auth/register" class="font-semibold text-indigo-600 hover:text-indigo-500">Create an account</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  busy = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy) {
      return;
    }
    this.busy = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.show('Signed in successfully.', 'success');
        void this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.toast.show('Could not sign in. Check your inputs.', 'error');
        this.busy = false;
      },
      complete: () => {
        this.busy = false;
      },
    });
  }
}
