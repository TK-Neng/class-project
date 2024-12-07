import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Borrowing from '#models/borrowing'
import { DateTime } from 'luxon'
import Status from '../../contract/Status.js'
export default class BoorrowingSeeder extends BaseSeeder {
  public async run() {
    await Borrowing.createMany([
      {
        user_id: 2,
        book_id: 1,
        borrow_date: DateTime.local(),
        due_date: DateTime.local().plus({ days: 14 }),
        return_date: null,
        status: Status.BORROWED,
      },
      {
        user_id: 2,
        book_id: 2,
        borrow_date: DateTime.local().minus({ days: 20 }),
        due_date: DateTime.local().minus({ days: 6 }),
        return_date: DateTime.local().minus({ days: 5 }),
        status: Status.RETURNED,
      },
      {
        user_id: 2,
        book_id: 3,
        borrow_date: DateTime.local().minus({ days: 30 }),
        due_date: DateTime.local().minus({ days: 16 }),
        return_date: null,
        status: Status.OVERDUE,
      },
    ])
  }
}