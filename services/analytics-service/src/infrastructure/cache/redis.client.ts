import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClient.name);
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get<string>("REDIS_HOST", "localhost"),
      port: this.config.get<number>("REDIS_PORT", 6379),
      password: this.config.get<string>("REDIS_PASSWORD"),
      lazyConnect: true,
    });
    this.client.on("error", (err) => this.logger.error("Redis error", err));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  get instance(): Redis {
    return this.client;
  }
}
