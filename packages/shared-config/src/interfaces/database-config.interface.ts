export interface PostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface MongoConfig {
  url: string;
  database: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  ttlDefault: number;
}
