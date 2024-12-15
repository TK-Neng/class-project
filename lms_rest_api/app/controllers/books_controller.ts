import type { HttpContext } from '@adonisjs/core/http'
import Book from '#models/book'
import { bookValidator } from '#validators/book'
import fs from 'fs'
import path from 'path'

export default class BooksController {
  async index({ auth, response, request }: HttpContext) {
    const page = request.input('page', 1) // Default page 1
    const perPage = request.input('perPage', 8) // Default 10 items per page
    try {
      const user = auth.getUserOrFail()
      const books = await Book.query()
        .preload('genres', (query) => {
          query.orderBy('name', 'asc')
        })
        .orderBy('year_publication', 'desc')
        .paginate(page, perPage)
      return response.ok(books)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  async show({ auth, response, params }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const book = await Book.query()
        .where('book_id', params.id)
        .preload('genres', (query) => {
          query.orderBy('name', 'asc')
        })
        .firstOrFail()
      return response.ok(book)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  async store({ auth, response, request }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return response.unauthorized({
          message: 'Only administrators can create books',
        })
      }

      // Validate request data
      const data = await bookValidator.validate(request.all())

      // Handle file upload
      const image = request.file('image', {
        extnames: ['jpg', 'png', 'jpeg'],
        size: '2mb',
      })

      if (image) {
        if (!image.isValid) {
          return response.badRequest(image.errors)
        }

        // เพิ่มนามสกุลไฟล์เข้าไปในชื่อไฟล์
        const fileName = `${data.title.toLowerCase()}.${image.extname}`

        // แก้ไขจาก "../public/images" เป็น path ที่ถูกต้อง
        await image.move(path.join(process.cwd(), 'public', 'images'), {
          name: fileName,
          overwrite: true, // This will overwrite existing files with the same name
        })
      }

      // Create new book
      const book = await Book.create(data)

      // เพิ่ม genres ถ้ามีการส่งมา
      if (data.genres && data.genres.length > 0) {
        await book.related('genres').attach(data.genres)
      }

      await book.load('genres')
      return response.created({
        book,
        message: 'Book created successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create book',
        errors: error.messages || error.message,
      })
    }
  }

  async getBookImage({ response, params }: HttpContext) {
    try {
      const book = await Book.findOrFail(params.id)

      // Try different image extensions
      const possibleExtensions = ['jpg', 'png', 'jpeg'] as const
      let filePath: string | null = null
      let fileExt: string | null = null

      for (const ext of possibleExtensions) {
        const tempPath = path.join(
          process.cwd(),
          'public',
          'images',
          `${book.title.toLowerCase()}.${ext}`
        )
        if (fs.existsSync(tempPath)) {
          filePath = tempPath
          fileExt = ext
          break
        }
      }

      if (!filePath || !fileExt) {
        return response.notFound({
          message: 'Book image not found',
        })
      }

      const contentTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
      }

      response.header('Content-Type', contentTypes[fileExt])
      const stream = fs.createReadStream(filePath)
      return response.stream(stream)
    } catch (error) {
      console.error('Error fetching book image:', error)
      return response.notFound({
        message: 'Book image not found',
        errors: error.messages || error.message,
      })
    }
  }

  async destroy({ auth, response, params }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return response.unauthorized({
          message: 'Only administrators can delete books',
        })
      }

      const book = await Book.findOrFail(params.id)

      // Delete book image if exists
      const possibleExtensions = ['jpg', 'png', 'jpeg']
      for (const ext of possibleExtensions) {
        const imagePath = path.join(
          process.cwd(),
          'public',
          'images',
          `${book.title.toLowerCase()}.${ext}`
        )
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          break
        }
      }
      // ลบความสัมพันธ์กับ genres ก่อน
      await book.related('genres').detach()
      await book.delete()

      return response.ok({
        message: 'Book and its image deleted successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to delete book',
        errors: error.messages || error.message,
      })
    }
  }

  async update({ auth, response, request, params }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      if (user.role !== 'ADMIN') {
        return response.unauthorized({
          message: 'Only administrators can update books',
        })
      }

      const book = await Book.findOrFail(params.id)
      const data = await bookValidator.validate(request.all())
      const oldTitle = book.title.toLowerCase()
      const newTitle = data.title.toLowerCase()

      // Handle file upload
      const image = request.file('image', {
        extnames: ['jpg', 'png', 'jpeg'],
        size: '2mb',
      })

      if (image) {
        if (!image.isValid) {
          return response.badRequest(image.errors)
        }

        // Delete old image if exists
        const possibleExtensions = ['jpg', 'png', 'jpeg']
        for (const ext of possibleExtensions) {
          const oldImagePath = path.join(process.cwd(), 'public', 'images', `${oldTitle}.${ext}`)
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
            break
          }
        }

        // Save new image with new title
        const fileName = `${newTitle}.${image.extname}`
        await image.move(path.join(process.cwd(), 'public', 'images'), {
          name: fileName,
          overwrite: true,
        })
      } else if (oldTitle !== newTitle) {
        // If title changed but no new image, rename existing image
        const possibleExtensions = ['jpg', 'png', 'jpeg']
        for (const ext of possibleExtensions) {
          const oldImagePath = path.join(process.cwd(), 'public', 'images', `${oldTitle}.${ext}`)
          if (fs.existsSync(oldImagePath)) {
            const newImagePath = path.join(process.cwd(), 'public', 'images', `${newTitle}.${ext}`)
            fs.renameSync(oldImagePath, newImagePath)
            break
          }
        }
      }

      book.merge(data)
      await book.save()

      // อัพเดท genres ถ้ามีการส่งมา
      if (data.genres) {
        await book.related('genres').sync(data.genres)
      }
      return response.ok({
        book,
        message: 'Book updated successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to update book',
        errors: error.messages || error.message,
      })
    }
  }

  async quickSearch({ auth, request, response }: HttpContext) {
    try {
      await auth.getUserOrFail()
      const query = request.input('query', '').trim()

      console.log('Received search query:', query)

      if (!query) {
        return response.ok([])
      }

      const books = await Book.query()
        .whereILike('title', `%${query}%`)
        .orWhereILike('author', `%${query}%`)
        .limit(10)
        .orderBy('title', 'asc')

      console.log('Search results:', books)

      return response.ok(books)
    } catch (error) {
      console.error('Search error:', error)
      return response.status(404).json({
        error: 'Search failed',
        message: error.message,
      })
    }
  }
}
