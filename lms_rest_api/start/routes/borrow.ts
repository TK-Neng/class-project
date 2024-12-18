import router from "@adonisjs/core/services/router";
import BorrowingsController from "#controllers/borrowings_controller";
import { middleware } from '#start/kernel'
router.group(() => {
    router.get('/borrowings', [BorrowingsController, 'index'])
    router.post('/borrowings', [BorrowingsController, 'borrow'])
    router.put('/borrowings', [BorrowingsController, 'return'])
    router.post('/borrowings/notify', [BorrowingsController, 'sendOverdueNotification']).use(middleware.auth())
}).prefix('/api').use(middleware.auth())