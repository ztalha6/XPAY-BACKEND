import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Roles extends BaseSchema {
  protected tableName = 'roles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned()
      table.string('name')
      table.string('display_name')
      table.text('description')
      table.integer('created_by_id').unsigned().nullable()
      table.foreign('created_by_id')
        .references('users.id')
        .onUpdate('cascade')
        .onDelete('cascade')
      table.integer('updated_by_id').unsigned().nullable()
      table.foreign('updated_by_id')
        .references('users.id')
        .onUpdate('cascade')
        .onDelete('cascade')
      table.timestamps(true,true)
      table.timestamp('deleted_at', { useTz: true }).nullable().defaultTo(null)
    })

  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
