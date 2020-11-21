import { MigrationInterface, QueryRunner } from "typeorm";

export class meetingsUpdate1605913137792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
              insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Miercoles 2 de Diciembre 7:00 pm');
              insert into meeting (title, spots, "meetingDate") values ('Reunión de jovenes', 136, 'Sabado 5 de Diciembre 6:00 pm');
              insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Domingo 6 de Diciembre 8:00 am');
              insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Domingo 6 de Diciembre 10:00 am');
              insert into meeting (title, spots, "meetingDate") values ('Reunión familiar', 136, 'Domingo 6 de Diciembre 12:00 m');
            `);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
