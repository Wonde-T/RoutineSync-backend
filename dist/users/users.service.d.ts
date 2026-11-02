import { Repository } from 'typeorm';
import { User } from '../entities';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    findById(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
}
