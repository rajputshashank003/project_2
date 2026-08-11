export type UserRole = 'admin' | 'user';
export type UserDesignation = 'member' | 'admin' | 'president' | 'secretary' | 'volunteer';

export interface User {
    id: string;
    phone: string;
    name: string;
    email?: string;
    role: UserRole;
    designation: UserDesignation;
    passportPhotoUrl?: string;
    joinedAt: string;
    isActive: boolean;
}

export interface AuthUser {
    id: string;
    phone: string;
    name: string;
    role: UserRole;
    designation: UserDesignation;
    token: string;
}
