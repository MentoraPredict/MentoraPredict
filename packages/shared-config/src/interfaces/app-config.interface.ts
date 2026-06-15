export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  apiPrefix: string;
  apiVersion: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  corsOrigins: string[];
}
