import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import * as argon2 from 'argon2'
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // private readonly filesService: FilesService
  ) { }

  // private readonly users = [
  //   {
  //     userId: 1,
  //     username: 'john',
  //     password: 'changeme',
  //   },
  //   {
  //     userId: 2,
  //     username: 'maria',
  //     password: 'guess',
  //   },
  // ];

  async findOne(username: string): Promise<User | undefined> {
    const userExist = await this.usersRepository.findOne({ where: { username } })
    if (!userExist) throw new BadRequestException('Unknown user')
    return userExist
  }

  async setCurrentRefreshToken(refreshToken: string, username: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    let currentUser = await this.usersRepository.findOneBy({ username })
    currentUser.currentHashedRefreshToken = currentHashedRefreshToken
    await this.usersRepository.save(currentUser);
  }

  async getById(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(username: string) {
    let user = await this.usersRepository.findOne({ where: { username } });
    user.currentHashedRefreshToken = null
    return this.usersRepository.save(user);
  }


  async createNewUser(username: string, password: string) {
    // validation
    // const { username, password, role } = createUserDto

    const isUserExist = await this.usersRepository.findOneBy({ username })
    if (isUserExist) throw new HttpException('User Exist', HttpStatus.BAD_REQUEST)
    const currentHashedPassword = await argon2.hash(password)
    const newUser = {
      // id: 1,
      username,
      password: currentHashedPassword,
      role: '1',
      currentHashedRefreshToken: null,
    }

    return this.usersRepository.save(newUser)
    //{ username: user.username, password: user.password, role: user.role }
  }

  async findAll() {
    const usersList: User[] = await this.usersRepository.find()
    return usersList
  }
  
  update(id: number, updateGameDto: UpdateUserDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }


  async refreshBalance() {

    // cron: check user wallet current balance
        
    // cron: check pending tokens

    // cron: if money > 0 send then 

    // cron: check 

    return 0
  }

  async editRoles(username: string, role: string) {

    const user = await this.usersRepository.findOne({ where: { username }})
    if(!user) throw new NotFoundException('User not found')
    const updatedUser = { ...user, roles: [role] }
    return await this.usersRepository.save(updatedUser)
  }

}