import {column} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'

export default class Module extends CommonModel {
  public serializeExtras = true

  @column({isPrimary:true})
  public id: number
  @column()
  public name: string

  static ITEMS = {
    DISPUTE_MANAGEMENT :10,
    PAYMENT: 20,
    REPORTS :30,
    USER_MANAGEMENT :40,
    ROLE_MANAGEMENT :50,
  }




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
