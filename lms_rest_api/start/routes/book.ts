import BooksController from "#controllers/books_controller";
import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'
router.group(() => {
    router.group(() => {
        router.get('/books', [BooksController, 'index']).as('index')
    })
}).prefix('/api').use(middleware.auth())