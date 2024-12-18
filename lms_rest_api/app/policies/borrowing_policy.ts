import User from '#models/user'
import Borrowing from '#models/borrowing'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class BorrowingPolicy extends BasePolicy {
    return(user: User): AuthorizerResponse {
        return user.role === 'ADMIN' || user.role === 'OWNER'   
    }
}