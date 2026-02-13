import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetTypesRef1770040868660 implements MigrationInterface {
  name = 'AddAssetTypesRef1770040868660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asset_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_asset_types_name" UNIQUE ("name"), CONSTRAINT "PK_asset_types" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `INSERT INTO "asset_types" ("name", "description") VALUES ('laptop', 'Laptop Computer'), ('monitor', 'External Monitor'), ('phone', 'Mobile Phone')`,
    );

    await queryRunner.query(`ALTER TABLE "assets" ADD "assetTypeId" uuid`);

    await queryRunner.query(
      `UPDATE "assets" SET "assetTypeId" = "asset_types"."id" FROM "asset_types" WHERE "assets"."type"::text = "asset_types"."name"`,
    );

    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "assetTypeId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_assets_asset_types" FOREIGN KEY ("assetTypeId") REFERENCES "asset_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."assets_type_enum" AS ENUM('laptop', 'monitor', 'phone')`,
    );

    await queryRunner.query(
      `ALTER TABLE "assets" ADD "type" "public"."assets_type_enum"`,
    );

    await queryRunner.query(
      `UPDATE "assets" SET "type" = "asset_types"."name"::"public"."assets_type_enum" FROM "asset_types" WHERE "assets"."assetTypeId" = "asset_types"."id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "assets" ALTER COLUMN "type" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_assets_asset_types"`,
    );
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "assetTypeId"`);

    await queryRunner.query(`DROP TABLE "asset_types"`);
  }
}
