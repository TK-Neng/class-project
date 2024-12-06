import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Book from '#models/book'
export default class BookSeeder extends BaseSeeder {
  async run() {
    await Book.createMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        isbn: '9780743273565',
        quantity: 10,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        isbn: '9780061120084',
        quantity: 15,
      },
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Dystopian',
        isbn: '9780451524935',
        quantity: 20,
      },
    ])
  }
}