import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import NotificationRepo from "App/Repos/NotificationRepo";
import NotificationValidator from "App/Validators/NotificationValidator";
import Attachment from "App/Models/Attachment";
import Notification from "App/Models/Notification";


export default class NotificationController extends ApiBaseController {

  constructor() {
    super(NotificationRepo)
  }

  async store(ctx: HttpContextContract, instanceType?: number) {
    await super.validateBody(ctx,NotificationValidator)
    let input = ctx.request.only(this.repo.fillables())
    let row = await NotificationRepo.store(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
    return this.apiResponse('Record Added Successfully', row)
  }

  async update(ctx: HttpContextContract, instanceType?: number): Promise<{ data: any; message: string; status: boolean }> {
    await super.validateBody(ctx,NotificationValidator)
    return super.update(ctx, instanceType)
  }

  async markRead(ctx: HttpContextContract) {
    await NotificationRepo.model.query().where('id', ctx.request.param('id')).update({
      read_at: new Date()
    })
    let notification = await NotificationRepo.show(ctx.request.param('id'))
    return this.apiResponse("Marked Read Successfully!", notification)
  }

  async markAllRead(ctx: HttpContextContract) {
    await NotificationRepo.model.query().where({
      notifiable_id: ctx.auth?.user?.id,
      read_at: null
    }).update({
      read_at: new Date()
    })
    return this.apiResponse("Marked All Read Successfully!", {})
  }

  async unreadCount(ctx: HttpContextContract) {
    let count = await NotificationRepo.model.query().where({
      notifiable_id: ctx.auth?.user?.id,
      read_at: null
    }).count('id as unread_count')
    return this.apiResponse("Unread Count", count[0].$extras)
  }

  async test(){
    await NotificationRepo.sendPOSNotification(4, "Test Push", "Hey you have a new order!", 10, Notification.NOTIFICATION_REF_TYPE.ORDER)
    return this.apiResponse("notificaiton test succesful")
  }
}
