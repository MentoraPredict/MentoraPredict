import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const port = process.env.APP_PORT ?? 3004;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? true,
    credentials: true,
  });

  const swaggerServer =
    process.env.SWAGGER_SERVER_URL ??
    "https://mentorapredictqa.programacionwebuce.net";

  const config = new DocumentBuilder()
    .setTitle("MentoraPredict — analytics-service")
    .setDescription(
      "Averages, trends, compliance, risk, alerts — RF-015 to RF-021",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addServer(swaggerServer)
    .build();
  SwaggerModule.setup(
    "api/v1/analytics/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`analytics-service running on http://localhost:${port}`);
}
bootstrap();
