import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const port = process.env.APP_PORT ?? 3002;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(",") ?? "*" });

  const config = new DocumentBuilder()
    .setTitle("MentoraPredict — user-service")
    .setDescription("User profiles — RF-014")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer("http://localhost:8000", "Local")
    .addServer("https://mentorapredictqa.programacionwebuce.net", "QA")
    .addServer(
      "https://mentorapredictprod.programacionwebuce.net",
      "Production",
    )
    .build();
  SwaggerModule.setup(
    "api/docs/users",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`user-service running on http://localhost:${port}`);
}
bootstrap();
