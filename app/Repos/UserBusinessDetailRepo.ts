import BaseRepo from 'App/Repos/BaseRepo'
import UserBusinessDetail from 'App/Models/UserBusinessDetail'
import constants from 'Config/constants'
import {HttpContext} from '@adonisjs/core/build/standalone'


class UserBusinessDetailRepo extends BaseRepo {
    model

    constructor() {
        const relations = []
        const scopes = []
        super(UserBusinessDetail, relations, scopes)
        this.model = UserBusinessDetail
    }

  async index(
    orderByColumn = constants.ORDER_BY_COLUMN,
    orderByValue = constants.ORDER_BY_VALUE,
    page = 1,
    perPage = constants.PER_PAGE,
    pagination=true
  ) {
    const ctx: any = HttpContext.get()
    const relations = ctx.request.input('relations',[])
    let query = this.model.query().select('id','business_name','business_address','website_url')
    for (let relation of [...this.relations, ...relations]) query.preload(relation)
    for (let scope of this.scopes) query.withScopes((scopeBuilder) => scopeBuilder[scope].call())
    if (pagination){
      return await query.orderBy(orderByColumn, orderByValue).paginate(page, perPage)
    }else{
      return await query.orderBy(orderByColumn, orderByValue)
    }
  }
}

export default new UserBusinessDetailRepo()
