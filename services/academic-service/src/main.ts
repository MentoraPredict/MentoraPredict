import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const port = process.env.APP_PORT ?? 3003;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(",") ?? "*" });

  const config = new DocumentBuilder()
    .setTitle("MentoraPredict — academic-service")
    .setDescription(
      "Subjects, enrollments, evaluations, grades — RF-006 to RF-013",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`http://localhost:${port}`)
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`academic-service running on http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
