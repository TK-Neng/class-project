import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Book from '#models/book'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
export default class Genre extends BaseModel {
  @column({ isPrimary: true })
  declare genre_id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Book, {
    pivotTable: 'book_genres',
    localKey: 'genre_id',
    pivotForeignKey: 'genre_id',
    relatedKey: 'book_id',
    pivotRelatedForeignKey: 'book_id',
    pivotTimestamps: true,
  })
  declare books: ManyToMany<typeof Book>
}