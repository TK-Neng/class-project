import type { HttpContext } from '@adonisjs/core/http'
import Genre from '#models/genre'
import { genreValidator } from '#validators/genre'

export default class GenresController {
    async index({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const genres = await Genre.query().orderBy('name', 'asc')
            return response.ok(genres)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async store({auth, request, response }: HttpContext) {
        try {
            await auth.getUserOrFail()
            const data = await genreValidator.validate(request.all())
            const genre = await Genre.create(data)
            return response.created(genre)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async update({ auth, request, response, params }: HttpContext) {
        try {
            await auth.getUserOrFail()
            const data = await genreValidator.validate(request.all())
            const genre = await Genre.findOrFail(params.id)
            genre.merge(data)
            await genre.save()
            return response.ok(genre)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async destroy({auth, response, params }: HttpContext) {
        try {
            await auth.getUserOrFail()
            const genre = await Genre.findOrFail(params.id)
            await genre.delete()
            return response.noContent()
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}