import User from '#models/user'
import Book from '#models/book'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import Role from '../../contract/Role.js'

export default class BookPolicy extends BasePolicy {
  before(user: User | null) {
    if (user?.role === Role.OWNER) {
      return true
    }
  }

  view(user: User): AuthorizerResponse {
    return true
  }

  create(user: User): AuthorizerResponse {
    return user.role === Role.ADMIN
  }

  update(user: User): AuthorizerResponse {
    return user.role === Role.ADMIN
  }

  delete(user: User): AuthorizerResponse {
    return user.role === Role.ADMIN
  }
}