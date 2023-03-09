import {column, HasOne, hasOne} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import Attachment from 'App/Models/Attachment'

export default class UserBusinessDetail extends CommonModel {
  @column({isPrimary:true})
  public id: number
  @column()
  public businessName: string
  @column()
  public businessAddress: string
  @column()
  public bankAccountNumber: string
  @column()
  public bankRoutingNumber: string
  @column()
  public websiteUrl: string
  @column()
  public taxIdNumber: string
  @column()
  public apiKey: string
  @column()
  public userId: number


  /*
  * ######################### RELATIONS ##########################
  * */
  @hasOne(() => Attachment, {
    foreignKey: 'instanceId',
    onQuery: (query) => query.where({instanceType: Attachment.TYPE.USER_BUSINESS_DETAIL}).orderBy('id', 'desc'),
  })
  public user_business_image: HasOne<typeof Attachment>



  /*
  * ######################### SCOPES ##########################
  * */



  /*
  * ######################### HOOKS ##########################
  * */
}
