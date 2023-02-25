import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payment_order_items'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.decimal('price').unsigned().notNullable()
      table.string('extra')


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
