import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetInventoryFields1772000000000 implements MigrationInterface {
  name = 'AddAssetInventoryFields1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assets_status_enum" AS ENUM('available', 'assigned')`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "description" TO "notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "serialNumber" TYPE character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "notes" TYPE character varying(1000)`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "status" "public"."assets_status_enum" NOT NULL DEFAULT 'available'`,
    );
    await queryRunner.query(
      `UPDATE "assets" SET "name" = COALESCE(NULLIF(BTRIM("notes"), ''), "serialNumber")`,
    );
    await queryRunner.query(
      `UPDATE "assets" SET "status" = 'assigned' WHERE EXISTS (SELECT 1 FROM "asset_assignments" WHERE "asset_assignments"."assetId" = "assets"."id" AND "asset_assignments"."returnedAt" IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "notes" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "serialNumber" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "notes" TO "description"`,
    );
    await queryRunner.query(`DROP TYPE "public"."assets_status_enum"`);
  }
}
