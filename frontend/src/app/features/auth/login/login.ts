import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  errorMessage = signal<string | null>(null)
  isLoading = signal(false);

  login = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit(): void {
    if (this.login.invalid) {
      this.login.markAllAsTouched()
      return
    }

    this.isLoading.set(true)
    this.errorMessage.set(null)

    this.authService.login(this.login.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false)
        this.router.navigate(['/profile'])
      },
      error: (err) => {
        this.isLoading.set(false)
        this.errorMessage.set(err?.error?.msg || 'Login failed. Please try again')
      }
    })
  }
}
