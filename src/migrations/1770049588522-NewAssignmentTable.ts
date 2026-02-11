import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewAssignmentTable1770049588522 implements MigrationInterface {
  name = 'NewAssignmentTable1770049588522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asset_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignedAt" TIMESTAMP NOT NULL DEFAULT now(), "returnedAt" TIMESTAMP, "userId" uuid, "assetId" uuid, CONSTRAINT "PK_20629cd9ab403e64604ce5e36b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dc1b9ee1f2475280a7fb9ec534" ON "asset_assignments" ("assetId") WHERE "returnedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" ADD CONSTRAINT "FK_b0c73b7abfebace242c25b560b9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" ADD CONSTRAINT "FK_94349daf29f445266f3dddc4df9" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" DROP CONSTRAINT "FK_94349daf29f445266f3dddc4df9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" DROP CONSTRAINT "FK_b0c73b7abfebace242c25b560b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc1b9ee1f2475280a7fb9ec534"`,
    );
    await queryRunner.query(`DROP TABLE "asset_assignments"`);
  }
}
