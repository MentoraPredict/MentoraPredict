import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RedisClient } from "../cache/redis.client";

type HealthStatus = "UP" | "degraded" | "DOWN";

function resolveStatus(postgres: boolean, redis: boolean): HealthStatus {
  const up = [postgres, redis].filter(Boolean).length;
  if (up === 2) return "UP";
  if (up === 0) return "DOWN";
  return "degraded";
}

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly redis: RedisClient,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Service health check — PostgreSQL + Redis connectivity",
  })
  async health() {
    let postgres = false;
    let redis = false;

    try {
      await this.db.query("SELECT 1");
      postgres = true;
    } catch {}

    try {
      const pong = await this.redis.instance.ping();
      redis = pong === "PONG";
    } catch {}

    return {
      status: resolveStatus(postgres, redis),
      postgres,
      redis,
    };
  }
}
