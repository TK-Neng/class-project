import UsersController from "#controllers/users_controller";
import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController, 'register']).as('register')
        router.post('/login', [UsersController, 'login']).as('login')
        router.post('/logout', [UsersController, 'logout']).as('logout')
        router.get('/auth/session', [UsersController, 'checkLogin']).as('checkLogin').use(middleware.auth())
        router.get('/profile', [UsersController, 'getProfile']).as('getProfile').use(middleware.auth())
        router.put('/profile', [UsersController, 'updateProfile']).as('updateProfile').use(middleware.auth())
        router.get('/allusers', [UsersController, 'getAllUsers']).as('getAllUsers').use(middleware.auth())
    }).prefix('/users')
}).prefix('/api')

router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController, 'registerAdmin']).as('registerAdmin').use(middleware.auth())
    }).prefix('/admin')
}).prefix('/api')