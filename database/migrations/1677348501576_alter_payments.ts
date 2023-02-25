import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('guest_user_id')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('guest_user_id').unsigned().notNullable()
      table
        .foreign('guest_user_id')
        .references('guest_users.id')
        .onUpdate('cascade')
        .onDelete('RESTRICT')
    })
  }
}
