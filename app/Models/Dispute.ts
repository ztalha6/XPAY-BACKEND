import {BelongsTo, belongsTo, column, computed, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import Attachment from 'App/Models/Attachment'
import Payment from 'App/Models/Payment'

export default class Dispute extends CommonModel {

  static DISPUTE_STATUS = {
    OPENED: 10,
    APPROVED: 20,
    REJECTED: 30,
  }

  @column({isPrimary:true})
  public id: number
  @column()
  public comments: string
  @column()
  public disputeStatus: number
  @column()
  public paymentId: number


  @computed()
  public get dispute_status_text() {
    switch (this.disputeStatus) {
      case Dispute.DISPUTE_STATUS.OPENED:
        return 'Opened'
      case Dispute.DISPUTE_STATUS.APPROVED:
        return 'Approved'
      case Dispute.DISPUTE_STATUS.REJECTED:
        return 'Rejected'
    }
  }


  /*
  * ######################### RELATIONS ##########################
  * */

  /*Multiple*/
  @hasMany(() => Attachment, {
    foreignKey: 'instanceId',
    onQuery: (query) => query.where({instanceType: Attachment.TYPE.DISPUTE}),
  })
  public dispute_media: HasMany<typeof Attachment>

  @belongsTo(() => Payment)
  public payment: BelongsTo<typeof Payment>



  /*
  * ######################### SCOPES ##########################
  * */



  /*
  * ######################### HOOKS ##########################
  * */
}
