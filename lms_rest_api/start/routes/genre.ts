import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
import GenresController from "#controllers/genres_controller";

router.group(() => {
    router.group(() => {
        router.get('/genres', [GenresController, 'index']).as('indexGenres')
        router.post('/genres', [GenresController, 'store']).as('storeGenres')
        router.put('/genres/:id', [GenresController, 'update']).as('updateGenres')
        router.delete('/genres/:id', [GenresController, 'destroy']).as('destroyGenres')
    })
}).prefix('/api').use(middleware.auth())