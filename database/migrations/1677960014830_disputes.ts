import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'disputes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('comments').notNullable()
      table.integer('dispute_status').notNullable().unsigned().defaultTo(10)
      table.integer('payment_id').unsigned().notNullable()
      table
        .foreign('payment_id')
        .references('payments.id')
        .onUpdate('cascade')
        .onDelete('cascade')

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
