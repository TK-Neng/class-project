import BooksController from "#controllers/books_controller";
import router from "@adonisjs/core/services/router";
import { middleware } from '#start/kernel'


router.group(() => {
    router.group(() => {
        router.get('/books/image/:id', [BooksController, 'getBookImage']).as('getBookImage')
        router.get('/books', [BooksController, 'index']).as('index')
        router.get('/books/search', [BooksController, 'quickSearch']).as('quickSearch')
        router.get('/books/:id', [BooksController, 'show']).as('show')
        router.post('/books', [BooksController, 'store']).as('store')
        router.put('/books/:id', [BooksController, 'update']).as('update')
        router.delete('/books/:id', [BooksController, 'destroy']).as('destroy')
    })
}).prefix('/api').use(middleware.auth())
