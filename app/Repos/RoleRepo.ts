import BaseRepo from 'App/Repos/BaseRepo'
import Role from 'App/Models/Role'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import constants from 'Config/constants'
import Database, {SimplePaginatorContract} from '@ioc:Adonis/Lucid/Database'
import {HttpContext} from '@adonisjs/core/build/standalone'


class RoleRepo extends BaseRepo {
  model

  constructor() {
    const relations = ['permissions']
    const scopes = []
    super(Role, relations, scopes)
    this.model = Role
  }

  async restaurantRoles(orderByColumn: string = constants.ORDER_BY_COLUMN, orderByValue: string = constants.ORDER_BY_VALUE, page: number = 1, perPage: number = constants.PER_PAGE, establishmentId?:number): Promise<SimplePaginatorContract<any>> {
    let query = this.model.query()
    query.where('id','>',Role.TYPES.ESTABLISHMENT_LEVEL)
    //todo: In the following line, We need to add a check where the establishment should linked with the restaurant via middleware
    if (establishmentId) query.where({establishment_id: establishmentId})
    for (let relation of this.relations) query.preload(relation)
    for (let scope of this.scopes) query.withScopes((scopeBuilder) => scopeBuilder[scope].call())
    return await query.orderBy(orderByColumn, orderByValue).paginate(page, perPage)
  }

  async index(orderByColumn: string = constants.ORDER_BY_COLUMN, orderByValue: string = constants.ORDER_BY_VALUE, page: number = 1, perPage: number = constants.PER_PAGE, pagination:boolean=true): Promise<SimplePaginatorContract<any>> {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    const establishmentIdParams = ctx.request.input('establishment_id', null)



    let query = this.model.query()

    query.where('id','>',Role.TYPES.ESTABLISHMENT_LEVEL)
    const establishmentId = user.establishmentId || ctx.request.input('establishment_id',null)

    if (establishmentId) {
      /*For Employee level user*/
      query.where({
        'establishment_id': establishmentId,
      })
    }else{
      if (establishmentIdParams){
        /*For Restaurant Admin, to change the establishment*/
        query.where({establishment_id: establishmentIdParams})
      }
    }


    //todo: In the following line, We need to add a check where the establishment should linked with the restaurant via middleware

    for (let relation of this.relations) query.preload(relation)
    for (let scope of this.scopes) query.withScopes((scopeBuilder) => scopeBuilder[scope].call())
    if (pagination){
      return await query.orderBy(orderByColumn, orderByValue).paginate(page, perPage)
    }else{
      return await query.orderBy(orderByColumn, orderByValue)
    }

  }

  async store(input, request?: RequestContract, _instanceType?: number, _deleteOldMedia: boolean = false): Promise<InstanceType<any>> {


    // Saving Record
    const role:Role = await Database.transaction(async (trx)=>{
      let row:Role = await this.model.create(input, {client: trx})

      //Adding permissions
      const permissions = request?.input('permissions')
      const relatedData = {}
      for (const permission of permissions){
        relatedData[permission.module_id] = {
          create: permission.create,
          update: permission.update,
          read: permission.read,
          delete: permission.delete,
        }
      }
      await row.related('permissions').sync(relatedData)

      return row
    })

    return this.show(role.id)
  }

  async update(id: number, input, request?: RequestContract, instanceType?: number, deleteOldMedia: boolean = false, _trx?: any): Promise<InstanceType<any>> {

    // Edit Record
    const role:Role = await Database.transaction(async (trx)=>{
      let row:Role = await super.update(id,input,request,instanceType,deleteOldMedia,trx)

      //Adding permissions
      const permissions = request?.input('permissions')
      const relatedData = {}
      for (const permission of permissions){
        relatedData[permission.module_id] = {
          create: permission.create,
          update: permission.update,
          read: permission.read,
          delete: permission.delete,
        }
      }
      await row.related('permissions').sync(relatedData)

      return row
    })

    return this.show(role.id)
  }


}
export default new RoleRepo()
