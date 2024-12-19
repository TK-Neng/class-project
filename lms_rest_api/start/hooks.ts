import { ApplicationService } from '@adonisjs/core/types'
import * as cron from 'node-cron'
import Borrowing from '#models/borrowing'
import { DateTime } from 'luxon'
import nodemailer, { Transporter } from 'nodemailer'

export default class AppProvider {
    constructor(protected app: ApplicationService) { }

    // สร้าง Email Transport สำหรับการส่งอีเมล
    private createEmailTransport(): Transporter {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        })
    }

    // สร้าง HTML Template สำหรับอีเมลแจ้งเตือน
    private createEmailTemplate(borrowing: any): string {
        return `
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
    }

    // ฟังก์ชันหลักสำหรับการส่งอีเมลแจ้งเตือน
    private async sendOverdueNotifications(transporter: Transporter) {
        try {
            // ตรวจสอบการเชื่อมต่อ SMTP
            await transporter.verify()
            // ดึงข้อมูลหนังสือที่เกินกำหนด
            const overdueBorrowings = await Borrowing.query()
                .whereNull('return_date')
                .where('due_date', '<', DateTime.now().toSQL())
                .preload('user')
                .preload('book')

            // ส่งอีเมลแจ้งเตือนแต่ละรายการ
            for (const borrowing of overdueBorrowings) {
                try {
                    await transporter.sendMail({
                        from: process.env.MAIL_USERNAME,
                        to: borrowing.user.email,
                        subject: 'แจ้งเตือนหนังสือเกินกำหนดส่ง - ห้องสมุด',
                        html: this.createEmailTemplate(borrowing)
                    })
                } catch (emailError) {
                    console.error(`ไม่สามารถส่งอีเมลไปยัง ${borrowing.user.email}:`, emailError)
                }
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error)
        }
    }

    // ตั้งค่าและเริ่ม Cron Job
    private setupCronJob(transporter: Transporter) {
        const job = cron.schedule('0 23 * * *', async () => {
            console.log('Cron job ทำงาน:', new Date().toLocaleString())
            await this.sendOverdueNotifications(transporter)
        }, {
            scheduled: true,
            timezone: "Asia/Bangkok"
        })
        return job
    }

    public async boot() {
        // สร้าง email transport
        const transporter = this.createEmailTransport()
        
        // ตั้งค่าและเริ่ม cron job
        const job = this.setupCronJob(transporter)
        
        // รันครั้งแรกทันที
        await this.sendOverdueNotifications(transporter)
    }
}
