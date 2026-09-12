import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWaterReport1789186722753 implements MigrationInterface {
  name = 'CreateWaterReport1789186722753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "WATER_REPORT" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "description" character varying NOT NULL, "severity" character varying NOT NULL, "reporterPhone" character varying NOT NULL, "isResolved" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_water_report_severity" CHECK ("severity" IN ('low', 'medium', 'high')), CONSTRAINT "PK_water_report_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "WATER_REPORT"`);
  }
}
