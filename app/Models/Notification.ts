import {column, scope} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from "App/Models/CommonModel";
import {HttpContext} from "@adonisjs/core/build/standalone";

export default class Notification extends CommonModel {
  public static TYPES = {
    USER: 10
  }

  public static STATUS = {
    ENABLED: 1,
    DISABLED: 0
  }

  public static NOTIFICATION_REF_TYPE = {
    MENU_MANAGEMENT :10,
    DEAL_COMBO: 11,
    ORDER_MANAGEMENT :20,
    PAYMENT: 21,
    PROMO: 22,
    TABLE : 23,
    DISCOUNT: 24,
    DINE_IN_ORDER: 25,
    TAKEAWAY_ORDER: 26,
    ONLINE_ORDER: 27,
    DELIVERY_ORDER: 28,
    REPORTS :30,
    USER_MANAGEMENT :40,
    SETTINGS :50,
    MODIFIERS :60,
    ROLE_MANAGEMENT :70,
    RESTAURANT_MANAGEMENT: 80,
    PRINTER: 90
  }

  @column({isPrimary: true})
  public id: number
  @column()
  public notifiableId: number
  @column()
  public title: string
  @column()
  public message: string
  @column()
  public refId: number
  @column()
  public type: number
  @column()
  public readAt: string
  @column()
  public extra: string
  @column()
  public image: string


  /*
  * ######################### RELATIONS ##########################
  * */


  /*
  * ######################### SCOPES ##########################
  * */
  public static authFilter = scope((query) => {
    const ctx: any = HttpContext.get()
    let userId = ctx.auth?.user?.id
    let unRead = ctx.request.input('unread', null)
    let read = ctx.request.input('read', null)

    if (userId) {
      query.where('notifiable_id', userId)
    }
    if (unRead) {
      // @ts-ignore
      query.where('read_at', null)
    }
    if (read) {
      // @ts-ignore
      query.whereNot('read_at', null)
    }
  })

  /*
  * ######################### HOOKS ##########################
  * */
}
