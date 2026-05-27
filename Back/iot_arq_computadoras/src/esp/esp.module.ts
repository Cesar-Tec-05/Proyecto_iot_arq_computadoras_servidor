import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EspService } from './esp.service.js';
import { EspController } from './esp.controller.js';
import { EspSchema } from '../models/esp.schema.js';

// Módulo para manejar la lógica relacionada con el ESP y su servicio, incluyendo control de estado y logs
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Esp', schema: EspSchema }])],
  controllers: [EspController],
  providers: [EspService],
})
export class EspModule {}
