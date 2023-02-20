import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('payment_intent_id').notNullable();
      table.string('payment_method_id').notNullable();
      table.float('amount').notNullable();
      table.string('status').notNullable();
      table.string('last_payment_error').notNullable();
      table.integer('user_id').unsigned().notNullable().unique()
      table
        .foreign('user_id')
        .references('users.id')
        .onUpdate('cascade')
        .onDelete('RESTRICT')
      table.integer('vendor_id').unsigned().notNullable().unique()
      table
        .foreign('vendor_id')
        .references('users.id')
        .onUpdate('cascade')
        .onDelete('RESTRICT')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true)
      table.timestamp('deleted_at', {useTz: true}).nullable().defaultTo(null)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
