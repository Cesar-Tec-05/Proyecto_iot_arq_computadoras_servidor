import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard';

// Controlador para manejar registro, login y obtener info del usuario logueado
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Endpoint para registrar un nuevo usuario
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // Endpoint para loguear un usuario existente
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // Endpoint para obtener info del usuario logueado (requiere JWT válido)
    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: any) {
        return req.user;
    }
}
