import Book from "#models/book";
import Borrowing from "#models/borrowing";
import { HttpContext } from "@adonisjs/core/http";
import { DateTime } from 'luxon';
import nodemailer from 'nodemailer'
export default class BorrowingsController {
    private transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        })
    }

    async index({ auth, response }: HttpContext) {
        const user = auth.getUserOrFail()
        try {
            let borrowings;
            if (user.role === 'ADMIN' || user.role === 'OWNER') {
                borrowings = await Borrowing.query()
                    .whereNull('return_date')
                    .preload('user')
                    .preload('book')
                    .orderBy('due_date', 'asc')
            } else {
                borrowings = await Borrowing.query()
                    .where('user_id', user.user_id)
                    .preload('user')
                    .preload('book')
                    .orderBy('due_date', 'asc')
            }
            return response.ok(borrowings)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async borrow({ auth, request, response }: HttpContext) {
        const user = auth.getUserOrFail()
        const { book_id, due_date } = request.only(['book_id', 'due_date']);
        try {
            const book = await Book.findOrFail(book_id)
            if (book.quantity < 1) {
                return response.badRequest('Book is not available for borrowing.')
            }

            const borrowing = await Borrowing.create({
                user_id: user.user_id,
                book_id: book_id,
                due_date: due_date,
                return_date: null
            })

            book.quantity -= 1
            await book.save()
            return response.created(borrowing)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async return({ auth, request, response, bouncer }: HttpContext) {
        const user = auth.getUserOrFail()
        await bouncer.with('BorrowingPolicy').authorize('return')
        const { borrow_id, user_id } = request.only(['borrow_id', 'user_id']);
        try {
            const borrowing = await Borrowing.query()
                .where('borrow_id', borrow_id)
                .andWhere('user_id', user_id)
                .firstOrFail()
            const book = await Book.findOrFail(borrowing.book_id)
            borrowing.return_date = DateTime.now()
            await borrowing.save()

            book.quantity += 1
            await book.save()
            return response.ok(borrowing)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }


    async sendOverdueNotification({ auth, request, response }: HttpContext) {
        await auth.getUserOrFail()
        try {
            const { borrow_id } = request.only(['borrow_id'])
            const borrowing = await Borrowing.query()
                .where('borrow_id', borrow_id)
                .preload('user')
                .preload('book')
                .firstOrFail()

            // Verify SMTP connection
            await this.transporter.verify()

            const mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: borrowing.user.email,
                subject: 'แจ้งเตือนหนังสือเกินกำหนดส่ง - ห้องสมุด',
                html: `
                    <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1a237e;">แจ้งเตือนหนังสือเกินกำหนดส่ง</h2>
                        </div>
                        
                        <p>เรียน คุณ${borrowing.user.first_name} ${borrowing.user.last_name}</p>
                        
                        <p style="text-indent: 2em;">ตามที่ท่านได้ยืมหนังสือจากห้องสมุดของเรา ทางห้องสมุดขอแจ้งให้ทราบว่าหนังสือที่ท่านยืมได้เกินกำหนดส่งคืนแล้ว โดยมีรายละเอียดดังนี้</p>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                            <p><strong>ชื่อหนังสือ:</strong> ${borrowing.book.title}</p>
                            <p><strong>วันครบกำหนดส่ง:</strong> ${borrowing.due_date.toFormat('dd/MM/yyyy')}</p>
                        </div>
                        
                        <p style="text-indent: 2em;">จึงขอความกรุณาท่านนำหนังสือมาคืนที่ห้องสมุดโดยเร็วที่สุด เพื่อให้ผู้ใช้ท่านอื่นได้มีโอกาสใช้บริการต่อไป</p>
                        
                        <div style="margin-top: 30px;">
                            <p>ขอแสดงความนับถือ</p>
                            <p>ฝ่ายบริการห้องสมุด</p>
                        </div>
                        
                        <div style="margin-top: 30px; font-size: 0.8em; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                            <p>หมายเหตุ: นี่เป็นอีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
                            <p>หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่ห้องสมุด</p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            return response.ok({ message: 'ส่งอีเมลแจ้งเตือนเรียบร้อย' })
        } catch (error) {
            console.error('Email error:', error);
            return response.badRequest({ 
                message: 'ไม่สามารถส่งอีเมลได้',
                error: error.message 
            })
        }
    }
}