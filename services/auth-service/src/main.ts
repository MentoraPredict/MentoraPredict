import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "@mentorapredict/shared-logger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./infrastructure/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  const port = process.env.APP_PORT ?? 3001;

  // Global pipes, filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-correlation-id",
      "x-request-id",
    ],
    credentials: true,
  });

  // Swagger (RNF-039)
  const swaggerServer =
    process.env.SWAGGER_SERVER_URL ??
    "https://mentorapredictqa.programacionwebuce.net";

  const config = new DocumentBuilder()
    .setTitle("MentoraPredict — auth-service")
    .setDescription("Authentication, JWT RS256, RBAC — RF-001 to RF-005")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "JWT",
    )
    .addServer(swaggerServer)
    .build();
  SwaggerModule.setup(
    "api/v1/auth/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`auth-service running on http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/v1/auth/docs`);
}
bootstrap();
