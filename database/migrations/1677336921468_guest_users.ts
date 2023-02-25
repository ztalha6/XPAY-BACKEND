import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'guest_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string("verification_code", 10)
      table.string("phone").notNullable()

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
