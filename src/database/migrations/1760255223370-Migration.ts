import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760255223370 implements MigrationInterface {
    name = 'Migration1760255223370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`routines\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`routines\` ADD \`category\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`routines\` CHANGE \`created_at\` \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routines\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`start_date\` \`start_date\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`end_date\` \`end_date\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`created_at\` \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` ADD CONSTRAINT \`FK_32d93b00649de6e247dc673e29e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` ADD CONSTRAINT \`FK_c8f5488a954da4986189ad36bde\` FOREIGN KEY (\`routine_id\`) REFERENCES \`routines\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` ADD CONSTRAINT \`FK_87be69746256f03f96af06ec19f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` ADD CONSTRAINT \`FK_e578f573e0acaf90dcc5d33953f\` FOREIGN KEY (\`user_routine_id\`) REFERENCES \`user_routines\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`routine_times\` DROP FOREIGN KEY \`FK_e578f573e0acaf90dcc5d33953f\``);
        await queryRunner.query(`ALTER TABLE \`routine_times\` DROP FOREIGN KEY \`FK_87be69746256f03f96af06ec19f\``);
        await queryRunner.query(`ALTER TABLE \`user_routines\` DROP FOREIGN KEY \`FK_c8f5488a954da4986189ad36bde\``);
        await queryRunner.query(`ALTER TABLE \`user_routines\` DROP FOREIGN KEY \`FK_32d93b00649de6e247dc673e29e\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` CHANGE \`updated_at\` \`updated_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routine_times\` CHANGE \`created_at\` \`created_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`updated_at\` \`updated_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`created_at\` \`created_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`end_date\` \`end_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`user_routines\` CHANGE \`start_date\` \`start_date\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`routines\` CHANGE \`updated_at\` \`updated_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routines\` CHANGE \`created_at\` \`created_at\` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`routines\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`routines\` ADD \`category\` varchar(200) NOT NULL`);
    }

}
