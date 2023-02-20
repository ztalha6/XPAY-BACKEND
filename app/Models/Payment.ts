import {column} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'

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
  public status: string
  @column()
  public lastPaymentError: string
  @column()
  public userId: number
  @column()
  public vendorId: number


  /*
  * ######################### RELATIONS ##########################
  * */




  /*
  * ######################### SCOPES ##########################
  * */



  /*
  * ######################### HOOKS ##########################
  * */
}
