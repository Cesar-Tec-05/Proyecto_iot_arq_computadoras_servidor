import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

// Definición de la interfaz del documento de usuario en MongoDB
interface UserDoc {
    _id: string;
    username: string;
    passwordHash: string;
}

// Servicio de autenticación que maneja registro, login y generación de JWT
@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<UserDoc>,
        private readonly jwtService: JwtService,
    ) {}

    // Método para registrar un nuevo usuario
    async register(dto: RegisterDto) {
        const username = dto.username.trim().toLowerCase();
        const existing = await this.userModel.findOne({ username }).lean();
        if (existing) {
            throw new ConflictException('El usuario ya existe');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? '10');
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);
        const created = await this.userModel.create({ username, passwordHash });
        return {
            id: String(created._id),
            username: created.username,
        };
    }

    // Método para loguear un usuario existente y generar un JWT
    async login(dto: LoginDto) {
        const username = dto.username.trim().toLowerCase();
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const payload = { sub: String(user._id), username: user.username };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken,
            user: {
                id: String(user._id),
                username: user.username,
            },
        };
    }
}
