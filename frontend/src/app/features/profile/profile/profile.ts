import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  authService = inject(AuthService)

  data = signal<User | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.data.set(res.user)
        this.isLoading.set(false)
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.msg || 'Failed to load profile')
        this.isLoading.set(false)
      }
    })
  }
}
