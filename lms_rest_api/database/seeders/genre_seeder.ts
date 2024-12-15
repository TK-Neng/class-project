import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Genre from '#models/genre'

export default class GenreSeeder extends BaseSeeder {
  async run() {
    await Genre.createMany([
      { name: 'Fiction' },
      { name: 'Fantasy' },
      { name: 'Science Fiction' },
      { name: 'Mystery' },
      { name: 'Romance' },
      { name: 'Thriller' },
      { name: 'Horror' },
      { name: 'Biography' },
      { name: 'History' },
      { name: 'Children' }
    ])
  }
}