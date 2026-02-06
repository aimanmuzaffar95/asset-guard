import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-roles.enum';

export const ROLES_KEY = 'roles';

export const Admin = () => SetMetadata(ROLES_KEY, [UserRole.ADMIN]);
export const Staff = () => SetMetadata(ROLES_KEY, [UserRole.ADMIN, UserRole.STAFF]);
