import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      });
  }

  isAuthPage(): boolean {
    return this.currentUrl() === '/login' || this.currentUrl() === '/signup';
  }
}