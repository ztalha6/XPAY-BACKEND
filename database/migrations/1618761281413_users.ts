import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned();
      table.string('email').unique();
      table.string('password', 255);
      table.string('full_name', 255);
      table.string('username', 255);
      table.string("verification_code", 10);
      table.integer('pin', 4).unique().unsigned()
      table.integer("is_verified");
      table.string("phone")
      table.text("image")
      table.integer("is_completed")
      table.string("social_platform")
      table.string("client_id")
      table.string("token")
      table.integer("is_social_login")
      table.integer("is_approved")
      table.timestamp("last_login_at")
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
      table.timestamps(true, true)
      table.timestamp('deleted_at', {useTz: true}).nullable().defaultTo(null)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
