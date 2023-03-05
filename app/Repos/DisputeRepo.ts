import BaseRepo from 'App/Repos/BaseRepo'
import Dispute from 'App/Models/Dispute'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import Database from '@ioc:Adonis/Lucid/Database'
import Attachment from 'App/Models/Attachment'
import constants from 'Config/constants'
import {HttpContext} from '@adonisjs/core/build/standalone'


class DisputeRepo extends BaseRepo {
  model

  constructor() {
    const relations = ['dispute_media']
    const scopes = []
    super(Dispute, relations, scopes)
    this.model = Dispute
  }

  async index(
    orderByColumn = constants.ORDER_BY_COLUMN,
    orderByValue = constants.ORDER_BY_VALUE,
    page = 1,
    perPage = constants.PER_PAGE,
    pagination=true
  ) {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    const relations = ctx.request.input('relations',[])
    const disputeStatus = ctx.request.input('dispute_status',null)
    let query = this.model.query()
    query.whereHas('payment',(paymentQB) => {
      paymentQB.where('vendor_id',user.id)
    })

    /*Filter by DISPUTE STATUS*/
    if (disputeStatus) {
      query.whereIn('dispute_status', disputeStatus)
    }

    for (let relation of [...this.relations, ...relations]) query.preload(relation)
    for (let scope of this.scopes) query.withScopes((scopeBuilder) => scopeBuilder[scope].call())
    if (pagination){
      return await query.orderBy(orderByColumn, orderByValue).paginate(page, perPage)
    }else{
      return await query.orderBy(orderByColumn, orderByValue)
    }
  }

  async store(input, request ?: RequestContract, _instanceType?: number, _deleteOldMedia = false, _trx?: any) {

    const dispute: Dispute = await Database.transaction(async (trx) => {
      const row: Dispute = await this.model.create(input, {client: trx})
      if (request?.input('dispute_media', null)) {
        let disputeMedia: any[] = []
        for (let media of request?.input('dispute_media', [])) {
          disputeMedia.push({
            path: media.path,
            instanceType: Attachment.TYPE.DISPUTE,
            mimeType: media.type,
          })
        }
        await row.related('dispute_media').createMany([...disputeMedia])
      }

      return row
    })


    return this.show(dispute.id)
  }
}

export default new DisputeRepo()
