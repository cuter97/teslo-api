import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { UserRoleGuard } from './guards/user-role.guard';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { RawHeader } from './decorators/raw-header.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { Auth } from './decorators/auth.decorator';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-status')
    @Auth()
    checkAuthStatus(
        @GetUser() user: User
    ) {
        return this.authService.checkAuthStatus(user);
    }


    @Get('private')
    @UseGuards(AuthGuard())
    testingPrivateRoute(
        // @Req() request: Express.Request
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
        @RawHeader() rawHeader: string[],
        @Headers() headers: IncomingHttpHeaders,
    ) {
        return {
            ok: true,
            user,
            userEmail,
            rawHeader,
            headers
        }
    }

    //forma 1
    // @SetMetadata('roles', ['admin', 'super-user'])
    @Get('private2')
    @RoleProtected(ValidRoles.admin, ValidRoles.user)
    @UseGuards(AuthGuard(), UserRoleGuard)
    privateRoute2(
        @GetUser() user: User
    ) {
        return {
            ok: true,
            user
        }
    }

    //forma 2
    @Get('private3')
    @Auth(ValidRoles.admin)
    privateRoute3(
        @GetUser() user: User
    ) {
        return {
            ok: true,
            user
        }
    }

}    