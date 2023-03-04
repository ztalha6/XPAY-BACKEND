import {column} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'

export default class GuestUser extends CommonModel {
  @column({isPrimary:true})
  public id: number
  @column()
  public verificationCode: string | null
  @column()
  public phone: string


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
