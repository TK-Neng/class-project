import UsersController from "#controllers/users_controller";
import router from "@adonisjs/core/services/router";

router.group(() => {
    router.group(() => {
        router.post('/register', [UsersController,'register']).as('register')
        router.post('/login', [UsersController,'login']).as('login')
    }).prefix('/v1/users')
}).prefix('/api')