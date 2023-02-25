import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_business_details'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('website_url', 255).notNullable()
    })
  }
}
