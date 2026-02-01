import { EUserRole } from '../enums/role.enum';

export interface TokenPayload {
    userId: string;
    roles: EUserRole[];
}
