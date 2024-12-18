import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import Role from '../../contract/Role.js'

export default class UserPolicy extends BasePolicy {
  viewList(user: User): AuthorizerResponse {
    return user.role === Role.ADMIN || user.role === Role.OWNER
  }

  view(user: User, targetUser: User): AuthorizerResponse {
    return user.role === Role.ADMIN || user.role === Role.OWNER
  }

  create(user: User): AuthorizerResponse {
    return user.role === Role.OWNER
  }

  update(user: User, targetUser: User): AuthorizerResponse {
    return user.role === Role.ADMIN || user.role === Role.OWNER
  }

  delete(user: User, targetUser: User): AuthorizerResponse {
    if (user.role === Role.OWNER) {
      return user.user_id !== targetUser.user_id
    }
    if (user.role === Role.ADMIN) {
      return targetUser.role === Role.USER
    }
    return false
  }
}