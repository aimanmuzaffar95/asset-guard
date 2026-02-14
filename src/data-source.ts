import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

config();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.getOrThrow<string>('SUPABASE_DATABASE_URL'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});
