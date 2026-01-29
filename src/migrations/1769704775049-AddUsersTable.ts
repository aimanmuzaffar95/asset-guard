import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersTable1769704775049 implements MigrationInterface {
    name = 'AddUsersTable1769704775049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    }

}
