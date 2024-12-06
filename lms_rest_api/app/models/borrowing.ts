import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Borrowing extends BaseModel {
  @column({ isPrimary: true })
  declare borrow_id: number

  @column()
  declare user_id: number

  @column()
  declare book_id: number

  @column.date()
  declare borrow_date: DateTime

  @column.date()
  declare due_date: DateTime

  @column.date()
  declare return_date: DateTime | null

  @column()
  declare status: 'borrowed' | 'returned' | 'overdue'


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}