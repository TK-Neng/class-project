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

    async store({ bouncer, request, response }: HttpContext) {
        await bouncer.with('GenrePolicy').authorize('create')
        const data = await genreValidator.validate(request.all())
        const genre = await Genre.create(data)
        return response.created(genre)
    }

    async update({ bouncer, request, response, params }: HttpContext) {
        await bouncer.with('GenrePolicy').authorize('update')
        const data = await genreValidator.validate(request.all())
        const genre = await Genre.findOrFail(params.id)
        genre.merge(data)
        await genre.save()
        return response.ok(genre)
    }

    async destroy({ bouncer, response, params }: HttpContext) {

        await bouncer.with('GenrePolicy').authorize('delete')
        const genre = await Genre.findOrFail(params.id)
        await genre.delete()
        return response.noContent()

    }
}