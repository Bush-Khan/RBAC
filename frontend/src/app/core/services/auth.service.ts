import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, UserRole, SignupPayload, LoginPaylaod } from '../models/user.model';
import { API_BASE_URL } from '../constants/api.constant';

const TOKEN_KEY = 'rbac_token';
const USER_KEY = 'rbac_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)

  private _user = signal<User | null>(this.readStoredUser())
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY))

  user = this._user.asReadonly()
  token = this._token.asReadonly()

  isLoggedIn = computed(() => !!this.token())
  role = computed(() => this._user()?.role ?? null)

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  }

  signup(paylaod: SignupPayload): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.post<{ success: boolean; message: string; user: User }>(`${API_BASE_URL}/register`, paylaod)
  }

  login(payload: LoginPaylaod): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/login`, payload).pipe(tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    this.http.post(`${API_BASE_URL}/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    })
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token()
  }

  hasRole(...allowedRoles: UserRole[]): boolean {
    const currentRole = this.role();
    return !!currentRole && allowedRoles.includes(currentRole)
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${API_BASE_URL}/profile`)
  }

  getUsers(): Observable<{ success: boolean; count: number; users: User[] }> {
    return this.http.get<{ success: boolean; count: number; users: User[] }>(`${API_BASE_URL}/getUsers`)
  }

  deleteUser(userId: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${API_BASE_URL}/delete/${userId}`)
  }

  updateUser(userId: string, role: UserRole): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.patch<{ success: boolean; message: string; user: User }>(`${API_BASE_URL}/update/userRole/${userId}`, { role })
  }
}
