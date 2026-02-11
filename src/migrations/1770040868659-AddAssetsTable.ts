import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1770040868659 implements MigrationInterface {
  name = 'Migrations1770040868659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assets_type_enum" AS ENUM('laptop', 'monitor', 'phone')`,
    );
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."assets_type_enum" NOT NULL, "serialNumber" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6d1ff17a763abe352afe92921d6" UNIQUE ("serialNumber"), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
  }
}
