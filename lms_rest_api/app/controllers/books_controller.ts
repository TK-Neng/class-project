import type { HttpContext } from '@adonisjs/core/http'
import Book from '#models/book'
import { bookValidator } from '#validators/book'
import fs from 'fs';
import path from 'path'

export default class BooksController {
    async index({ auth, response, request }: HttpContext) {
        const page = request.input('page', 1); // Default page 1
        const perPage = request.input('perPage', 8); // Default 10 items per page
        try {
            const user = auth.getUserOrFail()
            const books = await Book.query().orderBy('genre', 'asc').paginate(page, perPage)
            return response.ok(books)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async show({ auth, response, params }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const book = await Book.findOrFail(params.id)
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
                    message: 'Only administrators can create books'
                })
            }

            // Validate request data
            const data = await bookValidator.validate(request.all())

            // Handle file upload
            const image = request.file('image', {
                extnames: ['jpg', 'png', 'jpeg'],
                size: '2mb'
            })

            if (image) {
                if (!image.isValid) {
                    return response.badRequest(image.errors)
                }

                // เพิ่มนามสกุลไฟล์เข้าไปในชื่อไฟล์
                const fileName = `${data.title.toLowerCase()}.${image.extname}`
                
                await image.move("../public/images", {
                    name: fileName,
                    overwrite: true // This will overwrite existing files with the same name
                })
            }

            // Create new book
            const book = await Book.create(data)

            return response.created({
                book,
                message: 'Book created successfully'
            })
        } catch (error) {
            return response.badRequest({
                message: 'Failed to create book',
                errors: error.messages || error.message
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
                const tempPath = path.join(process.cwd(), 'public', 'images', `${book.title.toLowerCase()}.${ext}`)
                if (fs.existsSync(tempPath)) {
                    filePath = tempPath
                    fileExt = ext
                    break
                }
            }

            if (!filePath || !fileExt) {
                return response.notFound({
                    message: 'Book image not found'
                })
            }

            const contentTypes: Record<string, string> = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png'
            }
            
            response.header('Content-Type', contentTypes[fileExt])
            const stream = fs.createReadStream(filePath)
            return response.stream(stream)
        } catch (error) {
            console.error('Error fetching book image:', error)
            return response.notFound({
                message: 'Book image not found',
                errors: error.messages || error.message
            })
        }
    }
}