import {MigrationInterface, QueryRunner} from "typeorm";

export class testmeetings1608769022549 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2020-12-24 19:00:00');
        insert into meeting (title, spots, "meetingDate") values ('Reunión de jovenes', 136, '2020-12-24 18:00:00');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2020-12-31 08:00:00');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2021-01-05 10:30:00');
      `);
    }

    public async down(_: QueryRunner): Promise<void> {
    }

}
