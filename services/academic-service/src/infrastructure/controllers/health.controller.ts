import { Controller, Get, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { DataSource } from "typeorm";
import { RedisClient } from "../cache/redis.client";

type HealthStatus = "UP" | "degraded" | "DOWN";

function resolveStatus(postgres: boolean, redis: boolean, mongodb: boolean): HealthStatus {
  const up = [postgres, redis, mongodb].filter(Boolean).length;
  if (up === 3) return "UP";
  if (up === 0) return "DOWN";
  return "degraded";
}

@ApiTags("health")
@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectConnection() private readonly mongo: Connection,
    private readonly redis: RedisClient,
  ) {
    // MongoDB connects in the background (lazyConnection: true in
    // app.module.ts). Without a listener, an unhandled "error" event on this
    // EventEmitter crashes the whole process — this just logs it instead.
    this.mongo.on("error", (error: Error) => {
      this.logger.warn(`MongoDB connection error: ${error.message}`);
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Service health check — PostgreSQL + Redis + MongoDB connectivity",
  })
  async health() {
    let postgres = false;
    let redis = false;
    let mongodb = false;

    try {
      await this.db.query("SELECT 1");
      postgres = true;
    } catch {}

    try {
      const pong = await this.redis.instance.ping();
      redis = pong === "PONG";
    } catch {}

    try {
      mongodb = this.mongo.readyState === 1;
    } catch {}

    return {
      status: resolveStatus(postgres, redis, mongodb),
      postgres,
      redis,
      mongodb,
    };
  }
}
