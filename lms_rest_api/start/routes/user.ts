import UsersController from "#controllers/users_controller";
import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController, 'register']).as('register')
        router.post('/login', [UsersController, 'login']).as('login')
    }).prefix('/v1/users')
}).prefix('/api')

router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController, 'registerAdmin']).as('registerAdmin').use(middleware.auth())
    }).prefix('/v1/admin')
}).prefix('/api')