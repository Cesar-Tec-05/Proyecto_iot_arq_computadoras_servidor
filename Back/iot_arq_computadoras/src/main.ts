import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'node:path';

// Función principal para iniciar la aplicación NestJS, configurar CORS, validación global y servir la documentación de la API con Redoc
async function bootstrap() {
  // Creación de la aplicación NestJS a partir del módulo raíz
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Configuración de Redoc para servir la documentación de la API en /docs, utilizando un archivo YAML como especificación
  const redoc = require('redoc-express');
  const fs = require('fs');
  let docsPath = join(__dirname, '..', 'doc.yml');
  if (!fs.existsSync(docsPath)) {
    docsPath = join(process.cwd(), 'doc.yml');
  }
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/doc.yml', (_req: any, res: any) => {
    res.sendFile(docsPath);
  });
  expressApp.get(
    '/docs',
    redoc({
      title: 'ESP API Docs',
      specUrl: './doc.yml',
    }),
  );
  // Inicio del servidor en el puerto especificado por la variable de entorno PORT o 3000 por defecto
  await app.listen(process.env.PORT ?? 3000);
}

// Llamada a la función principal para iniciar la aplicación
bootstrap();
