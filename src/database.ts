import { DataSource, DataSourceOptions } from 'typeorm';
import { OrganizationEntity } from './modules/organization/entity/entity';
import { UserEntity } from './modules/users/entity/entity';
import { VouchersEntity } from './modules/vouchers/entity/entity';
import { SmtpSettingsEntity } from './modules/smtp/entity/entity';
import { ApiKeyEntity } from './modules/api-key/entity/entity';
import { EmailTemplatesEntity } from './modules/email-templates/entity/entity';
import { SubcriptionsEntity } from './modules/subcriptions/entity/entity';
import { UserSessionsEntity } from './modules/user-sessions/entity/entity';
import { VoucherRedemptionsEntity } from './modules/voucher-redeemption/entity/entity';

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
  entities: [
    UserEntity,
    OrganizationEntity,
    VouchersEntity,
    SmtpSettingsEntity,
    ApiKeyEntity,
    SubcriptionsEntity,
    EmailTemplatesEntity,
    UserSessionsEntity,
    VoucherRedemptionsEntity,
  ],
  migrations: ['src/migration/**/*.ts'],
} as DataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('NODE_ENV', process.env.NODE_ENV);
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    throw new Error('Error during Data Source initialization:');
  });
