import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Book from './book.js'

export default class Borrowing extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare book_id: number

  @column.date({ autoCreate: true })
  declare borrow_date: DateTime

  @column.date()
  declare due_date: DateTime

  @column.dateTime()
  declare return_date: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Book, {
    foreignKey: 'book_id',
  })
  declare book: BelongsTo<typeof Book>
}