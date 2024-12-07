import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    async register({ request, response }: HttpContext) {
        try{
            
        } catch (error) {
            response.badRequest(error.messages)
        }
    }
}