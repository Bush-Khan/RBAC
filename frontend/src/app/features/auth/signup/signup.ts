import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  fb = inject(FormBuilder)
  authService = inject(AuthService)
  router = inject(Router)

  errorMessage = signal<string | null>(null)
  successMessage = signal<string | null>(null);
  isLoading = signal(false)

  signup = this.fb.nonNullable.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    mobilenumber: ['', [Validators.required, Validators.minLength(10)]]
  })


  onSubmit(): void {
    if (this.signup.invalid) {
      this.signup.markAllAsTouched()
      return
    }

    this.isLoading.set(true)
    this.errorMessage.set(null)
    this.successMessage.set(null)

    this.authService.signup(this.signup.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false)
        this.successMessage.set('Account created redirecting to login...')

        setTimeout(() => {
          this.router.navigate(['/login'])
        }, 2000)
      },
      error: (err) => {
        this.isLoading.set(false)
        this.errorMessage.set(err?.error?.msg || 'Signup failed. Please try again later')
      }
    })
  }

}
