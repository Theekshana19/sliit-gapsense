import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../components/ui/toast/toast.service';
import { controlInvalid } from '../../../validators/form-utils';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string;
  const confirm = control.get('confirmPassword')?.value as string;
  if (!password || !confirm) {
    return null;
  }
  return password === confirm ? null : { mismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-8 text-center">
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Create your GapSense account</h1>
          <p class="mt-1 text-sm text-slate-600">Mock registration · data stays in this browser</p>
        </div>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="block text-xs font-semibold text-slate-700" for="name">Full name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              maxlength="120"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.name)
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (invalid(form.controls.name)) {
              <p class="mt-1 text-xs text-rose-600">Name is required (at least 2 characters).</p>
            }
          </div>
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
              autocomplete="new-password"
              maxlength="128"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.password)
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (invalid(form.controls.password)) {
              <p class="mt-1 text-xs text-rose-600">Use at least 8 characters.</p>
            }
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700" for="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              formControlName="confirmPassword"
              autocomplete="new-password"
              maxlength="128"
              class="mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [ngClass]="
                invalid(form.controls.confirmPassword) || (form.touched && form.hasError('mismatch'))
                  ? 'border-rose-500 ring-1 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
              "
            />
            @if (form.touched && form.hasError('mismatch')) {
              <p class="mt-1 text-xs text-rose-600">Passwords must match.</p>
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
            Register
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Already have an account?
          <a routerLink="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  readonly invalid = controlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  busy = false;

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatch] },
  );

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy) {
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.busy = true;
    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.toast.show('Account created. You are signed in.', 'success');
        void this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.toast.show('Registration failed. Check the form.', 'error');
        this.busy = false;
      },
      complete: () => {
        this.busy = false;
      },
    });
  }
}
