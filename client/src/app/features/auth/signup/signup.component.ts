import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

          @if (errorMessage) {
            <div class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
              {{ errorMessage }}
            </div>
          }

          @if (successMessage) {
            <div class="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-md mb-4">
              {{ successMessage }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Your name">
              @if (form.get('name')?.touched && form.get('name')?.errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Name is required</p>
              }
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="you@example.com">
              @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Email is required</p>
              }
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="text-red-500 text-xs mt-1">Enter a valid email</p>
              }
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Min 6 characters">
              @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Password is required</p>
              }
              @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                <p class="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
              }
            </div>

            <button type="submit" [disabled]="form.invalid || loading"
              class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {{ loading ? 'Creating account...' : 'Sign Up' }}
            </button>
          </form>

          <p class="text-center text-sm text-gray-600 mt-4">
            Already have an account?
            <a routerLink="/login" class="text-indigo-600 hover:text-indigo-700 font-medium">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  private destroyRef = inject(DestroyRef);
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.signup(this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMessage = 'Account created! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Signup failed. Please try again.';
        }
      });
  }
}
