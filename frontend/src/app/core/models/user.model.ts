export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
    _id: string,
    firstname: string,
    lastname: string,
    email: string,
    mobilenumber: string,
    role: UserRole
}

export interface AuthResponse {
    success: boolean,
    message: string,
    token: string,
    user: User
}

export interface SignupPayload{
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    mobilenumber: string
}

export interface LoginPaylaod{
    email: string,
    password: string
}