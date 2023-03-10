import {BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import PaymentOrderItem from 'App/Models/PaymentOrderItem'
import GuestUser from 'App/Models/GuestUser'
import UserBusinessDetail from 'App/Models/UserBusinessDetail'
import Dispute from 'App/Models/Dispute'

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
  public vendorId: number


  /*
  * ######################### RELATIONS ##########################
  * */
  @hasMany(() => PaymentOrderItem)
  public payment_order_items: HasMany<typeof PaymentOrderItem>

  @belongsTo(() => GuestUser)
  public guest_user: BelongsTo<typeof GuestUser>

  @belongsTo(() => UserBusinessDetail,{
    localKey: 'userId',
    foreignKey: 'vendorId',
  })
  public vendor_business_detail: BelongsTo<typeof UserBusinessDetail>

  @hasOne(() => Dispute)
  public dispute: HasOne<typeof Dispute>



  /*
  * ######################### SCOPES ##########################
  * */



  /*
  * ######################### HOOKS ##########################
  * */
}
