import { MigrationInterface, QueryRunner } from "typeorm";

export class meetingsFinal1607465655788 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2020-12-09 19:00:00');
            insert into meeting (title, spots, "meetingDate") values ('Reunión de jovenes', 136, '2020-12-12 18:00:00');
            insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2020-12-13 08:00:00');
            insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, '2020-12-13 10:30:00');
          `);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
