import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '../../contract/Role.js'
export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin',
        password: 'admin123', // Ideally, hash the password before storing
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
      {
        first_name: 'Regular',
        last_name: 'User',
        username: 'user1',
        password: 'user123', // Ideally, hash the password before storing
        email: 'user1@example.com',
        role: Role.USER,
      },
    ])
  }
}