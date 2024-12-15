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

    async login({ auth, request, response, session }: HttpContext) {
        try {
            const { username, password } = request.only(['username', 'password'])
            const user = await User.verifyCredentials(username, password)

            await auth.use('web').login(user)
            // เพิ่ม role ลงใน session
            session.put('role', user.role);
            response.ok({ message: 'Logged in successfully' })

        } catch (error) {
            return response.unauthorized(error.message)
        }
    }
    async registerAdmin({ request, response, auth }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            if (user.role !== Role.ADMIN) {
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

    async logout({ auth, response }: HttpContext) {
        try {
            await auth.use('web').logout()
            response.ok({ message: 'Logged out successfully' })
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async checkLogin({ auth, response }: HttpContext) {
        try {
            if (auth.user) {
                return response.json({ authenticated: true, role: auth.user.role });
            }
            return response.json({ authenticated: false });
        }
        catch (error) {
            return response.json({ authenticated: false })
        }
    }

    async getProfile({ auth, response }: HttpContext) {
        try {
            const user = auth.user
            return response.ok(user)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

}