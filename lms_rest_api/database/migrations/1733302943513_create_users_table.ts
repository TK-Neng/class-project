import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('email', 255).unique().notNullable()
      table.enum('role', ['admin', 'user']).defaultTo('user')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}