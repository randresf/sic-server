import { MigrationInterface, QueryRunner } from "typeorm";

export class meetingsFinal1607400974058 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Miércoles 9 de Diciembre 7:00 pm');
        insert into meeting (title, spots, "meetingDate") values ('Reunión de jovenes', 136, 'Sábado 12 de Diciembre 6:00 pm');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Domingo 13 de Diciembre 8:00 am');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Domingo 13 de Diciembre 10:30 am');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Miércoles 23 de Diciembre 7:00 pm');
        insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Miércoles 30 de Diciembre 7:00 pm');
      `);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
