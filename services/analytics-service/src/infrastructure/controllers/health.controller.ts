import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { DataSource } from "typeorm";
import { RedisClient } from "../cache/redis.client";

type HealthStatus = "UP" | "degraded" | "DOWN";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectConnection() private readonly mongo: Connection,
    private readonly redis: RedisClient,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Health check — PostgreSQL + Redis + MongoDB" })
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

    const up = [postgres, redis, mongodb].filter(Boolean).length;
    const status: HealthStatus =
      up === 3 ? "UP" : up === 0 ? "DOWN" : "degraded";

    return { status, postgres, redis, mongodb };
  }
}
