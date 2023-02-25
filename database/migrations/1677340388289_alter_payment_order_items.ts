import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payment_order_items'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('qty').unsigned().notNullable()
    })
  }
}
