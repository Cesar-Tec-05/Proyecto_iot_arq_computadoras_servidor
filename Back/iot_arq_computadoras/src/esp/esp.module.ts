import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EspService } from './esp.service.js';
import { EspController } from './esp.controller.js';
import { EspSchema } from '../models/esp.schema.js';

// Módulo para manejar la lógica relacionada con el ESP y su servicio, incluyendo control de estado y logs
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Esp', schema: EspSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as any },
    }),
  ],
  controllers: [EspController],
  providers: [EspService],
})
export class EspModule {}
