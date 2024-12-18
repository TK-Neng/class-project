import User from '#models/user'
import { registerUserValidator, updateProfileValidator, editUserValidator } from '#validators/user'
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
    async registerAdmin({ request, response, auth, bouncer }: HttpContext) {
        const user = auth.getUserOrFail()
        await bouncer.with('UserPolicy').authorize('create')
        const payload = await request.validateUsing(registerUserValidator)
        await User.create({
            ...payload,
            role: Role.ADMIN // Force role to be ADMIN
        })
        return response.created({ message: 'Admin user created successfully' })
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
                return response.json({ authenticated: true, role: auth.user.role, username: auth.user.username });
            }
            return response.json({ authenticated: false });
        }
        catch (error) {
            return response.json({ authenticated: false })
        }
    }

    async getProfile({ auth, response }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const data = {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number
            }
            return response.json(data)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async updateProfile({ auth, request, response }: HttpContext) {
        try {
            const user = auth.user!
            const data = await request.validateUsing(updateProfileValidator)

            // แปลง empty string เป็น null สำหรับ phone_number
            if (data.phone_number === '') {
                data.phone_number = null
            }

            await user.merge(data).save()

            return response.ok({
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number
            })
        } catch (error) {
            console.error('Update Profile Error:', error)
            if (error.messages) {
                return response.badRequest({
                    message: 'ข้อมูลไม่ถูกต้อง',
                    errors: error.messages
                })
            }
            return response.badRequest({
                message: 'ไม่สามารถอัพเดตข้อมูลได้',
                error: error.message
            })
        }
    }

    async getAllUsers({ auth, response, bouncer }: HttpContext) {
        const user = await auth.getUserOrFail()
        await bouncer.with('UserPolicy').authorize('viewList')
        // Owner can see all users
        if (user.role === Role.OWNER) {
            const users = await User.query()
                .orderByRaw(`CASE 
                        WHEN role = 'OWNER' THEN 1
                        WHEN role = 'ADMIN' THEN 2
                        ELSE 3
                    END`)
                .orderBy('created_at', 'desc')
            return response.ok(users)
        }

        // Admin can only see regular users and themselves
        const users = await User.query()
            .where((query) => {
                query.where('role', '=', Role.USER)
                    .orWhere((subQuery) => {
                        subQuery
                            .where('role', '=', Role.ADMIN)
                            .where('username', '=', user.username)
                    })
            })
            .orderBy('role', 'asc')
            .orderBy('created_at', 'desc')
        return response.ok(users)
    }

    async getUser({ auth, response, params, bouncer }: HttpContext) {
        const user = await auth.getUserOrFail()
        const { id } = params
        const userToGet = await User.findOrFail(id)
        await bouncer.with('UserPolicy').authorize('view', userToGet)
        return response.ok(userToGet)
    }

    async editUser({ auth, request, response, bouncer }: HttpContext) {

        const user = await auth.getUserOrFail()
        const { id } = request.params()
        const payload = await request.validateUsing(editUserValidator)
        const userToEdit = await User.findOrFail(id)
        await bouncer.with('UserPolicy').authorize('update', userToEdit)

        const updateData: any = {}

        if (payload.username) {
            updateData.username = payload.username
        }

        // Make password update optional
        if (payload.password && payload.password.trim() !== '') {
            updateData.password = payload.password
        }

        if (Object.keys(updateData).length > 0) {
            await userToEdit.merge(updateData).save()
        }

        return response.ok({ message: 'User updated successfully' })

    }

    async verifyUsername({ request, response }: HttpContext) {
        const username = request.input('username')

        const user = await User.findBy('username', username)
        if (user) {
            return response.status(203).send({ message: 'The username is already used.' })
        } else {
            return response.ok({ message: 'The username is available' })
        }
    }

    async deleteUser({ auth, response, params, bouncer }: HttpContext) {

        const currentUser = await auth.getUserOrFail()
        const { id } = params

        const userToDelete = await User.findOrFail(id)
        await bouncer.with('UserPolicy').authorize('delete', userToDelete)

        // For OWNER role
        if (currentUser.role === Role.OWNER) {
            // Prevent owner from deleting themselves
            if (id === currentUser.user_id) {
                return response.badRequest('Cannot delete your own account')
            }
            // Owner can delete anyone except themselves
            await User.query().where('user_id', id).delete()
            return response.ok({ message: 'User deleted successfully' })
        }

        // For ADMIN role
        if (currentUser.role === Role.ADMIN) {
            // Get user to be deleted
            const userToDelete = await User.findOrFail(id)

            // Check if trying to delete non-USER role
            if (userToDelete.role !== Role.USER) {
                return response.unauthorized('Admins can only delete regular users')
            }

            // Delete only USER role account
            await User.query()
                .where('user_id', id)
                .where('role', Role.USER)
                .delete()

            return response.ok({ message: 'User deleted successfully' })
        }

    }

}