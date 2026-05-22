import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Estrategia de Passport para validar JWT en las solicitudes protegidas
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me',
        });
    }

    // Método que se ejecuta al validar un JWT, devuelve la información del usuario
    async validate(payload: { sub: string; username: string }) {
        return {
            userId: payload.sub,
            username: payload.username,
        };
    }
}
