import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Genre from './genre.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Borrowing from './borrowing.js'

export default class Book extends BaseModel {
  @column({ isPrimary: true })
  declare book_id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare author: string

  @column()
  declare year_publication: string

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Genre, {
    pivotTable: 'book_genres',
    localKey: 'book_id',
    pivotForeignKey: 'book_id',
    relatedKey: 'genre_id', 
    pivotRelatedForeignKey: 'genre_id',
    pivotTimestamps: true,
  })
  declare genres: ManyToMany<typeof Genre>


  @hasMany(()=> Borrowing)
  declare borrowings: HasMany<typeof Borrowing>
}