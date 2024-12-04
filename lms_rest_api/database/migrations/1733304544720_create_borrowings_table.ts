import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'borrowings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.integer('book_id').unsigned().notNullable().references('book_id').inTable('books').onDelete('CASCADE');
      table.date('borrow_date').notNullable();
      table.date('due_date').notNullable();
      table.date('return_date').nullable();
      table.enum('status', ['borrowed', 'returned', 'overdue']).defaultTo('borrowed');
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}