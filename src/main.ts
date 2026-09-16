import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API de Productos (con persistencia)')
    .setDescription('CRUD de productos sobre PostgreSQL + TypeORM')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const defaultPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  try {
    await app.listen(defaultPort);
    console.log(`Aplicación escuchando en http://localhost:${defaultPort}/swagger`);
  } catch (err: any) {
    if (err && (err.code === 'EACCES' || err.code === 'EADDRINUSE')) {
      const altPort = 3001;
      await app.listen(altPort);
      console.log(`Puerto ${defaultPort} restringido por el SO (${err.code}). Escuchando en http://localhost:${altPort}/swagger`);
    } else {
      throw err;
    }
  }
}
bootstrap();
