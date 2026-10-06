import { MigrationInterface, QueryRunner } from "typeorm";

export class SetNullOnDeleteForTicketServiceOrder1777500000000 implements MigrationInterface {
  name = "SetNullOnDeleteForTicketServiceOrder1777500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        FOR constraint_name IN
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
          WHERE rel.relname = 'tickets'
            AND con.contype = 'f'
            AND att.attname = 'serviceOrderId'
        LOOP
          EXECUTE format('ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS %I', constraint_name);
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tickets_service_order'
        ) THEN
          ALTER TABLE "tickets"
          ADD CONSTRAINT "FK_tickets_service_order"
          FOREIGN KEY ("serviceOrderId")
          REFERENCES "service_orders"("id")
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tickets"
      DROP CONSTRAINT IF EXISTS "FK_tickets_service_order"
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tickets_service_order'
        ) THEN
          ALTER TABLE "tickets"
          ADD CONSTRAINT "FK_tickets_service_order"
          FOREIGN KEY ("serviceOrderId")
          REFERENCES "service_orders"("id")
          ON DELETE NO ACTION;
        END IF;
      END $$;
    `);
  }
}
