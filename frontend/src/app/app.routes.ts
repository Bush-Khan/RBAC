import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Profile } from './features/profile/profile/profile';
import { UserList } from './features/admin/user-list/user-list';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/role/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'signup',
        component: Signup
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard]
    },
    {
        path: 'admin/users',
        component: UserList,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin', 'moderator'] }
    }
];
