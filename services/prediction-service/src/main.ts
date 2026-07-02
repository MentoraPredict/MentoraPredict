import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const port = process.env.APP_PORT ?? 3006;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-correlation-id", "x-request-id"],
    credentials: true,
  });

  const swaggerServer =
    process.env.SWAGGER_SERVER_URL ??
    "https://mentorapredictqa.programacionwebuce.net";

  const config = new DocumentBuilder()
    .setTitle("MentoraPredict — prediction-service")
    .setDescription(
      "Risk-based predictions + AI-generated recommendations (OpenAI). " +
      "Risk is computed deterministically by analytics-service; OpenAI only " +
      "produces the natural-language summary and recommendation plan.",
    )
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
    "api/v1/prediction/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`prediction-service running on http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/v1/prediction/docs`);
}
bootstrap();
