import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Role from '../../contract/Role.js'
import Borrowing from './borrowing.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare user_id: number

  @column()
  declare first_name: string

  @column()
  declare last_name: string

  @column()
  declare username: string

  @column({ serializeAs: null })
  declare password: string 

  @column()
  declare email: string

  @column()
  declare role: Role

  @column()
  declare phone_number: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Borrowing)
  declare borrowings: HasMany<typeof Borrowing>
}