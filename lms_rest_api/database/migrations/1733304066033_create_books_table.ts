import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('book_id')
      table.string('title', 255).notNullable()
      table.string('author').nullable()
      table.string('genre').nullable()
      table.string('isbn').unique().nullable()
      table.integer('quantity').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}