import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig: any = config.get('server')

  const options = new DocumentBuilder()
    .setTitle('Task Management')
    .setDescription('The Task Management API Service')
    .setVersion('1.0')
    .addTag('Tasks')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
}
bootstrap();
