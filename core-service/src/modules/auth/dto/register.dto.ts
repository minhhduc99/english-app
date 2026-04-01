import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  username!: string;
  password!: string;
  fullName!: string;
  email!: string;
  role?: Role;
}
