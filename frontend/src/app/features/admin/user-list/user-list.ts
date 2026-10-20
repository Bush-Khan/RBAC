import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  public authService = inject(AuthService)
  users = signal<User[]>([]);
  isLoading = signal(true);
  actionMessage = signal<string | null>(null)
  errorMessage = signal<string | null>(null)

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading.set(true)
    this.authService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.users)
        this.isLoading.set(false)
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.msg || 'Failed to load users')
        this.isLoading.set(false)
      }
    })
  }

  onDeleteUser(userId: string, userName: string): void {
    const confirmed = confirm(`Are you sure you want to delete ${userName}?`);
    if (!confirmed) return;

    this.actionMessage.set(null);
    this.errorMessage.set(null);

    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.actionMessage.set(`${userName} deleted successfully`);
        this.fetchUsers();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete user');
      }
    });
  }

  onRoleChange(userId: string, newRole: UserRole): void {
    this.actionMessage.set(null);
    this.errorMessage.set(null);

    this.authService.updateUser(userId, newRole).subscribe({
      next: (res) => {
        this.actionMessage.set(`Role updated to ${res.user.role}`);
        this.fetchUsers();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.msg || 'Failed to update role');
      }
    });
  }
}
