import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  DB_HOST: env.get('DB_HOST').required().asString(),
  DB_PORT: env.get('DB_PORT').required().asPortNumber(),
  DB_USER: env.get('DB_USER').required().asString(),
  DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
  DB_NAME: env.get('DB_NAME').required().asString(),

  SMTP_HOST: env.get('SMTP_HOST').required().asString(),
  SMTP_PORT: env.get('SMTP_PORT').required().asPortNumber(),
  SMTP_USER: env.get('SMTP_USER').required().asString(),
  SMTP_PASS: env.get('SMTP_PASS').required().asString(),
  SMTP_FROM: env.get('SMTP_FROM').required().asString(),

  MAINTENANCE_EMAIL: env.get('MAINTENANCE_EMAIL').required().asString(),
};
