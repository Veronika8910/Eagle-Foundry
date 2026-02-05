import { Request, Response, NextFunction } from 'express';
import { error, ErrorCode } from '../utils/response.js';
import { UserRole, UserRoleType } from '../config/constants.js';

/**
 * Middleware factory to require specific roles
 */
export function requireRole(...allowedRoles: UserRoleType[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            error(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
            return;
        }

        const userRole = req.user.role as UserRoleType;

        if (!allowedRoles.includes(userRole)) {
            error(
                res,
                ErrorCode.FORBIDDEN,
                `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                403
            );
            return;
        }

        next();
    };
}

/**
 * Require student role
 */
export const requireStudent = requireRole(UserRole.STUDENT);

/**
 * Require company admin role
 */
export const requireCompanyAdmin = requireRole(UserRole.COMPANY_ADMIN);

/**
 * Require any company member role (admin or member)
 */
export const requireCompanyMember = requireRole(
    UserRole.COMPANY_ADMIN,
    UserRole.COMPANY_MEMBER
);

/**
 * Require university admin role
 */
export const requireUniversityAdmin = requireRole(UserRole.UNIVERSITY_ADMIN);

/**
 * Require student or university admin (for browsing)
 */
export const requireStudentOrAdmin = requireRole(
    UserRole.STUDENT,
    UserRole.UNIVERSITY_ADMIN
);

/**
 * Check if user has a specific role
 */
export function hasRole(user: Express.Request['user'], role: UserRoleType): boolean {
    if (!user) return false;
    return user.role === role;
}

/**
 * Check if user is a student
 */
export function isStudent(user: Express.Request['user']): boolean {
    return hasRole(user, UserRole.STUDENT);
}

/**
 * Check if user is a company admin
 */
export function isCompanyAdmin(user: Express.Request['user']): boolean {
    return hasRole(user, UserRole.COMPANY_ADMIN);
}

/**
 * Check if user is a company member (admin or member)
 */
export function isCompanyMember(user: Express.Request['user']): boolean {
    return (
        hasRole(user, UserRole.COMPANY_ADMIN) ||
        hasRole(user, UserRole.COMPANY_MEMBER)
    );
}

/**
 * Check if user is a university admin
 */
export function isUniversityAdmin(user: Express.Request['user']): boolean {
    return hasRole(user, UserRole.UNIVERSITY_ADMIN);
}
