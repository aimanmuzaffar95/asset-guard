import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-roles.enum';

export const ROLES_KEY = 'roles';

export const Admin = (): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, [UserRole.ADMIN]);
export const Staff = (): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, [UserRole.ADMIN, UserRole.STAFF]);
