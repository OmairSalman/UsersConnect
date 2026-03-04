import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772622251035 implements MigrationInterface {
    name = 'InitialSchema1772622251035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`comment\` (\`_id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`author_id\` varchar(255) NOT NULL, \`post_id\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post\` (\`_id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`imageURL\` varchar(255) NULL, \`author_id\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`_id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`isEmailPublic\` tinyint NOT NULL DEFAULT 0, \`isEmailVerified\` tinyint NOT NULL DEFAULT 0, \`password\` varchar(255) NOT NULL, \`avatarURL\` varchar(255) NOT NULL, \`isAdmin\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment_likes_user\` (\`comment_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_fa0b22b68f9352c06027367396\` (\`comment_id\`), INDEX \`IDX_713685fc811a24b8d9e65a1491\` (\`user_id\`), PRIMARY KEY (\`comment_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment_dislikes_user\` (\`comment_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_7835f8f4d2bf3be2ed48c91250\` (\`comment_id\`), INDEX \`IDX_08c4e20495636dbb0cd6ea4331\` (\`user_id\`), PRIMARY KEY (\`comment_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post_likes_user\` (\`post_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_4e00e3f0d9c6456379225c646c\` (\`post_id\`), INDEX \`IDX_1d603395d1ce6d61f4781422db\` (\`user_id\`), PRIMARY KEY (\`post_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post_dislikes_user\` (\`post_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_d7f96f9ec36ecf92876d34c9f7\` (\`post_id\`), INDEX \`IDX_2b85534ebdddeb35262dd4b170\` (\`user_id\`), PRIMARY KEY (\`post_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_3ce66469b26697baa097f8da923\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_8aa21186314ce53c5b61a0e8c93\` FOREIGN KEY (\`post_id\`) REFERENCES \`post\`(\`_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_2f1a9ca8908fc8168bc18437f62\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment_likes_user\` ADD CONSTRAINT \`FK_fa0b22b68f9352c060273673963\` FOREIGN KEY (\`comment_id\`) REFERENCES \`comment\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`comment_likes_user\` ADD CONSTRAINT \`FK_713685fc811a24b8d9e65a14914\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`comment_dislikes_user\` ADD CONSTRAINT \`FK_7835f8f4d2bf3be2ed48c91250b\` FOREIGN KEY (\`comment_id\`) REFERENCES \`comment\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`comment_dislikes_user\` ADD CONSTRAINT \`FK_08c4e20495636dbb0cd6ea43316\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`post_likes_user\` ADD CONSTRAINT \`FK_4e00e3f0d9c6456379225c646c2\` FOREIGN KEY (\`post_id\`) REFERENCES \`post\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`post_likes_user\` ADD CONSTRAINT \`FK_1d603395d1ce6d61f4781422db5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`post_dislikes_user\` ADD CONSTRAINT \`FK_d7f96f9ec36ecf92876d34c9f7a\` FOREIGN KEY (\`post_id\`) REFERENCES \`post\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`post_dislikes_user\` ADD CONSTRAINT \`FK_2b85534ebdddeb35262dd4b1702\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post_dislikes_user\` DROP FOREIGN KEY \`FK_2b85534ebdddeb35262dd4b1702\``);
        await queryRunner.query(`ALTER TABLE \`post_dislikes_user\` DROP FOREIGN KEY \`FK_d7f96f9ec36ecf92876d34c9f7a\``);
        await queryRunner.query(`ALTER TABLE \`post_likes_user\` DROP FOREIGN KEY \`FK_1d603395d1ce6d61f4781422db5\``);
        await queryRunner.query(`ALTER TABLE \`post_likes_user\` DROP FOREIGN KEY \`FK_4e00e3f0d9c6456379225c646c2\``);
        await queryRunner.query(`ALTER TABLE \`comment_dislikes_user\` DROP FOREIGN KEY \`FK_08c4e20495636dbb0cd6ea43316\``);
        await queryRunner.query(`ALTER TABLE \`comment_dislikes_user\` DROP FOREIGN KEY \`FK_7835f8f4d2bf3be2ed48c91250b\``);
        await queryRunner.query(`ALTER TABLE \`comment_likes_user\` DROP FOREIGN KEY \`FK_713685fc811a24b8d9e65a14914\``);
        await queryRunner.query(`ALTER TABLE \`comment_likes_user\` DROP FOREIGN KEY \`FK_fa0b22b68f9352c060273673963\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_2f1a9ca8908fc8168bc18437f62\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_8aa21186314ce53c5b61a0e8c93\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_3ce66469b26697baa097f8da923\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b85534ebdddeb35262dd4b170\` ON \`post_dislikes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_d7f96f9ec36ecf92876d34c9f7\` ON \`post_dislikes_user\``);
        await queryRunner.query(`DROP TABLE \`post_dislikes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d603395d1ce6d61f4781422db\` ON \`post_likes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e00e3f0d9c6456379225c646c\` ON \`post_likes_user\``);
        await queryRunner.query(`DROP TABLE \`post_likes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_08c4e20495636dbb0cd6ea4331\` ON \`comment_dislikes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_7835f8f4d2bf3be2ed48c91250\` ON \`comment_dislikes_user\``);
        await queryRunner.query(`DROP TABLE \`comment_dislikes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_713685fc811a24b8d9e65a1491\` ON \`comment_likes_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_fa0b22b68f9352c06027367396\` ON \`comment_likes_user\``);
        await queryRunner.query(`DROP TABLE \`comment_likes_user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`post\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
    }

}
