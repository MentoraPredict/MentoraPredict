import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./infrastructure/filters/http-exception.filter";
import { CorrelationInterceptor } from "./infrastructure/interceptors/correlation.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const port = process.env.APP_PORT ?? 3001;

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new CorrelationInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? true,
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
    .addBearerAuth()
    .addServer(swaggerServer)
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(port);
  logger.log(`auth-service running on http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
