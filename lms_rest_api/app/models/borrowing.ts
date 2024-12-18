import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Status from '../../contract/Status.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Book from './book.js'
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
  declare status: Status


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=> User)
  declare user: BelongsTo<typeof User>

  @belongsTo(()=> Book)
  declare book: BelongsTo<typeof Book>
}