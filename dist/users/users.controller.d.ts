import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: AuthUser): Promise<import("../entities").User>;
    update(user: AuthUser, dto: UpdateUserDto): Promise<import("../entities").User>;
}
