import {column, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import PaymentOrderItem from 'App/Models/PaymentOrderItem'

export default class Payment extends CommonModel {
  @column({isPrimary:true})
  public id: number
  @column()
  public paymentIntentId: string
  @column()
  public paymentMethodId: string
  @column()
  public amount: number
  @column()
  public guestUserId: number
  @column()
  public status: string
  @column()
  public userId: number
  @column()
  public vendorId: number


  /*
  * ######################### RELATIONS ##########################
  * */
  @hasMany(() => PaymentOrderItem)
  public payment_order_items: HasMany<typeof PaymentOrderItem>



  /*
  * ######################### SCOPES ##########################
  * */



  /*
  * ######################### HOOKS ##########################
  * */
}
