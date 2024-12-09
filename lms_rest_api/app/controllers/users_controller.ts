import User from '#models/user'
import { registerUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import Role from '../../contract/Role.js'

export default class UsersController {
    async register({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(registerUserValidator)
            await User.create({ first_name: payload.first_name, last_name: payload.last_name, username: payload.username, password: payload.password, email: payload.email, phone_number: payload.phone_number })
            response.ok('The user is register successfully.')
        } catch (error) {
            response.badRequest(error.messages)
        }
    }

    async login({ auth, request }: HttpContext) {
        try {
            const { username, password } = request.all()
            const user = await User.verifyCredentials(username, password)

            // Generate token with user data
            const token = await auth.use('jwt').generate(user)

            // Return token and role
            return {
                ...token,
                role: user.role
            }
        } catch (error) {
            throw new Error('Invalid credentials')
        }
    }
    async registerAdmin({ request, response, auth }: HttpContext) {
        try {
            const user = auth.user
            // Debug auth header
            console.log('Auth Header:', request.header('Authorization'))

            console.log('Auth User:', user) // See full user object
            console.log('Auth State:', auth) // See auth state

            if (user?.role !== Role.ADMIN) {
                return response.unauthorized('Only admins can create admin accounts')
            }

            const payload = await request.validateUsing(registerUserValidator)

            await User.create({
                ...payload,
                role: Role.ADMIN // Force role to be ADMIN
            })

            return response.created({ message: 'Admin user created successfully' })
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}