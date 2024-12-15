import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
import GenresController from "#controllers/genres_controller";

router.group(() => {
    router.group(() => {
        router.get('/genres', [GenresController, 'index']).as('indexGenres')
    })
}).prefix('/api').use(middleware.auth())