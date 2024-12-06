import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        username: 'admin',
        password: 'admin123', // Ideally, hash the password before storing
        email: 'admin@example.com',
        role: 'admin',
      },
      {
        username: 'user1',
        password: 'user123', // Ideally, hash the password before storing
        email: 'user1@example.com',
        role: 'user',
      },
    ])
  }
}