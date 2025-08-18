import { DataSource, DataSourceOptions } from 'typeorm';
import { OrganizationEntity } from './modules/organization/entity/entity';
import { UserEntity } from './modules/users/entity/entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  autoLoadEntities: true,
  synchronize: true, // Set to false in production
  logging: true,
  ssl: false,
  entities: [UserEntity, OrganizationEntity],
  migrations: ['src/migration/**/*.ts'],
} as DataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    throw new Error('Error during Data Source initialization:');
  });
