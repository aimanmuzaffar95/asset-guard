import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileImageToUsers1770886159605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "profileImageUrl" VARCHAR(500) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "profileImageUrl"
        `);
  }
}
