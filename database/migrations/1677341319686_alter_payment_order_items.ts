import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payment_order_items'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('payment_id').unsigned().notNullable()
      table
        .foreign('payment_id')
        .references('payments.id')
        .onUpdate('cascade')
        .onDelete('cascade')
    })
  }
}
