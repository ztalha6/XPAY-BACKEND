import {column} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'

export default class PaymentOrderItem extends CommonModel {
  @column({isPrimary:true})
  public id: number
  @column()
  public paymentId: number
  @column()
  public name: string
  @column()
  public price: number
  @column()
  public qty: number
  @column()
  public extra: string


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
