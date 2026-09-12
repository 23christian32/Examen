import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemUser1789186721753 implements MigrationInterface {
  name = 'CreateSystemUser1789186721753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "SYSTEM_USER" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isNotificationEnabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_system_user_email" UNIQUE ("email"), CONSTRAINT "PK_system_user_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "SYSTEM_USER"`);
  }
}
