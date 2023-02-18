import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_business_details'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('business_name', 80).notNullable()
      table.string('business_address', 255).notNullable()
      table.string('bank_account_number', 20).notNullable()
      table.string('bank_routing_number', 20).notNullable()
      table.string('tax_id_number', 20).notNullable()
      table.integer('user_id').unsigned().notNullable().unique()
      table
        .foreign('user_id')
        .references('users.id')
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
