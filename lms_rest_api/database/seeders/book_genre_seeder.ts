import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Genre from '#models/genre'
import Book from '#models/book'

export default class BookGenreSeeder extends BaseSeeder {
  async run() {
    // หาหนังสือทั้งหมด
    const books = await Book.all()
    
    // หา genres ทั้งหมด
    const genres = await Genre.all()

    // สร้าง object เพื่อเก็บ genre ตาม name
    const genreMap = genres.reduce((acc, genre) => {
      acc[genre.name] = genre
      return acc
    }, {})

    // กำหนดความสัมพันธ์
    for (const book of books) {
      switch(book.title) {
        case 'The Great Gatsby':
        case 'Pride and Prejudice':
        case 'Jane Eyre':
        case 'Anna Karenina':
          await book.related('genres').attach([genreMap['Fiction'].genre_id, genreMap['Romance'].genre_id])
          break

        case 'The Hobbit':
          await book.related('genres').attach([genreMap['Fantasy'].genre_id, genreMap['Fiction'].genre_id])
          break

        case '1984':
        case 'Fahrenheit 451':
        case 'The War of the Worlds':
        case 'The Time Machine':
          await book.related('genres').attach([genreMap['Science Fiction'].genre_id, genreMap['Fiction'].genre_id])
          break

        case 'Dracula':
        case 'Frankenstein':
          await book.related('genres').attach([genreMap['Horror'].genre_id, genreMap['Fiction'].genre_id])
          break

        case 'Crime and Punishment':
        case 'The Count of Monte Cristo':
          await book.related('genres').attach([genreMap['Mystery'].genre_id, genreMap['Thriller'].genre_id])
          break

        case 'The Odyssey':
        case 'The Divine Comedy':
        case 'Les Miserables':
          await book.related('genres').attach([genreMap['Fiction'].genre_id, genreMap['History'].genre_id])
          break

        default:
          await book.related('genres').attach([genreMap['Fiction'].genre_id])
      }
    }
  }
}