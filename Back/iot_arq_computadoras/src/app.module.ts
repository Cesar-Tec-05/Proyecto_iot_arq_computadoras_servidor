import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EspModule } from './esp/esp.module';
import { AuthModule } from './auth/auth.module.js';

// Módulo raíz de la aplicación que importa los módulos de autenticación y ESP, y configura la conexión a MongoDB
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://mongo:27017/iot'),
    EspModule,
    AuthModule,
  ],
})

export class AppModule {}
