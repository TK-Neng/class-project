import UsersController from "#controllers/users_controller";
import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController, 'register']).as('register')
        router.post('/login', [UsersController, 'login']).as('login')
        router.post('/logout', [UsersController, 'logout']).as('logout')
        router.post('/verify',[UsersController,'verifyUsername']).as('users.verify')
        router.group(() => {
            router.get('/auth/session', [UsersController, 'checkLogin']).as('checkLogin')
            router.get('/profile', [UsersController, 'getProfile']).as('getProfile')
            router.put('/profile', [UsersController, 'updateProfile']).as('updateProfile')
            router.get('/allusers', [UsersController, 'getAllUsers']).as('getAllUsers')
            router.get('/show/:id', [UsersController, 'getUser']).as('showUser')
            router.put('/edit/:id', [UsersController, 'editUser']).as('editUser')
            router.delete('/delete/:id', [UsersController, 'deleteUser']).as('deleteUser')
            router.put('/changepass', [UsersController, 'changePassword']).as('changePassword')
        }).use(middleware.auth())
    }).prefix('/users')
    router.group(() => {
        router.post('/register', [UsersController, 'registerAdmin']).as('registerAdmin')
    }).prefix('/admin').use(middleware.auth())
}).prefix('/api')
